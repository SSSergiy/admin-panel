'use client';

import FileUploader from '@/components/FileUploader';
import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const { user, isLoaded } = useUser();
  const handleUpload = async (file: File) => {
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', `images/${file.name}`);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSuccess = () => {
    // Можно добавить уведомление об успешной загрузке
    console.log('File uploaded successfully');
  };

  const handleError = (error: string) => {
    // Можно добавить уведомление об ошибке
    console.error('Upload error:', error);
    alert(error);
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
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Загрузка файлов
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Загрузить изображения</h2>
          <p className="text-gray-600">
            Загрузите изображения для вашего сайта. Поддерживаются форматы: PNG, JPG, WEBP, GIF
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <FileUploader
            onUpload={handleUpload}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Советы по загрузке:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Используйте изображения высокого качества для лучшего результата</li>
            <li>• Рекомендуемый размер: не более 1920x1080 пикселей</li>
            <li>• Форматы WEBP и PNG обеспечивают лучшее сжатие</li>
            <li>• Максимальный размер файла: 5MB</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
