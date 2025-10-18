'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, CheckCircle, Save, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
}

export default function EditPageContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams.get('id');
  const isNew = searchParams.get('new') === 'true';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [page, setPage] = useState<Page>({
    id: '',
    title: '',
    slug: '',
    content: '',
    published: false
  });

  useEffect(() => {
    if (isLoaded && user) {
      if (isNew) {
        // Новая страница
        setPage({
          id: `page-${Date.now()}`,
          title: '',
          slug: '',
          content: '',
          published: false
        });
        setLoading(false);
      } else if (pageId) {
        loadPage(pageId);
      }
    }
  }, [isLoaded, user, pageId, isNew]);

  const loadPage = async (id: string) => {
    try {
      const response = await fetch('/api/files/get?filename=config.json');
      if (response.ok) {
        const { data } = await response.json();
        const foundPage = data.pages?.find((p: Page) => p.id === id);
        if (foundPage) {
          setPage(foundPage);
        }
      }
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Валидация
    if (!page.title.trim()) {
      setMessage({ type: 'error', text: 'Введите название страницы' });
      return;
    }
    if (!page.slug.trim()) {
      setMessage({ type: 'error', text: 'Введите slug (URL)' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      // Получаем текущий config
      const response = await fetch('/api/files/get?filename=config.json');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let currentData: any = {};
      
      if (response.ok) {
        const result = await response.json();
        currentData = result.data || {};
      }

      const pages = currentData.pages || [];
      
      // Обновляем или добавляем страницу
      const pageIndex = pages.findIndex((p: Page) => p.id === page.id);
      if (pageIndex >= 0) {
        pages[pageIndex] = page;
      } else {
        pages.push(page);
      }

      const updatedData = {
        ...currentData,
        pages
      };

      // Сохраняем
      const saveResponse = await fetch('/api/files/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'config.json',
          data: updatedData
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Не удалось сохранить страницу');
      }

      setMessage({
        type: 'success',
        text: 'Страница успешно сохранена!'
      });

      // Перенаправляем на список страниц через 1 сек
      setTimeout(() => {
        router.push('/dashboard/content');
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Ошибка сохранения'
      });
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    // Простая транслитерация для slug
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
    setPage({ ...page, slug: `/${slug}` });
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
                href="/dashboard/content"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {isNew ? 'Новая страница' : 'Редактирование страницы'}
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

        {/* Форма */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название страницы <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              onBlur={() => !page.slug && generateSlug(page.title)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Главная страница"
            />
            <p className="mt-1 text-xs text-gray-500">
              Введите название - slug сгенерируется автоматически
            </p>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL (slug) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={page.slug}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/about"
            />
            <p className="mt-1 text-xs text-gray-500">
              Например: /, /about, /services
            </p>
          </div>

          {/* Контент */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Контент
            </label>
            <textarea
              value={page.content}
              onChange={(e) => setPage({ ...page, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Напишите текст страницы..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Можно использовать HTML теги для форматирования
            </p>
          </div>

          {/* Опубликовано */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={page.published}
              onChange={(e) => setPage({ ...page, published: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
              Опубликовать страницу (если не отмечено - страница будет черновиком)
            </label>
          </div>
        </div>

        {/* Подсказка */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Форматирование текста</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p className="font-mono">&lt;h2&gt;Заголовок&lt;/h2&gt;</p>
            <p className="font-mono">&lt;p&gt;Параграф текста&lt;/p&gt;</p>
            <p className="font-mono">&lt;strong&gt;Жирный&lt;/strong&gt;</p>
            <p className="font-mono">&lt;em&gt;Курсив&lt;/em&gt;</p>
            <p className="font-mono">&lt;a href="..."&gt;Ссылка&lt;/a&gt;</p>
          </div>
        </div>
      </main>
    </div>
  );
}

