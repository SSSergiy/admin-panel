'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Copy, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface MediaFile {
  Key: string;
  LastModified: string;
  Size: number;
  url: string | null;
  type: 'file' | 'folder';
}

export default function MediaPage() {
  const { user, isLoaded } = useUser();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('images/');

  useEffect(() => {
    if (isLoaded && user) {
      loadFiles();
    }
  }, [isLoaded, user]);

  const loadFiles = async (path: string = currentPath) => {
    setLoading(true);
    setError(null);
    try {
        const response = await fetch(`/api/files/list?prefix=${path}`);
        if (response.ok) {
          const data = await response.json();
          setFiles(data.files || []);
        } else {
          throw new Error('Failed to load files');
        }
    } catch (err: any) {
      console.error('Error loading files:', err);
      setError(err.message || 'Failed to load files.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prefix', 'images/');

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      // Reload files after upload
      await loadFiles();
      alert('Файл загружен успешно!');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileKey: string) => {
    if (!user || !confirm('Вы уверены, что хотите удалить этот файл?')) return;

    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: fileKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }

      // Reload files after deletion
      await loadFiles();
      alert('Файл удален успешно!');
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError(err.message || 'Failed to delete file.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('URL скопирован в буфер обмена!');
  };

  const enterFolder = (folderKey: string) => {
    setCurrentPath(folderKey);
    loadFiles(folderKey);
  };

  const goBack = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      pathParts.pop();
      const newPath = pathParts.join('/') + '/';
      setCurrentPath(newPath);
      loadFiles(newPath);
    } else {
      setCurrentPath('images/');
      loadFiles('images/');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-4">Ошибка загрузки</h2>
          <p>{error}</p>
          <button onClick={() => loadFiles()} className="gradient-button mt-4">
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Медиафайлы</h1>
            {currentPath !== 'images/' && (
              <button onClick={goBack} className="button button-secondary">
                <ArrowLeft className="inline-block w-4 h-4 mr-2" />
                Назад
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="button button-secondary">
              <ArrowLeft className="inline-block w-5 h-5 mr-2" />
              В дашборд
            </Link>
            <label className="gradient-button cursor-pointer" htmlFor="file-upload">
              <Upload className="inline-block w-5 h-5 mr-2" />
              {uploading ? 'Загружаем...' : 'Загрузить'}
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Хлебные крошки */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-400">
              <span>📁</span>
              <span>/</span>
              {currentPath.split('/').filter(Boolean).map((part, index, array) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-white">{part}</span>
                  {index < array.length - 1 && <span>/</span>}
                </div>
              ))}
            </nav>
          </div>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <div className="glass rounded-xl p-8">
                <div className="h-16 w-16 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Нет изображений</h3>
                <p className="text-gray-400 mb-6">Загрузите первое изображение, чтобы начать работу</p>
                <label className="gradient-button cursor-pointer" htmlFor="file-upload">
                  <Upload className="inline-block w-5 h-5 mr-2" />
                  Загрузить изображение
                </label>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {files.map((file) => (
                <div key={file.Key} className="glass rounded-xl p-4 group">
                  {file.type === 'folder' ? (
                    // Рендер папки
                    <div 
                      className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => enterFolder(file.Key)}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">📁</div>
                        <div className="text-sm text-gray-400">
                          {file.Key.split('/').filter(Boolean).pop() || 'Папка'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Рендер файла
                    <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={file.url!}
                        alt={file.Key.split('/').pop() || 'Image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-white truncate" title={file.Key}>
                      {file.Key.split('/').pop()?.replace('/', '')}
                    </h3>
                    
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Размер: {formatFileSize(file.Size)}</p>
                      <p>Дата: {formatDate(file.LastModified)}</p>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      {file.type === 'file' && file.url && (
                        <button
                          onClick={() => copyToClipboard(file.url!)}
                          className="flex-1 button button-secondary text-xs"
                          title="Копировать URL"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          URL
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file.Key)}
                        className="button button-secondary text-xs text-red-400 hover:text-red-300"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
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
