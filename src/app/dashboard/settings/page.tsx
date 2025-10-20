'use client';

import Sidebar from '@/components/Sidebar';
import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, CheckCircle, Globe, Palette, Save, Type, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SiteSettings {
  site: {
    title: string;
    description: string;
    logo: string;
    favicon: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [settings, setSettings] = useState<SiteSettings>({
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
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!isLoaded || !user) return;
      
      try {
        const response = await fetch('/api/files/get?filename=config.json');
        if (response.ok) {
          const { data } = await response.json();
          setSettings({
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
            }
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [isLoaded, user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Получаем полный config.json чтобы не перезаписать pages
      const currentResponse = await fetch('/api/files/get?filename=config.json');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let currentData: any = {};
      
      if (currentResponse.ok) {
        const result = await currentResponse.json();
        currentData = result.data || {};
      }

      // Обновляем только site и theme
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedData: any = {
        ...currentData,
        site: settings.site,
        theme: settings.theme
      };

      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'config.json',
          data: updatedData
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить настройки');
      }

      setMessage({
        type: 'success',
        text: 'Настройки успешно сохранены!'
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Ошибка сохранения'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">Пожалуйста, войдите в систему</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      
      {/* Main Content */}
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
                  <h1 className="text-2xl font-bold text-white">
                    Настройки сайта
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Настройте внешний вид и контент вашего сайта</p>
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
        <main className="p-6 max-w-4xl">
          {/* Уведомления */}
          {message && (
            <div className={`mb-6 p-6 rounded-2xl border animate-slide-up ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-start space-x-4">
                {message.type === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p className={message.type === 'success' ? 'text-green-300' : 'text-red-300'}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          {/* Основная информация */}
          <div className="glass rounded-2xl p-8 mb-8 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Основная информация</h2>
                <p className="text-gray-400 text-sm">Название, описание и логотип сайта</p>
              </div>
            </div>
          
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Название сайта
                </label>
                <input
                  type="text"
                  value={settings.site.title}
                  onChange={(e) => setSettings({
                    ...settings,
                    site: { ...settings.site, title: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Мой сайт"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Описание
                </label>
                <textarea
                  value={settings.site.description}
                  onChange={(e) => setSettings({
                    ...settings,
                    site: { ...settings.site, description: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Краткое описание вашего сайта"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Логотип (имя файла)
                  </label>
                  <input
                    type="text"
                    value={settings.site.logo}
                    onChange={(e) => setSettings({
                      ...settings,
                      site: { ...settings.site, logo: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="logo.png"
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Загрузите файл через раздел &quot;Изображения&quot;
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Favicon (имя файла)
                  </label>
                  <input
                    type="text"
                    value={settings.site.favicon}
                    onChange={(e) => setSettings({
                      ...settings,
                      site: { ...settings.site, favicon: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="favicon.ico"
                  />
                </div>
              </div>
            </div>
        </div>

          {/* Тема оформления */}
          <div className="glass rounded-2xl p-8 mb-8 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Тема оформления</h2>
                <p className="text-gray-400 text-sm">Цвета и шрифты для вашего сайта</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Основной цвет
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.theme.primaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme: { ...settings.theme, primaryColor: e.target.value }
                      })}
                      className="h-12 w-16 rounded-xl border-2 border-gray-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.theme.primaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme: { ...settings.theme, primaryColor: e.target.value }
                      })}
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Вторичный цвет
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.theme.secondaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme: { ...settings.theme, secondaryColor: e.target.value }
                      })}
                      className="h-12 w-16 rounded-xl border-2 border-gray-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.theme.secondaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme: { ...settings.theme, secondaryColor: e.target.value }
                      })}
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="#1E40AF"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Шрифт
                </label>
                <div className="flex items-center space-x-3">
                  <Type className="h-5 w-5 text-gray-400" />
                  <select
                    value={settings.theme.fontFamily}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: { ...settings.theme, fontFamily: e.target.value }
                    })}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Подсказка */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">💡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Подсказка</h3>
                <p className="text-sm text-gray-400">
                  После изменения настроек нажмите &quot;Сохранить&quot;, затем вернитесь на главную страницу 
                  и нажмите &quot;Опубликовать сайт&quot;, чтобы изменения вступили в силу на публичном сайте.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

