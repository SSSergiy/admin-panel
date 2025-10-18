'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
    if (isLoaded && user) {
      loadSettings();
    }
  }, [isLoaded, user]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/files/get?filename=config.json');
      if (response.ok) {
        const { data } = await response.json();
        setSettings({
          site: data.site || settings.site,
          theme: data.theme || settings.theme
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Настройки сайта
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Уведомления */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Основная информация */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название сайта
              </label>
              <input
                type="text"
                value={settings.site.title}
                onChange={(e) => setSettings({
                  ...settings,
                  site: { ...settings.site, title: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Мой сайт"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={settings.site.description}
                onChange={(e) => setSettings({
                  ...settings,
                  site: { ...settings.site, description: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Краткое описание вашего сайта"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Логотип (имя файла)
                </label>
                <input
                  type="text"
                  value={settings.site.logo}
                  onChange={(e) => setSettings({
                    ...settings,
                    site: { ...settings.site, logo: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="logo.png"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Загрузите файл через &quot;Загрузить файлы&quot;
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon (имя файла)
                </label>
                <input
                  type="text"
                  value={settings.site.favicon}
                  onChange={(e) => setSettings({
                    ...settings,
                    site: { ...settings.site, favicon: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="favicon.ico"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Тема оформления */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Тема оформления</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.theme.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: { ...settings.theme, primaryColor: e.target.value }
                    })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.theme.secondaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: { ...settings.theme, secondaryColor: e.target.value }
                    })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#1E40AF"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Шрифт
              </label>
              <select
                value={settings.theme.fontFamily}
                onChange={(e) => setSettings({
                  ...settings,
                  theme: { ...settings.theme, fontFamily: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Подсказка */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Подсказка</h3>
              <p className="text-sm text-blue-700">
            После изменения настроек нажмите &quot;Сохранить&quot;, затем вернитесь на главную страницу 
            и нажмите &quot;Опубликовать сайт&quot;, чтобы изменения вступили в силу на публичном сайте.
          </p>
        </div>
      </main>
    </div>
  );
}

