'use client';

import { Editor } from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface JSONEditorProps {
  initialValue?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any) => Promise<void>;
  onError?: (error: string) => void;
  filename: string;
}

export default function JSONEditor({ 
  initialValue = '{}', 
  onSave, 
  onError,
  filename 
}: JSONEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Валидация JSON
  const validateJSON = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      setError(null);
      setIsValid(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMessage);
      setIsValid(false);
      return false;
    }
  };

  // Обработка изменений
  const handleEditorChange = (newValue: string | undefined) => {
    const jsonValue = newValue || '';
    setValue(jsonValue);
    validateJSON(jsonValue);
    setSaved(false);
  };

  // Сохранение
  const handleSave = async () => {
    if (!isValid) {
      onError?.('JSON содержит ошибки. Исправьте их перед сохранением.');
      return;
    }

    try {
      setSaving(true);
      const parsedData = JSON.parse(value);
      await onSave(parsedData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000); // Скрыть уведомление через 2 сек
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка сохранения';
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isValid, value]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">{filename}</h3>
          {isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
            ${isValid && !saving
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Сохранение...' : saved ? 'Сохранено!' : 'Сохранить'}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Ошибка JSON:</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={handleEditorChange}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <span>Ctrl+S для сохранения</span>
          <span>{value.length} символов</span>
        </div>
      </div>
    </div>
  );
}
