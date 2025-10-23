'use client';

import { useEffect, useState } from 'react';

interface FieldSchema {
  type: string;
  title: string;
  description?: string;
  properties?: Record<string, FieldSchema>;
  items?: FieldSchema;
  enum?: string[];
  enumNames?: string[];
  format?: string;
  'x-widget'?: string;
}

interface JsonFormRendererProps {
  schema: FieldSchema;
  data: any;
  onChange: (data: any) => void;
  uischema?: any;
}

export function JsonFormRenderer({ schema, data, onChange, uischema }: JsonFormRendererProps) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleFieldChange = (fieldPath: string, value: any) => {
    const newData = { ...formData };
    const keys = fieldPath.split('.');
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setFormData(newData);
    onChange(newData);
  };

  const renderField = (fieldName: string, fieldSchema: FieldSchema, fieldPath: string) => {
    const value = formData[fieldName] || '';
    const widget = fieldSchema['x-widget'] || getDefaultWidget(fieldSchema);

    switch (widget) {
      case 'text':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {fieldSchema.title}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={fieldSchema.description}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {fieldSchema.title}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={fieldSchema.description}
              rows={4}
            />
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {fieldSchema.title}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите...</option>
              {fieldSchema.enum?.map((option, index) => (
                <option key={option} value={option}>
                  {fieldSchema.enumNames?.[index] || option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'image':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {fieldSchema.title}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="URL изображения"
            />
            {value && (
              <div className="mt-2">
                <img
                  src={value}
                  alt={fieldSchema.title}
                  className="w-32 h-32 object-cover rounded-lg border border-white/20"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );

      case 'color':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {fieldSchema.title}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={value}
                onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                className="w-12 h-10 rounded border border-white/20"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>
        );

      default:
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {fieldSchema.title}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={fieldSchema.description}
            />
          </div>
        );
    }
  };

  const getDefaultWidget = (fieldSchema: FieldSchema): string => {
    if (fieldSchema.enum) return 'select';
    if (fieldSchema.format === 'textarea') return 'textarea';
    if (fieldSchema.format === 'image') return 'image';
    if (fieldSchema.format === 'color') return 'color';
    return 'text';
  };

  const renderObject = (schema: FieldSchema, data: any, path: string = '') => {
    if (!schema.properties) return null;

    return (
      <div className="space-y-4">
        {Object.entries(schema.properties).map(([fieldName, fieldSchema]) => {
          const fieldPath = path ? `${path}.${fieldName}` : fieldName;
          return renderField(fieldName, fieldSchema, fieldPath);
        })}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="glass rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          {schema.title || 'Редактирование секции'}
        </h2>
        {renderObject(schema, formData)}
      </div>
    </div>
  );
}
