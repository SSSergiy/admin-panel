'use client';

import DynamicSectionEditor from '@/components/DynamicSectionEditor';
import Sidebar from '@/components/Sidebar';
import { getFieldKey } from '@/lib/field-mapping';
import { FieldSchema, getAvailableSectionTypes, getSectionSchema } from '@/lib/section-schemas';
import { SiteConfig, SiteSection } from '@/types/site';
import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, Eye, GripVertical, Plus, Save, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const DEFAULT_SECTIONS: SiteSection[] = [
  {
    id: 'header',
    type: 'header',
    title: 'Шапка сайта',
    enabled: true,
    order: 1,
    data: {
      logo: '',
      navigation: [
        { label: 'Главная', href: '/' },
        { label: 'О нас', href: '/about' },
        { label: 'Услуги', href: '/services' },
        { label: 'Контакты', href: '/contact' }
      ],
      ctaButton: {
        text: 'Связаться',
        href: '/contact'
      }
    }
  },
  {
    id: 'hero',
    type: 'hero',
    title: 'Главный баннер',
    enabled: true,
    order: 2,
    data: {
      title: 'Добро пожаловать на наш сайт',
      subtitle: 'Мы создаем современные и функциональные веб-решения',
      ctaButton: {
        text: 'Начать работу',
        href: '/contact'
      },
      secondaryButton: {
        text: 'Узнать больше',
        href: '/about'
      }
    }
  },
  {
    id: 'about',
    type: 'about',
    title: 'О нас',
    enabled: true,
    order: 3,
    data: {
      title: 'О нашей компании',
      description: 'Мы команда профессионалов, которая создает качественные веб-решения для бизнеса любого масштаба.',
      features: [
        {
          icon: '🚀',
          title: 'Быстрая разработка',
          description: 'Создаем сайты за короткие сроки'
        },
        {
          icon: '💡',
          title: 'Современные технологии',
          description: 'Используем последние технологии'
        },
        {
          icon: '🎨',
          title: 'Красивый дизайн',
          description: 'Создаем привлекательные интерфейсы'
        }
      ]
    }
  },
  {
    id: 'services',
    type: 'services',
    title: 'Наши услуги',
    enabled: true,
    order: 4,
    data: {
      title: 'Что мы предлагаем',
      subtitle: 'Полный спектр услуг для вашего бизнеса',
      services: [
        {
          title: 'Веб-разработка',
          description: 'Создание сайтов и веб-приложений',
          icon: '💻',
          price: 'от 50,000₽',
          features: ['Адаптивный дизайн', 'SEO оптимизация', 'Техподдержка']
        },
        {
          title: 'Мобильные приложения',
          description: 'Разработка iOS и Android приложений',
          icon: '📱',
          price: 'от 100,000₽',
          features: ['Нативный код', 'Кроссплатформенность', 'Публикация в сторах']
        },
        {
          title: 'Дизайн',
          description: 'UI/UX дизайн для ваших проектов',
          icon: '🎨',
          price: 'от 30,000₽',
          features: ['Прототипирование', 'Брендинг', 'Анимации']
        }
      ]
    }
  },
  {
    id: 'contact',
    type: 'contact',
    title: 'Контакты',
    enabled: true,
    order: 5,
    data: {
      title: 'Свяжитесь с нами',
      subtitle: 'Готовы обсудить ваш проект?',
      email: 'info@example.com',
      phone: '+7 (999) 123-45-67',
      address: 'Москва, ул. Примерная, д. 1',
      socialLinks: [
        { platform: 'Telegram', url: 'https://t.me/example' },
        { platform: 'WhatsApp', url: 'https://wa.me/79991234567' }
      ]
    }
  },
  {
    id: 'footer',
    type: 'footer',
    title: 'Подвал сайта',
    enabled: true,
    order: 6,
    data: {
      logo: '',
      description: 'Создаем современные веб-решения для вашего бизнеса',
      links: [
        {
          title: 'Компания',
          links: [
            { label: 'О нас', href: '/about' },
            { label: 'Команда', href: '/team' },
            { label: 'Карьера', href: '/careers' }
          ]
        },
        {
          title: 'Услуги',
          links: [
            { label: 'Веб-разработка', href: '/services/web' },
            { label: 'Мобильные приложения', href: '/services/mobile' },
            { label: 'Дизайн', href: '/services/design' }
          ]
        }
      ],
      copyright: '© 2024 Ваша компания. Все права защищены.'
    }
  }
];

