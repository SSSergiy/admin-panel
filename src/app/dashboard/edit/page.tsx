'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import JSONEditor from '@/components/JSONEditor';

export default function EditPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [initialValue, setInitialValue] = useState('{}');
  const [filename, setFilename] = useState('config.json');

  useEffect(() => {
    if (isLoaded && user) {
      loadConfig();
    }
  }, [isLoaded, user]);

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/files/get?filename=${filename}`);
      if (response.ok) {
        const { data } = await response.json();
        setInitialValue(JSON.stringify(data, null, 2));
      } else {
        // Если файл не найден, создаем базовую структуру
        setInitialValue(JSON.stringify({
          site: {
            title: "Мой сайт",
            description: "Описание сайта",
            logo: "",
            favicon: ""
          },
          theme: {
            primaryColor: "#3B82F6",
            secondaryColor: "#1E40AF",
            fontFamily: "Inter"
          },
          pages: [
            {
              id: "home",
              title: "Главная",
              slug: "/",
              content: "Добро пожаловать на мой сайт!",
              published: true
            }
          ]
        }, null, 2));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          data
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      return await response.json();
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const handleError = (error: string) => {
    alert(`Ошибка: ${error}`);
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
                Редактирование контента
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.firstName || user.emailAddresses[0].emailAddress}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-4rem)]">
        <div className="h-full">
          <JSONEditor
            initialValue={initialValue}
            onSave={handleSave}
            onError={handleError}
            filename={filename}
          />
        </div>
      </main>
    </div>
  );
}
