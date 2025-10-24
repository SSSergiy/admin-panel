'use client';

import DynamicFormRenderer from '@/components/DynamicFormRenderer';
import { parseJsonTemplate } from '@/lib/parser';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Section {
  id: string;
  type: string;
  values: Record<string, any>;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

interface AdminConfig {
  fieldTypes: {
    [key: string]: {
      name: string;
      description: string;
      type: string;
      'x-widget'?: string;
      component?: string;
      format?: string;
      properties?: Record<string, any>;
      required?: string[];
      enum?: string[];
    };
  };
}

export default function EditSectionPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  const sectionId = params.sectionId as string;
  
  const [page, setPage] = useState<Page | null>(null);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && user && pageId && sectionId) {
      loadData();
    }
  }, [isLoaded, user, pageId, sectionId]);

  const loadData = async () => {
    try {
      // Сначала пробуем загрузить section.json
      const sectionTemplateResponse = await fetch('/api/files/get?file=section.json');
      
      if (sectionTemplateResponse.ok) {
        const sectionTemplate = await sectionTemplateResponse.json();
        
        // Загружаем content.json для получения данных секции
        const contentResponse = await fetch('/api/files/get?file=content.json');
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          const pages = contentData.pages || {};
          const currentPage = pages[pageId];
          
          if (currentPage) {
            const currentSection = currentPage.sections.find((s: Section) => s.id === sectionId);
            
            if (currentSection) {
              // Парсим шаблон с данными секции
              const data = {
                SectionId: currentSection.id,
                SectionType: currentSection.type,
                SectionName: currentSection.type, // Используем тип как имя
                SectionDescription: `Секция типа ${currentSection.type}`,
                SectionFields: Object.keys(currentSection.values || {}).join(', '),
                SectionItems: Object.values(currentSection.values || {}).join(', ')
              };
              
              // Парсим шаблон секции
              try {
                const parsedSection = parseJsonTemplate(JSON.stringify(sectionTemplate), data);
                
                // Объединяем парсированные данные с реальными данными
                const finalSection = {
                  ...parsedSection,
                  values: currentSection.values || {}
                };
                
                // Обновляем секцию в странице
                const updatedSections = currentPage.sections.map((section: Section) =>
                  section.id === sectionId ? finalSection : section
                );
                
                const finalPage = {
                  ...currentPage,
                  sections: updatedSections
                };
                
                setPage(finalPage);
              } catch (parseError) {
                console.error('Ошибка парсинга шаблона секции:', parseError);
                // Fallback к данным из content.json
                setPage(currentPage);
              }
            } else {
              router.push(`/dashboard/pages/${pageId}/edit`);
              return;
            }
          } else {
            router.push('/dashboard/pages');
            return;
          }
        }
      } else {
        // Fallback к content.json
        const contentResponse = await fetch('/api/files/get?file=content.json');
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          const pages = contentData.pages || {};
          const currentPage = pages[pageId];
          if (currentPage) {
            setPage(currentPage);
          } else {
            router.push('/dashboard/pages');
            return;
          }
        }
      }

      // Загружаем конфигурацию типов
      const typeResponse = await fetch('/api/files/get?file=field-types.json');
      if (typeResponse.ok) {
        const typeData = await typeResponse.json();
        setAdminConfig(typeData);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: Record<string, any>) => {
    if (!page) return;

    setSaving(true);
    try {
      // Обновляем секцию
      const updatedSections = page.sections.map(section =>
        section.id === sectionId ? { ...section, values } : section
      );
      
      const updatedPage = { ...page, sections: updatedSections };

      // Получаем все страницы и обновляем нужную
      const response = await fetch('/api/files/get?file=content.json');
      let contentData: { pages: Record<string, any> } = { pages: {} };
      
      if (response.ok) {
        contentData = await response.json();
      }
      
      contentData.pages[pageId] = updatedPage;

      await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'content.json',
          content: contentData
        })
      });

      alert('Секция сохранена успешно!');
      router.push(`/dashboard/pages/${pageId}/edit`);
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Ошибка при сохранении секции');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Страница не найдена</h1>
          <Link href="/dashboard/pages" className="gradient-button">
            Вернуться к списку
          </Link>
        </div>
      </div>
    );
  }

  const section = page.sections.find(s => s.id === sectionId);
  
  // Создаем конфигурацию секции на основе парсинга section.json
  let sectionConfig = null;
  if (section) {
    // Создаем базовую схему для секции на основе её значений
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    // Анализируем значения секции и создаем схему
    Object.entries(section.values || {}).forEach(([key, value]) => {
      let fieldType = 'text';
      let title = key;
      
      // Определяем тип поля на основе ключа и значения
      if (key.toLowerCase().includes('image') || key.toLowerCase().includes('photo')) {
        fieldType = 'image';
      } else if (key.toLowerCase().includes('link') || key.toLowerCase().includes('url')) {
        fieldType = 'url';
      } else if (key.toLowerCase().includes('email')) {
        fieldType = 'email';
      } else if (key.toLowerCase().includes('description') || key.toLowerCase().includes('text')) {
        fieldType = 'textarea';
      } else if (typeof value === 'number') {
        fieldType = 'number';
      } else if (typeof value === 'boolean') {
        fieldType = 'boolean';
      }
      
      properties[key] = {
        type: fieldType,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        description: `Поле ${title}`
      };
      
      // Делаем обязательными основные поля
      if (key.toLowerCase().includes('title') || key.toLowerCase().includes('name')) {
        required.push(key);
      }
    });
    
    sectionConfig = {
      name: section.type.charAt(0).toUpperCase() + section.type.slice(1),
      description: `Секция типа ${section.type}`,
      schema: {
        type: 'object',
        properties,
        required
      }
    };
  }

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Секция не найдена</h1>
          <p className="text-gray-400 mb-4">ID секции: {sectionId}</p>
          <p className="text-gray-400 mb-4">Доступные секции: {page.sections.map(s => s.id).join(', ')}</p>
          <Link href={`/dashboard/pages/${pageId}/edit`} className="gradient-button">
            Вернуться к странице
          </Link>
        </div>
      </div>
    );
  }

  if (!sectionConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Конфигурация секции не найдена</h1>
          <p className="text-gray-400 mb-4">Тип секции: {section.type}</p>
          <Link href={`/dashboard/pages/${pageId}/edit`} className="gradient-button">
            Вернуться к странице
          </Link>
        </div>
      </div>
    );
  }

  const fields = sectionConfig ? Object.entries(sectionConfig.schema.properties || {}).map(([key, config]: [string, any]) => ({
    name: key,
    type: config.type || 'text',
    title: config.title || key,
    description: config.description,
    required: sectionConfig.schema.required?.includes(key) || false,
    options: config.enum
  })) : [];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Редактирование секции</h1>
              <p className="text-gray-400">{sectionConfig?.name || section?.type || 'Секция'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/pages/${pageId}/edit`} className="button button-secondary">
                <ArrowLeft className="inline-block w-5 h-5 mr-2" />
                Назад к странице
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Хлебные крошки */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-400">
              <span>📁</span>
              <span>/</span>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Дашборд
              </Link>
              <span>/</span>
              <Link href="/dashboard/pages" className="hover:text-white transition-colors">
                Страницы
              </Link>
              <span>/</span>
              <Link href={`/dashboard/pages/${pageId}/edit`} className="hover:text-white transition-colors">
                {page.title}
              </Link>
              <span>/</span>
              <span className="text-white">{sectionConfig?.name || section?.type || 'Секция'}</span>
            </nav>
          </div>

          {/* Описание секции */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">{sectionConfig?.name || section?.type || 'Секция'}</h2>
            <p className="text-gray-400">{sectionConfig?.description || `Секция типа ${section?.type}`}</p>
          </div>

          {/* Форма редактирования */}
          <div className="card">
            <DynamicFormRenderer
              fields={fields}
              initialValues={section.values || {}}
              onSubmit={handleSave}
            />
          </div>
        </div>
      </main>
    </div>
  );
}