export default function BuilderPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<SiteSection | null>(null);
  const [editingData, setEditingData] = useState<Record<string, unknown> | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [config, setConfig] = useState<SiteConfig>({
    site: {
      title: '',
      description: '',
      logo: '',
      favicon: ''
    },
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      fontFamily: 'Inter'
    },
    sections: DEFAULT_SECTIONS,
    pages: []
  });

  useEffect(() => {
    const loadConfig = async () => {
      if (!isLoaded || !user) return;
      
      try {
        const response = await fetch('/api/files/get?filename=config.json');
        if (response.ok) {
          const { data } = await response.json();
          // Правильно мержим данные из config.json с дефолтными значениями
          const mergedSections = data.sections ? data.sections.map((section: SiteSection) => {
            const defaultSection = DEFAULT_SECTIONS.find(s => s.id === section.id);
            if (defaultSection) {
              // Мержим данные секции с дефолтными значениями
              return {
                ...defaultSection,
                ...section,
                data: {
                  ...defaultSection.data,
                  ...section.data
                }
              };
            }
            return section;
          }) : DEFAULT_SECTIONS;

          setConfig({
            site: data.site || {
              title: '',
              description: '',
              logo: '',
              favicon: ''
            },
            theme: data.theme || {
              primaryColor: '#3B82F6',
              secondaryColor: '#1E40AF',
              fontFamily: 'Inter'
            },
            sections: mergedSections,
            pages: data.pages || []
          });
        }
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [isLoaded, user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'config.json',
          data: config
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить конфигурацию');
      }

      alert('Конфигурация сохранена!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = async (sectionId: string) => {
    const section = config.sections.find(s => s.id === sectionId);
    if (!section) return;

    // Если включаем секцию, создаем для неё папку
    if (!section.enabled) {
      await ensureSectionFolder(section.type);
    }

    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section
      )
    }));
  };

  // const moveSection = (fromIndex: number, toIndex: number) => {
  //   setConfig(prev => {
  //     const newSections = [...prev.sections];
  //     const [movedSection] = newSections.splice(fromIndex, 1);
  //     newSections.splice(toIndex, 0, movedSection);
      
  //     return {
  //       ...prev,
  //       sections: newSections.map((section, index) => ({
  //         ...section,
  //         order: index + 1
  //       }))
  //     };
  //   });
  // };

  const handleEditSection = (section: SiteSection) => {
    setEditingSection(section);
    setEditingData(section.data);
  };

  const handleUpdateEditingData = (updatedData: Record<string, unknown>) => {
    setEditingData(updatedData);
  };

  const handleSaveSection = async () => {
    if (!editingSection || !editingData) return;
    
    // Обновляем локальный стейт
    const updatedConfig = {
      ...config,
      sections: config.sections.map(section =>
        section.id === editingSection.id
          ? { ...section, data: editingData }
          : section
      )
    };
    
    setConfig(updatedConfig);
    
    // Создаем папку для секции, если нужно
    await ensureSectionFolder(editingSection.type);
    
    // Сохраняем на сервер
    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'config.json',
          data: updatedConfig
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить изменения');
      }
      
      console.log('✅ Секция сохранена успешно');
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      alert('Ошибка сохранения секции');
    }
    
    setEditingSection(null);
    setEditingData(null);
  };

  // Создаем папку для конкретной секции
  const ensureSectionFolder = async (sectionType: string) => {
    const folderMap: Record<string, string> = {
      'header': 'logos',
      'hero': 'hero',
      'about': 'about',
      'services': 'services',
      'contact': 'general',
      'footer': 'general'
    };

    const folderName = folderMap[sectionType];
    if (!folderName) return;

    // Просто убеждаемся, что основная папка существует
    try {
      await fetch('/api/files/init-folders', { method: 'POST' });
    } catch {
      console.log(`Folders already exist or error creating them`);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditingData(null);
  };

  const handleAddSection = (sectionType: string) => {
    const schema = getSectionSchema(sectionType);
    if (!schema) return;

    const newSection: SiteSection = {
      id: `${sectionType}_${Date.now()}`,
      type: sectionType as 'header' | 'hero' | 'about' | 'services' | 'contact' | 'footer',
      title: schema.title,
      enabled: true,
      order: config.sections.length + 1,
      data: createDefaultDataFromSchema(schema.fields)
    };

    setConfig(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));

    setShowAddSection(false);
  };

  const createDefaultDataFromSchema = (fields: FieldSchema[]): Record<string, unknown> => {
    const data: Record<string, unknown> = {};
    
    
    fields.forEach(field => {
      const key = getFieldKey(field);
      
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'tel':
        case 'url':
        case 'image':
          data[key] = '';
          break;
        case 'array':
          data[key] = [];
          break;
        case 'object':
          data[key] = {};
          if (field.fields) {
            Object.assign(data[key] as Record<string, unknown>, createDefaultDataFromSchema(field.fields));
          }
          break;
        default:
          data[key] = '';
      }
    });
    
    return data;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Доступ запрещен</h1>
          <p className="text-gray-400">Пожалуйста, войдите в систему</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">Конструктор сайта</h1>
                  <p className="text-gray-400 text-sm mt-1">Создайте свой сайт с помощью визуального редактора</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="gradient-button flex items-center space-x-3 text-white font-semibold py-3 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Save className="h-5 w-5" />
                  <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
                <button className="glass flex items-center space-x-3 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-gray-800/50 transition-all duration-200">
                  <Eye className="h-5 w-5" />
                  <span>Предпросмотр</span>
                </button>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                      userButtonPopoverCard: "bg-gray-800 border-gray-700",
                      userButtonPopoverActionButton: "text-gray-300 hover:bg-gray-700",
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Sections List */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Секции сайта</h2>
                <button 
                  onClick={() => setShowAddSection(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Добавить секцию</span>
                </button>
              </div>

              <div className="space-y-3">
                {config.sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={() => toggleSection(section.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
                        />
                        <div>
                          <h3 className="font-semibold text-white">{section.title}</h3>
                          <p className="text-sm text-gray-400">
                            {section.type === 'header' && 'Навигация и логотип'}
                            {section.type === 'hero' && 'Главный баннер'}
                            {section.type === 'about' && 'Информация о компании'}
                            {section.type === 'services' && 'Список услуг'}
                            {section.type === 'contact' && 'Контактная информация'}
                            {section.type === 'footer' && 'Подвал сайта'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditSection(section)}
                        className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Предпросмотр сайта</h2>
              <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                <p className="text-gray-400">Здесь будет предпросмотр вашего сайта</p>
                <p className="text-sm text-gray-500 mt-2">Скоро добавим визуальный редактор!</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Section Editor Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                Редактирование: {editingSection.title}
              </h2>
              <button
                onClick={() => setEditingSection(null)}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {editingData && (() => {
                const schema = getSectionSchema(editingSection.type);
                if (!schema) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-gray-400">Схема для секции &quot;{editingSection.type}&quot; не найдена</p>
                    </div>
                  );
                }
                return (
                  <DynamicSectionEditor
                    schema={[]} // Пустая схема - будет генерироваться автоматически
                    data={editingData}
                    onChange={handleUpdateEditingData}
                  />
                );
              })()}
            </div>
            
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-800">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveSection}
                className="gradient-button px-6 py-3 rounded-xl text-white font-semibold"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Добавить секцию</h2>
              <button
                onClick={() => setShowAddSection(false)}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAvailableSectionTypes().map((sectionType) => (
                  <button
                    key={sectionType.type}
                    onClick={() => handleAddSection(sectionType.type)}
                    className="p-4 text-left bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200"
                  >
                    <h3 className="font-semibold text-white mb-2">{sectionType.title}</h3>
                    <p className="text-sm text-gray-400">{sectionType.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
