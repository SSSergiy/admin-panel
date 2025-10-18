'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
}

export default function ContentPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    if (isLoaded && user) {
      loadPages();
    }
  }, [isLoaded, user]);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/files/get?filename=config.json');
      if (response.ok) {
        const { data } = await response.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = () => {
    router.push('/dashboard/content/edit?new=true');
  };

  const handleEditPage = (pageId: string) => {
    router.push(`/dashboard/content/edit?id=${pageId}`);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту страницу?')) {
      return;
    }

    try {
      // Получаем текущий config
      const response = await fetch('/api/files/get?filename=config.json');
      if (!response.ok) return;

      const { data } = await response.json();
      
      // Удаляем страницу
      const updatedPages = data.pages.filter((p: Page) => p.id !== pageId);
      const updatedData = { ...data, pages: updatedPages };

      // Сохраняем
      await fetch('/api/files/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'config.json',
          data: updatedData
        }),
      });

      // Обновляем UI
      setPages(updatedPages);
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Ошибка при удалении страницы');
    }
  };

  const togglePublished = async (pageId: string) => {
    try {
      // Получаем текущий config
      const response = await fetch('/api/files/get?filename=config.json');
      if (!response.ok) return;

      const { data } = await response.json();
      
      // Переключаем статус
      const updatedPages = data.pages.map((p: Page) => 
        p.id === pageId ? { ...p, published: !p.published } : p
      );
      const updatedData = { ...data, pages: updatedPages };

      // Сохраняем
      await fetch('/api/files/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'config.json',
          data: updatedData
        }),
      });

      // Обновляем UI
      setPages(updatedPages);
    } catch (error) {
      console.error('Error toggling published:', error);
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
                Управление контентом
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddPage}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Добавить страницу</span>
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Страницы сайта</h2>
          </div>

          {pages.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-4">Пока нет ни одной страницы</p>
              <button
                onClick={handleAddPage}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Создать первую страницу</span>
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {pages.map((page) => (
                <div key={page.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{page.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          page.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {page.published ? 'Опубликовано' : 'Черновик'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{page.slug}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{page.content}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => togglePublished(page.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title={page.published ? 'Скрыть' : 'Опубликовать'}
                      >
                        {page.published ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleEditPage(page.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Подсказка */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Подсказка</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Создавайте страницы для различных разделов вашего сайта</li>
            <li>• Используйте slug для определения URL (например: /about, /services)</li>
            <li>• Черновики не отображаются на публичном сайте</li>
            <li>• После изменений нажмите &quot;Опубликовать сайт&quot; на главной странице</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

