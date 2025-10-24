'use client';

import { parseJsonTemplate } from '@/lib/parser';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Edit, Eye, Save } from 'lucide-react';
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
  sectionTypes: {
    [key: string]: {
      name: string;
      description: string;
      schema: {
        type: string;
        properties: Record<string, any>;
      };
    };
  };
}

export default function EditPagePage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  
  const [page, setPage] = useState<Page | null>(null);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && user && pageId) {
      loadData();
    }
  }, [isLoaded, user, pageId]);

  const loadData = async () => {
    try {
      // Сначала пробуем загрузить page.{{PageId}}.json
      const pageTemplateResponse = await fetch(`/api/files/get?file=page.{{PageId}}.json`);
      
      if (pageTemplateResponse.ok) {
        const pageTemplate = await pageTemplateResponse.json();
        
        // Парсим шаблон с данными из content.json
        const contentResponse = await fetch('/api/files/get?file=content.json');
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          const pages = contentData.pages || {};
          const currentPage = pages[pageId];
          
          if (currentPage) {
            // Парсим шаблон с данными страницы
            const data = {
              PageId: currentPage.id,
              PageTitle: currentPage.title,
              SectionId: currentPage.sections?.[0]?.id || 'section1',
              SectionType: currentPage.sections?.[0]?.type || 'text',
              FieldName: Object.keys(currentPage.sections?.[0]?.values || {})[0] || 'content',
              FieldValue: Object.values(currentPage.sections?.[0]?.values || {})[0] || ''
            };
            
            // Парсим шаблон с данными страницы
            try {
              const parsedPage = parseJsonTemplate(JSON.stringify(pageTemplate), data);
              
              // Объединяем парсированные данные с реальными данными из content.json
              const finalPage = {
                ...parsedPage,
                slug: currentPage.slug, // Добавляем slug из content.json
                sections: currentPage.sections || []
              };
              
              setPage(finalPage);
            } catch (parseError) {
              console.error('Ошибка парсинга шаблона:', parseError);
              // Fallback к данным из content.json
              setPage(currentPage);
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

  const handleSave = async () => {
    if (!page) return;

    setSaving(true);
    try {
      // Получаем все страницы и обновляем нужную
      const response = await fetch('/api/files/get?file=content.json');
      let contentData = { pages: {} };
      
      if (response.ok) {
        contentData = await response.json();
      }
      
      contentData.pages[pageId] = page;

      await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'content.json',
          content: contentData
        })
      });

      alert('Страница сохранена успешно!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Ошибка при сохранении страницы');
    } finally {
      setSaving(false);
    }
  };

  const updatePage = (updates: Partial<Page>) => {
    if (page) {
      setPage({ ...page, ...updates });
    }
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (page) {
      const updatedSections = page.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      );
      setPage({ ...page, sections: updatedSections });
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
              <h1 className="text-2xl font-bold text-white">Редактирование страницы</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/pages" className="button button-secondary">
                <ArrowLeft className="inline-block w-5 h-5 mr-2" />
                В дашборд
              </Link>
              <button 
                onClick={() => window.open(page.slug, '_blank')}
                className="gradient-button flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Просмотр</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="gradient-button flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
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

          {/* Основная информация о странице */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Основная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название страницы
                </label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => updatePage({ title: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL страницы
                </label>
                <input
                  type="text"
                  value={page.slug}
                  onChange={(e) => updatePage({ slug: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Секции страницы */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Секции страницы</h2>
              <Link
                href={`/dashboard/pages/${pageId}/sections`}
                className="button button-secondary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Управление секциями
              </Link>
            </div>

            {page.sections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Нет секций</p>
                <Link
                  href={`/dashboard/pages/${pageId}/sections`}
                  className="gradient-button"
                >
                  Добавить секции
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {page.sections.map((section, index) => {
                  const sectionConfig = adminConfig?.sectionTypes?.[section.type];
                  return (
                    <div key={section.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-400">#{index + 1}</span>
                          <h3 className="font-medium text-white">{sectionConfig?.name || section.type}</h3>
                        </div>
                        <Link
                          href={`/dashboard/pages/${pageId}/sections/${section.id}/edit`}
                          className="button button-secondary text-sm"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Редактировать
                        </Link>
                      </div>
                      <div className="text-sm text-gray-400">
                        {sectionConfig?.schema?.properties ? (
                          Object.keys(sectionConfig.schema.properties).map(key => {
                            const value = section.values?.[key];
                            if (value && typeof value === 'string' && value.length > 0) {
                              return (
                                <p key={key}>
                                  {sectionConfig.schema.properties[key].title || key}: {value.length > 100 ? value.substring(0, 100) + '...' : value}
                                </p>
                              );
                            }
                            return null;
                          })
                        ) : (
                          <p></p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
