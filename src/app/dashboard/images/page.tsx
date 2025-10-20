'use client';

import FileUploader from '@/components/FileUploader';
import Sidebar from '@/components/Sidebar';
import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, Copy, FolderPlus, Image as ImageIcon, RefreshCw, Trash2, Upload } from 'lucide-react';
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
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');

  useEffect(() => {
    if (isLoaded && user) {
      // Автоматически создаем стандартные папки при первом входе
      ensureDefaultFolders();
      fetchImages();
    }
  }, [isLoaded, user]);

  const ensureDefaultFolders = async () => {
    try {
      await fetch('/api/files/init-folders', {
        method: 'POST',
      });
    } catch (error) {
      console.log('Folders already exist or error creating them');
    }
  };

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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/files/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName: newFolderName.trim(),
          category: selectedCategory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const result = await response.json();
      alert(result.message);
      
      // Сбрасываем форму
      setNewFolderName('');
      setShowCreateFolder(false);
      
      // Обновляем список
      fetchImages();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Ошибка создания папки');
    }
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
                    Галерея изображений
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Управляйте изображениями вашего сайта</p>
                </div>
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
          {/* Upload Section */}
          <div className="glass rounded-2xl p-8 mb-8 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Загрузить изображения</h2>
                <p className="text-gray-400 text-sm">Перетащите файлы или нажмите для выбора</p>
              </div>
            </div>
            <FileUploader
              onUpload={handleUpload}
              onSuccess={() => {}}
              onError={(error) => alert(error)}
            />
          </div>

          {/* Gallery */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Ваши изображения</h2>
                <p className="text-gray-400 text-sm mt-1">{images.length} файлов</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span className="text-sm font-medium">Создать папку</span>
                </button>
                <button
                  onClick={fetchImages}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Обновить</span>
                </button>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Нет загруженных изображений</h3>
                <p className="text-gray-400">Загрузите первое изображение с помощью формы выше</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
                {images.map((image, index) => (
                  <div 
                    key={image.Key} 
                    className="group relative bg-gray-800/50 rounded-2xl overflow-hidden hover:bg-gray-700/50 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Превью */}
                    <div className="aspect-square relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.Key.split('/').pop()}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Информация */}
                    <div className="p-4">
                      <p className="text-sm font-semibold text-white truncate mb-1">
                        {image.Key.split('/').pop()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(image.Size)}
                      </p>
                    </div>

                    {/* Действия (показываются при наведении) */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <button
                        onClick={() => copyUrl(image.url!)}
                        className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 backdrop-blur-sm transition-all duration-200"
                        title="Скопировать URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(image.Key)}
                        className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 backdrop-blur-sm transition-all duration-200"
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
          <div className="mt-6 glass rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">💡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Использование изображений</h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <span>Нажмите на иконку копирования чтобы скопировать URL изображения</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span>Используйте имя файла в настройках (например, для логотипа)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                    <span>Рекомендуемые размеры: до 1920x1080 пикселей</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                    <span>Максимальный размер файла: 5MB</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-6">Создать папку</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Категория
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="logos">Логотипы</option>
                  <option value="hero">Hero секция</option>
                  <option value="about">О нас</option>
                  <option value="services">Услуги</option>
                  <option value="gallery">Галерея</option>
                  <option value="general">Общие</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Название папки
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Например: main-logo"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-6 py-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="gradient-button px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

