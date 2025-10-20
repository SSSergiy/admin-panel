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
      return <Image className="h-6 w-6 text-blue-400" />;
    }
    return <FileText className="h-6 w-6 text-purple-400" />;
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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-400 text-lg">Загрузка файлов...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mx-auto mb-6">
          <FileText className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Файлы не найдены</h3>
        <p className="text-gray-400">Загрузите файлы, чтобы начать работу</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file, index) => (
        <div 
          key={file.Key} 
          className="group flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl hover:bg-gray-700/50 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              {getFileIcon(file.Key)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate text-lg">
                {file.Key.split('/').pop()}
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400 mt-1">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>{getFileType(file.Key)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>{formatFileSize(file.Size)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span>{formatDate(file.LastModified)}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleDelete(file.Key)}
              disabled={deleting === file.Key}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group-hover:scale-110"
              title="Удалить файл"
            >
              {deleting === file.Key ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-400 border-t-transparent"></div>
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
