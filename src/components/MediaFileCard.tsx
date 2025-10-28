'use client';

import { MediaFile } from '@/types/site';
import { Copy, Trash2 } from 'lucide-react';

interface MediaFileCardProps {
  file: MediaFile;
  onDelete: (fileKey: string) => void;
  onEnterFolder: (folderKey: string) => void;
}

export default function MediaFileCard({ file, onDelete, onEnterFolder }: MediaFileCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('URL скопирован в буфер обмена!');
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

  return (
    <div className="glass rounded-xl p-4 group">
      {file.type === 'folder' ? (
        <div 
          className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => onEnterFolder(file.Key)}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">📁</div>
            <div className="text-sm text-gray-400">
              {file.Key.split('/').filter(Boolean).pop() || 'Папка'}
            </div>
          </div>
        </div>
      ) : (
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
            onClick={() => onDelete(file.Key)}
            className="button button-secondary text-xs text-red-400 hover:text-red-300"
            title="Удалить"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

