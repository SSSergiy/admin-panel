'use client';

import DeployStatus from '@/components/DeployStatus';
import { UserButton, useUser } from '@clerk/nextjs';
import { FileText, Image } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState({
    pages: 0,
    images: 0,
    files: 0
  });

  useEffect(() => {
    if (isLoaded && user) {
      loadStats();
    }
  }, [isLoaded, user]);

  const loadStats = async () => {
    try {
      // Загружаем статистику
      const [contentRes, imagesRes] = await Promise.all([
        fetch('/api/files/get?file=content.json'),
        fetch('/api/files/list?prefix=images/')
      ]);

      const contentData = contentRes.ok ? await contentRes.json() : { pages: {} };
      const imagesData = imagesRes.ok ? await imagesRes.json() : { files: [] };

      const pagesCount = contentData.pages ? Object.keys(contentData.pages).length : 0;

      setStats({
        pages: pagesCount,
        images: imagesData.files?.length || 0,
        files: pagesCount + (imagesData.files?.length || 0)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!isLoaded) {
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
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-sm mt-1">Добро пожаловать, {user.firstName || user.emailAddresses[0].emailAddress}!</p>
            </div>
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
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Deploy Status */}
          <DeployStatus />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Страницы</p>
                  <p className="text-2xl font-bold text-white">{stats.pages}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Изображения</p>
                  <p className="text-2xl font-bold text-white">{stats.images}</p>
                </div>
                <Image className="h-8 w-8 text-green-400" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Всего файлов</p>
                  <p className="text-2xl font-bold text-white">{stats.files}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard/pages" className="card hover:bg-white/15 transition-colors group">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600/20 rounded-xl group-hover:bg-blue-600/30 transition-colors">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Страницы</h3>
                  <p className="text-sm text-gray-400">Управление страницами сайта</p>
                </div>
              </div>
            </Link>


            <Link href="/dashboard/media" className="card hover:bg-white/15 transition-colors group">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-600/20 rounded-xl group-hover:bg-purple-600/30 transition-colors">
                  <Image className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Медиа</h3>
                  <p className="text-sm text-gray-400">Галерея изображений</p>
                </div>
              </div>
            </Link>

          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Последние изменения</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white">Сайт обновлен</p>
                    <p className="text-sm text-gray-400">2 минуты назад</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white">Загружено 5 изображений</p>
                    <p className="text-sm text-gray-400">3 часа назад</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
