'use client';

import { CheckCircle, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function FileUploader({ onUpload, onSuccess, onError }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        setUploading(true);
        await onUpload(file);
        setUploadedFiles(prev => [...prev, file.name]);
        onSuccess?.();
      } catch (error) {
        console.error('Upload error:', error);
        onError?.(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    }
  }, [onUpload, onSuccess, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  });

  const removeUploadedFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(name => name !== fileName));
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-blue-400 bg-blue-500/10 scale-105' 
            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/30'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          glass
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        <div className="flex flex-col items-center space-y-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragActive 
              ? 'bg-gradient-to-br from-blue-500 to-purple-500 scale-110' 
              : 'bg-gradient-to-br from-gray-700 to-gray-800'
          }`}>
            <Upload className={`h-10 w-10 ${isDragActive ? 'text-white' : 'text-gray-400'}`} />
          </div>
          
          {isDragActive ? (
            <div>
              <p className="text-blue-400 font-semibold text-lg">Отпустите файлы здесь...</p>
              <p className="text-blue-300 text-sm mt-2">Файлы будут загружены автоматически</p>
            </div>
          ) : (
            <div>
              <p className="text-white font-semibold text-lg">
                {uploading ? 'Загрузка...' : 'Перетащите файлы сюда или нажмите для выбора'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                PNG, JPG, WEBP, GIF до 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-white mb-4">Загруженные файлы:</h4>
          {uploadedFiles.map((fileName) => (
            <div key={fileName} className="flex items-center justify-between glass rounded-xl p-4 animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-white font-medium">{fileName}</span>
              </div>
              <button
                onClick={() => removeUploadedFile(fileName)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
