'use client';

import ImageUploadField from '@/components/ImageUploadField';
import { FieldConfig } from '@/types/site';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

interface DynamicFormRendererProps {
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
}

export default function DynamicFormRenderer({ 
  fields, 
  initialValues = {}, 
  onSubmit 
}: DynamicFormRendererProps) {
  const { user } = useUser();
  const [values, setValues] = useState(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const renderField = (field: FieldConfig) => {
    const { name, type, title, required, options } = field;
    const value = values[name] || '';

    switch (type) {
      case 'text':
        return (
          <input
            key={name}
            type="text"
            value={value}
            onChange={(e) => setValues(prev => ({ ...prev, [name]: e.target.value }))}
            placeholder={title}
            required={required}
            className="w-full p-2 border rounded"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            key={name}
            value={value}
            onChange={(e) => setValues(prev => ({ ...prev, [name]: e.target.value }))}
            placeholder={title}
            required={required}
            className="w-full p-2 border rounded"
            rows={4}
          />
        );
      
      case 'select':
        return (
          <select
            key={name}
            value={value}
            onChange={(e) => setValues(prev => ({ ...prev, [name]: e.target.value }))}
            required={required}
            className="w-full p-2 border rounded"
          >
            <option value="">Выберите...</option>
            {options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'image':
        return (
          <ImageUploadField
            key={name}
            value={value}
            onChange={(url: string) => setValues(prev => ({ ...prev, [name]: url }))}
            onUpload={async (file: File) => {
              if (!user) throw new Error('User not logged in');
              
              const formData = new FormData();
              formData.append('file', file);
              formData.append('prefix', 'images/');

              const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) throw new Error('Upload failed');
              
              const data = await response.json();
              return data.url;
            }}
          />
        );
      
      default:
        return (
          <input
            key={name}
            type="text"
            value={value}
            onChange={(e) => setValues(prev => ({ ...prev, [name]: e.target.value }))}
            placeholder={title}
            required={required}
            className="w-full p-2 border rounded"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(field => (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-medium">
            {field.title}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {field.description && (
            <p className="text-sm text-gray-500">{field.description}</p>
          )}
        </div>
      ))}
      
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Сохранить
      </button>
    </form>
  );
}
