'use client';

import { Upload, X } from 'lucide-react';
import { useState } from 'react';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
}

export default function ImageUploadField({ value, onChange, onUpload }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Превью картинки */}
      {value && (
        <div className="relative group">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23aaa" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EИзображение не найдено%3C/text%3E%3C/svg%3E';
            }}
          />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Удалить"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      )}

      {/* Инпут для URL */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Кнопка загрузки */}
        <label className="button-gradient cursor-pointer flex items-center gap-2 px-4 py-2">
          <Upload className="h-4 w-4" />
          {uploading ? 'Загрузка...' : 'Загрузить'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

