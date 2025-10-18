'use client';

import FileUploader from '@/components/FileUploader';
import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ImageFile {
  Key: string;
  LastModified: string;
  Size: number;
  url?: string;
}

export default function ImagesPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageFile[]>([]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchImages();
    }
  }, [isLoaded, user]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/files/list?prefix=images/');
      const data = await response.json();
      
      // Фильтруем только изображения и добавляем URL
      const imageFiles = (data.files || [])
        .filter((file: ImageFile) => file.Key.includes('/images/'))
        .map((file: ImageFile) => ({
          ...file,
          url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-a6698d33e75a45ebb75c9b00d0c3ce2a.r2.dev'}/${file.Key}`
        }));
      
      setImages(imageFiles);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

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

      await fetchImages();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Вы уверены, что хотите удалить это изображение?')) {
      return;
    }

    try {
      const response = await fetch(`/api/files/delete?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      await fetchImages();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Ошибка при удалении изображения');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL скопирован в буфер обмена!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
                Галерея изображений
              </h1>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Загрузить изображения
          </h2>
          <FileUploader
            onUpload={handleUpload}
            onSuccess={() => {}}
            onError={(error) => alert(error)}
          />
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Ваши изображения ({images.length})
            </h2>
            <button
              onClick={fetchImages}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Обновить
            </button>
          </div>

          {images.length === 0 ? (
            <div className="p-12 text-center">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Нет загруженных изображений</p>
              <p className="text-sm text-gray-500">
                Загрузите первое изображение с помощью формы выше
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
              {images.map((image) => (
                <div key={image.Key} className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  {/* Превью */}
                  <div className="aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.Key.split('/').pop()}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Информация */}
                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.Key.split('/').pop()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(image.Size)}
                    </p>
                  </div>

                  {/* Действия (показываются при наведении) */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={() => copyUrl(image.url!)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg text-xs"
                      title="Скопировать URL"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDelete(image.Key)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Подсказка */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Использование изображений</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Нажмите 📋 чтобы скопировать URL изображения</li>
            <li>• Используйте имя файла в настройках (например, для логотипа)</li>
            <li>• Рекомендуемые размеры: до 1920x1080 пикселей</li>
            <li>• Максимальный размер файла: 5MB</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

