'use client';

import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

interface MediaHeaderProps {
  currentPath: string;
  uploading: boolean;
  onGoBack: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MediaHeader({ 
  currentPath, 
  uploading, 
  onGoBack, 
  onFileUpload 
}: MediaHeaderProps) {
  return (
    <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Медиафайлы</h1>
          {currentPath !== 'images/' && (
            <button onClick={onGoBack} className="button button-secondary">
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
            onChange={onFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </div>
    </header>
  );
}

