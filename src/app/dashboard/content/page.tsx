'use client';

import Sidebar from '@/components/Sidebar';
import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, Edit2, Eye, EyeOff, FileText, Globe, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
                    Управление контентом
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Создавайте и редактируйте страницы сайта</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAddPage}
                  className="gradient-button flex items-center space-x-3 text-white font-semibold py-3 px-6 rounded-2xl"
                >
                  <Plus className="h-5 w-5" />
                  <span>Добавить страницу</span>
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
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Страницы сайта</h2>
                  <p className="text-gray-400 text-sm">{pages.length} страниц</p>
                </div>
              </div>
            </div>

            {pages.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Пока нет ни одной страницы</h3>
                <p className="text-gray-400 mb-6">Создайте первую страницу для вашего сайта</p>
                <button
                  onClick={handleAddPage}
                  className="gradient-button inline-flex items-center space-x-3 text-white font-semibold py-3 px-6 rounded-2xl"
                >
                  <Plus className="h-5 w-5" />
                  <span>Создать первую страницу</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {pages.map((page, index) => (
                  <div 
                    key={page.id} 
                    className="p-6 hover:bg-gray-800/50 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="font-semibold text-white text-lg">{page.title}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            page.published 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {page.published ? 'Опубликовано' : 'Черновик'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
                          <Globe className="h-4 w-4" />
                          <span>/{page.slug}</span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">{page.content}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-6">
                        <button
                          onClick={() => togglePublished(page.id)}
                          className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-blue-400 transition-all duration-200"
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
                          className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-green-400 transition-all duration-200"
                          title="Редактировать"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-red-400 transition-all duration-200"
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
          <div className="mt-6 glass rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">💡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Подсказка</h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <span>Создавайте страницы для различных разделов вашего сайта</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span>Используйте slug для определения URL (например: /about, /services)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                    <span>Черновики не отображаются на публичном сайте</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                    <span>После изменений нажмите &quot;Опубликовать сайт&quot; на главной странице</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

