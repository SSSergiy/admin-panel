'use client';

import FileList from '@/components/FileList';
import Sidebar from '@/components/Sidebar';
import { UserButton, useUser } from '@clerk/nextjs';
import { BarChart3, CheckCircle, Eye, FileText, Rocket, Settings, Upload, XCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Маппинг userId → Cloudflare Pages URL
const CLIENT_SITES: Record<string, string> = {
  'user_34EvUVHa2Fv9rbrXKRzHCbR7791': 'https://website-code-eg1.pages.dev',
  'user_34HuRacqhtVx3xG1KmC8UyFT8OV': 'https://client-website-template.pages.dev',
};

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
    <div className="min-h-screen bg-gray-900">
      <Sidebar userSiteUrl={CLIENT_SITES[user?.id || '']} />
      
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Добро пожаловать, {user.firstName || user.emailAddresses[0].emailAddress}!
                </h1>
                <p className="text-gray-400 mt-1">Управляйте своим сайтом с легкостью</p>
              </div>
              <div className="flex items-center space-x-4">
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Всего файлов</p>
                  <p className="text-2xl font-bold text-white mt-1">{files.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Изображения</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {files.filter(f => f.Key.includes('images/')).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Статус сайта</p>
                  <p className="text-lg font-bold text-green-400 mt-1">Активен</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Publish Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="gradient-button flex items-center space-x-3 text-white font-semibold py-4 px-8 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Rocket className="h-5 w-5" />
              <span>{publishing ? 'Публикация...' : 'Опубликовать сайт'}</span>
            </button>
          </div>

          {/* Уведомления */}
          {publishMessage && (
            <div className={`mb-6 p-6 rounded-2xl border animate-slide-up ${
              publishMessage.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-start space-x-4">
                {publishMessage.type === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className={publishMessage.type === 'success' ? 'text-green-300' : 'text-red-300'}>
                  <p className="font-semibold text-lg">{publishMessage.type === 'success' ? 'Успех!' : 'Ошибка'}</p>
                  <p className="text-sm mt-1">{publishMessage.text}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link 
              href="/dashboard/settings" 
              className="glass p-6 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 group animate-fade-in"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">Настройки сайта</h3>
              <p className="text-gray-400 text-sm">Название, цвета, шрифты</p>
            </Link>

            <Link 
              href="/dashboard/content" 
              className="glass p-6 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 group animate-fade-in"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">Контент</h3>
              <p className="text-gray-400 text-sm">Страницы сайта</p>
            </Link>

            <Link 
              href="/dashboard/images" 
              className="glass p-6 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 group animate-fade-in"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">Изображения</h3>
              <p className="text-gray-400 text-sm">Галерея файлов</p>
            </Link>

            <Link 
              href={CLIENT_SITES[user?.id || ''] || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="glass p-6 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 group animate-fade-in"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">Посмотреть сайт</h3>
              <p className="text-gray-400 text-sm">Открыть публичный сайт</p>
            </Link>
          </div>

          {/* Files List */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Файлы</h3>
                  <p className="text-gray-400 text-sm mt-1">Управляйте файлами вашего сайта</p>
                </div>
                <button
                  onClick={fetchFiles}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm font-medium">Обновить</span>
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
    </div>
  );
}
