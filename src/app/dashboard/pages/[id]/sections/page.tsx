'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Edit, Eye, GripVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Section {
  id: string;
  type: string;
  enabled: boolean;
  [key: string]: any;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

// Динамические типы секций будут загружаться из admin.config.json

export default function PageSectionsPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  
  const [page, setPage] = useState<Page | null>(null);
  const [sectionTypes, setSectionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user && pageId) {
      loadPage();
      loadSectionTypes();
    }
  }, [isLoaded, user, pageId]);

  const loadPage = async () => {
    try {
      const response = await fetch('/api/files/get?file=pages.json');
      if (response.ok) {
        const data = await response.json();
        const pages = data.data || [];
        const currentPage = pages.find((p: Page) => p.id === pageId);
        if (currentPage) {
          setPage(currentPage);
        } else {
          router.push('/dashboard/pages');
        }
      }
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAdminConfig = async () => {
    try {
      await fetch('/api/files/init-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      // После создания конфига перезагружаем типы секций
      setTimeout(() => loadSectionTypes(), 1000);
    } catch (error) {
      console.error('Error creating admin config:', error);
    }
  };

  const loadSectionTypes = async () => {
    try {
      // Загружаем существующие секции и извлекаем уникальные типы
      const response = await fetch('/api/files/get?file=pages.json');
      if (response.ok) {
        const data = await response.json();
        const pages = Array.isArray(data.data) ? data.data : [];
        
        // Собираем все уникальные типы секций из всех страниц
        const allSectionTypes = new Set<string>();
        pages.forEach((page: Page) => {
          if (Array.isArray(page.sections)) {
            page.sections.forEach((section: Section) => {
              if (section.type) {
                allSectionTypes.add(section.type);
              }
            });
          }
        });
        
        // Преобразуем в массив с базовыми иконками
        const sectionTypesData = Array.from(allSectionTypes).map((type: string) => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.slice(1), // Первая буква заглавная
          icon: getIconForType(type)
        }));
        
        setSectionTypes(sectionTypesData);
      } else {
        // Если файл не найден, создаем его автоматически
        await createDefaultAdminConfig();
        setSectionTypes([]); // Пустой массив, будет загружен после создания конфига
      }
    } catch (error) {
      console.error('Error loading section types:', error);
      setSectionTypes([]); // Пустой массив при ошибке
    }
  };

  const getIconForType = (type: string): string => {
    // Полностью динамическая генерация иконки на основе типа
    const hash = type.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Генерируем код иконки на основе хеша
    const baseCode = 0x1F300; // Начальный код для эмодзи
    const iconCode = baseCode + (Math.abs(hash) % 100); // 100 различных иконок
    
    return String.fromCodePoint(iconCode);
  };

  const addCustomSection = () => {
    const customType = prompt('Введите название типа секции (например: "products", "services", "team"):');
    if (customType && customType.trim()) {
      const cleanType = customType.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      addSection(cleanType);
    }
  };

  const addSection = async (type: string) => {
    if (!page) return;

    const newSection: Section = {
      id: `section_${Date.now()}`,
      type,
      enabled: true,
      heading: '',
      subheading: '',
      content: '',
    };

    const updatedPage = {
      ...page,
      sections: [...page.sections, newSection]
    };

    try {
      // Получаем все страницы и обновляем нужную
      const response = await fetch('/api/files/get?file=pages.json');
      let allPages = [];
      
      if (response.ok) {
        const data = await response.json();
        allPages = Array.isArray(data.data) ? data.data : [];
      }
      
      const updatedPages = allPages.map((p: Page) => p.id === pageId ? updatedPage : p);

      await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'pages.json',
          data: updatedPages
        })
      });
      setPage(updatedPage);
      // Обновляем список типов секций после добавления новой
      loadSectionTypes();
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!page || !confirm('Удалить секцию?')) return;

    const updatedPage = {
      ...page,
      sections: page.sections.filter(s => s.id !== sectionId)
    };

    try {
      // Получаем все страницы и обновляем нужную
      const response = await fetch('/api/files/get?file=pages.json');
      let allPages = [];
      
      if (response.ok) {
        const data = await response.json();
        allPages = Array.isArray(data.data) ? data.data : [];
      }
      
      const updatedPages = allPages.map((p: Page) => p.id === pageId ? updatedPage : p);

      await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'pages.json',
          data: updatedPages
        })
      });
      setPage(updatedPage);
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const toggleSection = async (sectionId: string) => {
    if (!page) return;

    const updatedPage = {
      ...page,
      sections: page.sections.map(s => 
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      )
    };

    try {
      // Получаем все страницы и обновляем нужную
      const response = await fetch('/api/files/get?file=pages.json');
      let allPages = [];
      
      if (response.ok) {
        const data = await response.json();
        allPages = Array.isArray(data.data) ? data.data : [];
      }
      
      const updatedPages = allPages.map((p: Page) => p.id === pageId ? updatedPage : p);

      await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'pages.json',
          data: updatedPages
        })
      });
      setPage(updatedPage);
    } catch (error) {
      console.error('Error toggling section:', error);
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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Секции страницы</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/pages" className="button button-secondary">
                <ArrowLeft className="inline-block w-5 h-5 mr-2" />
                В дашборд
              </Link>
              <button 
                onClick={() => window.open(`/${page.slug}`, '_blank')}
                className="gradient-button flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Просмотр</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
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
              <span className="text-white">{page.title}</span>
            </nav>
          </div>
          {/* Add Section Buttons */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Добавить секцию</h2>
              <button
                onClick={() => addCustomSection()}
                className="button-secondary text-sm"
              >
                + Создать свой тип
              </button>
            </div>
            
            {sectionTypes.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-400 mb-4">Нет созданных типов секций</p>
                <p className="text-sm text-gray-500 mb-4">
                  Создайте первую секцию, чтобы добавить новый тип
                </p>
                <button
                  onClick={addCustomSection}
                  className="gradient-button"
                >
                  Создать первую секцию
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sectionTypes.map((sectionType) => (
                  <button
                    key={sectionType.value}
                    onClick={() => addSection(sectionType.value)}
                    className="card hover:bg-white/15 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{sectionType.icon}</span>
                      <div>
                        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {sectionType.label}
                        </h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Секции страницы</h2>
            {page.sections.length === 0 ? (
              <div className="card text-center py-12">
                <h3 className="text-lg font-semibold text-white mb-2">Нет секций</h3>
                <p className="text-gray-400">Добавьте секции для создания контента страницы</p>
              </div>
            ) : (
              page.sections.map((section, index) => {
                const sectionType = sectionTypes.find(st => st.value === section.type);
                return (
                  <div 
                    key={section.id} 
                    className={`card ${!section.enabled ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-700 rounded-lg">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{sectionType?.icon || '📄'}</span>
                          <div>
                            <h3 className="font-medium text-white">
                              {sectionType?.label || section.type}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {section.heading || 'Без заголовка'}
                            </p>
                            {!sectionType && (
                              <p className="text-xs text-yellow-400">
                                Пользовательский тип
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            section.enabled 
                              ? 'bg-green-600/20 text-green-400' 
                              : 'bg-gray-600/20 text-gray-400'
                          }`}
                        >
                          {section.enabled ? 'Включена' : 'Отключена'}
                        </button>
                        
                        <Link
                          href={`/dashboard/pages/${pageId}/sections/${section.id}/edit`}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                          title="Редактировать секцию"
                        >
                          <Edit className="h-4 w-4 text-blue-400" />
                        </Link>
                        
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                          title="Удалить секцию"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
