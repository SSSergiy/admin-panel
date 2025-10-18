'use client';

import FileList from '@/components/FileList';
import { UserButton, useUser } from '@clerk/nextjs';
import { CheckCircle, Eye, FileText, Rocket, Upload, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FileItem {
  Key: string;
  LastModified: string;
  Size: number;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchFiles();
    }
  }, [isLoaded, user]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/files/list');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (key: string) => {
    try {
      const response = await fetch(`/api/files/delete?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete file');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setPublishMessage(null);

      const response = await fetch('/api/build/trigger', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось запустить публикацию');
      }

      setPublishMessage({
        type: 'success',
        text: data.message || 'Сайт публикуется! Изменения будут видны через 2-5 минут.'
      });

      // Скрыть сообщение через 5 секунд
      setTimeout(() => setPublishMessage(null), 5000);
    } catch (error) {
      setPublishMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Ошибка публикации'
      });
    } finally {
      setPublishing(false);
    }
  };

  if (!isLoaded) {
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
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Multi-Tenant CMS
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Привет, {user.firstName || user.emailAddresses[0].emailAddress}!
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Панель управления</h2>
            <p className="text-gray-600">
              Управляйте файлами и настройками вашего сайта
            </p>
          </div>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Rocket className="h-5 w-5" />
            <span>{publishing ? 'Публикация...' : 'Опубликовать сайт'}</span>
          </button>
        </div>

        {/* Уведомления */}
        {publishMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            publishMessage.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              {publishMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className={publishMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                <p className="font-medium">{publishMessage.type === 'success' ? 'Успех!' : 'Ошибка'}</p>
                <p className="text-sm mt-1">{publishMessage.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/settings" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow block">
            <FileText className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Настройки сайта</h3>
            <p className="text-sm text-gray-600">Название, цвета, шрифты</p>
          </Link>

          <Link href="/dashboard/content" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow block">
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Контент</h3>
            <p className="text-sm text-gray-600">Страницы сайта</p>
          </Link>

          <Link href="/dashboard/images" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow block">
            <Upload className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Изображения</h3>
            <p className="text-sm text-gray-600">Галерея файлов</p>
          </Link>

          <Link 
            href={`http://localhost:8080/${user?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow block"
          >
            <Eye className="h-8 w-8 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Предпросмотр</h3>
            <p className="text-sm text-gray-600">Посмотреть сайт</p>
          </Link>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Файлы</h3>
              <button
                onClick={fetchFiles}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Обновить
              </button>
            </div>
          </div>
          <div className="p-6">
            <FileList
              files={files}
              onDelete={handleDeleteFile}
              onRefresh={fetchFiles}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
