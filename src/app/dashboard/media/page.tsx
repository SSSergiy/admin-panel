'use client';

import MediaBreadcrumbs from '@/components/MediaBreadcrumbs';
import MediaFileCard from '@/components/MediaFileCard';
import MediaHeader from '@/components/MediaHeader';
import { MediaFile } from '@/types/site';
import { useUser } from '@clerk/nextjs';
import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

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
      <MediaHeader 
        currentPath={currentPath}
        uploading={uploading}
        onGoBack={goBack}
        onFileUpload={handleFileUpload}
      />

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <MediaBreadcrumbs currentPath={currentPath} />
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
                <MediaFileCard 
                  key={file.Key}
                  file={file}
                  onDelete={handleDeleteFile}
                  onEnterFolder={enterFolder}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
