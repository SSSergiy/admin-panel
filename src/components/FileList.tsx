'use client';

import { FileText, Image, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface FileItem {
  Key: string;
  LastModified: string;
  Size: number;
}

interface FileListProps {
  files: FileItem[];
  onDelete: (key: string) => Promise<void>;
  onRefresh: () => void;
  loading?: boolean;
}

export default function FileList({ files, onDelete, onRefresh, loading = false }: FileListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (key: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот файл?')) {
      return;
    }

    try {
      setDeleting(key);
      await onDelete(key);
      onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Ошибка при удалении файла ');
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (key: string) => {
    if (key.includes('/images/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getFileType = (key: string) => {
    if (key.includes('/images/')) {
      return 'Изображение';
    }
    if (key.includes('/data/')) {
      return 'JSON файл';
    }
    return 'Файл';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Загрузка файлов...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Файлы не найдены</p>
        <p className="text-sm text-gray-500">Загрузите файлы, чтобы начать работу</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.Key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(file.Key)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {file.Key.split('/').pop()}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{getFileType(file.Key)}</span>
                <span>{formatFileSize(file.Size)}</span>
                <span>{formatDate(file.LastModified)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDelete(file.Key)}
              disabled={deleting === file.Key}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Удалить файл"
            >
              {deleting === file.Key ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
