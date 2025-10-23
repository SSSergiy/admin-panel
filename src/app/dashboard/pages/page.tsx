'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Edit, Eye, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Page {
  id: string;
  title: string;
  slug: string;
  sections: any[];
}

export default function PagesPage() {
  const { user, isLoaded } = useUser();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadPages();
    }
  }, [isLoaded, user]);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/files/get?file=pages.json');
      if (response.ok) {
        const data = await response.json();
        // Убеждаемся, что pages всегда массив
        const pagesData = Array.isArray(data.data) ? data.data : [];
        setPages(pagesData);
      } else {
        // Если файл не найден, инициализируем пустым массивом
        setPages([]);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      // В случае ошибки тоже инициализируем пустым массивом
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (pageId: string) => {
    if (!confirm('Удалить страницу?')) return;
    
    try {
      const updatedPages = pages.filter(page => page.id !== pageId);
      await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'pages.json',
          data: updatedPages
        })
      });
      setPages(updatedPages);
    } catch (error) {
      console.error('Error deleting page:', error);
    }
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
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Управление страницами</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="button button-secondary">
                <ArrowLeft className="inline-block w-5 h-5 mr-2" />
                В дашборд
              </Link>
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
              <span className="text-white">Страницы</span>
            </nav>
          </div>
          {!Array.isArray(pages) || pages.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Нет страниц</h3>
              <p className="text-gray-400 mb-6">Страницы создаются разработчиком</p>
              <p className="text-sm text-gray-500">Обратитесь к разработчику для создания новых страниц</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(pages) && pages.map((page) => (
                <div key={page.id} className="card hover:bg-white/15 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{page.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">/{page.slug}</p>
                      <p className="text-xs text-gray-500">
                        {page.sections?.length || 0} секций
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors"
                        title="Просмотреть страницу"
                      >
                        <Eye className="h-4 w-4 text-green-400" />
                      </button>
                      <Link
                        href={`/dashboard/pages/${page.id}/sections`}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                        title="Редактировать секции"
                      >
                        <Edit className="h-4 w-4 text-blue-400" />
                      </Link>
                      <button
                        onClick={() => deletePage(page.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                        title="Удалить страницу"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/pages/${page.id}/edit`}
                        className="button-secondary text-sm"
                      >
                        Настройки
                      </Link>
                      <button className="button-secondary text-sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Просмотр
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
