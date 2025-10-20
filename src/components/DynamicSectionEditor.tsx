'use client';

import { autoCreateMappingsFromData, generateSchemaFromData, getFieldKey } from '@/lib/field-mapping';
import { FieldSchema } from '@/lib/section-schemas';
import { Image, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface DynamicSectionEditorProps {
  schema: FieldSchema[];
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function DynamicSectionEditor({ schema, data, onChange }: DynamicSectionEditorProps) {
  const [images, setImages] = useState<Array<{name: string, path: string, category: string}>>([]);
  const [showImageSelector, setShowImageSelector] = useState<string | null>(null);
  const imagesLoaded = useRef(false);
  
  // Всегда генерируем схему на основе данных
  const currentSchema = generateSchemaFromData(data);

  // Отладочная информация только в development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 DynamicSectionEditor data:', data);
    console.log('🔍 DynamicSectionEditor schema:', schema);
  }
  
  // Автоматически создаем маппинги на основе существующих данных
  useEffect(() => {
    autoCreateMappingsFromData(data, currentSchema);
  }, [data, currentSchema]);

  // Загружаем список изображений только один раз
  useEffect(() => {
    if (imagesLoaded.current) return; // Уже загружены
    
    const fetchImages = async () => {
      try {
        imagesLoaded.current = true;
        // Создаем только базовую структуру папок
        await fetch('/api/files/init-folders', { method: 'POST' });
        
        // Получаем все изображения без привязки к конкретным папкам
        const response = await fetch('/api/files/list?prefix=images/');
        const allImagesData = await response.json();
        
        // Обрабатываем все изображения универсально
        const allImages = allImagesData.files?.map((file: {Key: string}) => {
          // Определяем категорию на основе пути файла
          const pathParts = file.Key.split('/');
          const category = pathParts.length > 2 ? pathParts[2] : 'general';
          
          return {
            name: file.Key.split('/').pop() || '',
            path: file.Key.split('/').pop() || '',
            category: category
          };
        }) || [];
        
        setImages(allImages);
      } catch (error) {
        console.error('Error fetching images:', error);
        imagesLoaded.current = false; // Сброс при ошибке
      }
    };
    fetchImages();
  }, []);

  const getFieldValue = (fieldPath: string): unknown => {
    const pathParts = fieldPath.split('.');
    let current = data;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  };

  const updateField = (fieldPath: string, value: unknown) => {
    const newData = { ...data };
    const pathParts = fieldPath.split('.');
    let current = newData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]] as Record<string, unknown>;
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    onChange(newData);
  };

  const updateFieldByField = (field: FieldSchema, fieldPath: string, value: unknown) => {
    const actualFieldPath = fieldPath.includes('.') ? fieldPath : getFieldKey(field);
    updateField(actualFieldPath, value);
  };


  const addArrayItem = (fieldPath: string, itemSchema: FieldSchema) => {
    const currentArray = getFieldValue(fieldPath);
    const arrayValue = Array.isArray(currentArray) ? currentArray : [];
    const newItem = createDefaultValue(itemSchema);
    updateField(fieldPath, [...arrayValue, newItem]);
  };

  const removeArrayItem = (fieldPath: string, index: number) => {
    const currentArray = getFieldValue(fieldPath);
    const arrayValue = Array.isArray(currentArray) ? currentArray : [];
    updateField(fieldPath, arrayValue.filter((_, i: number) => i !== index));
  };

  // const updateArrayItem = (fieldPath: string, index: number, itemFieldPath: string, value: any) => {
  //   const currentArray = getFieldValue(fieldPath) || [];
  //   const newArray = [...currentArray];
  //   const item = { ...newArray[index] };
    
  //   const pathParts = itemFieldPath.split('.');
  //   let current = item;
    
  //   for (let i = 0; i < pathParts.length - 1; i++) {
  //     if (!current[pathParts[i]]) {
  //       current[pathParts[i]] = {};
  //     }
  //     current = current[pathParts[i]];
  //   }
    
  //   current[pathParts[pathParts.length - 1]] = value;
  //   newArray[index] = item;
  //   updateField(fieldPath, newArray);
  // };

  const createDefaultValue = (schema: FieldSchema): unknown => {
    switch (schema.type) {
      case 'text':
      case 'textarea':
      case 'email':
      case 'tel':
      case 'url':
        return '';
      case 'image':
        return '';
      case 'array':
        return [];
      case 'object':
        const obj: Record<string, unknown> = {};
        if (schema.fields) {
          schema.fields.forEach(field => {
            obj[field.label.toLowerCase().replace(/\s+/g, '_')] = createDefaultValue(field);
          });
        }
        return obj;
      default:
        return '';
    }
  };

  const renderField = (field: FieldSchema, fieldPath: string, level = 0, fieldIndex = 0): React.ReactElement | null => {
    const actualFieldPath = level === 0 ? getFieldKey(field) : fieldPath;
    const value = getFieldValue(actualFieldPath);
    const indentClass = level > 0 ? `ml-${level * 4}` : '';
    const uniqueKey = `${fieldPath}-${fieldIndex}-${field.label}`;
    
    // Отладка маппинга только в development
    if (level === 0 && process.env.NODE_ENV === 'development') {
      console.log(`[Field Mapping] "${field.label}" -> "${actualFieldPath}" = `, value);
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <div key={uniqueKey} className={`${indentClass} space-y-2`}>
            <label className="block text-sm font-semibold text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
                  <input
                    type={field.type}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => updateFieldByField(field, fieldPath, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={field.placeholder}
                  />
          </div>
        );

      case 'textarea':
        return (
          <div key={uniqueKey} className={`${indentClass} space-y-2`}>
            <label className="block text-sm font-semibold text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => updateFieldByField(field, fieldPath, e.target.value)}
              rows={field.rows || 3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'image':
        return (
          <div key={uniqueKey} className={`${indentClass} space-y-2`}>
            <label className="block text-sm font-semibold text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-gray-800/50 border-2 border-dashed border-gray-600 flex items-center justify-center">
                {typeof value === 'string' && value ? (
                  <img 
                    src={`https://pub-a6698d33e75a45ebb75c9b00d0c3ce2a.r2.dev/clients/user_34EvUVHa2Fv9rbrXKRzHCbR7791/images/${value}`} 
                    alt="Preview" 
                    className="w-12 h-12 object-contain" 
                  />
                ) : (
                  <Image className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex space-x-2">
                  <div className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white">
                    {typeof value === 'string' && value ? (
                      <span className="text-gray-300">{value}</span>
                    ) : (
                      <span className="text-gray-500">Изображение не выбрано</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowImageSelector(fieldPath)}
                    className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{typeof value === 'string' && value ? 'Изменить' : 'Выбрать'}</span>
                  </button>
                  {typeof value === 'string' && value && (
                    <button
                      onClick={() => updateFieldByField(field, fieldPath, '')}
                      className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Удалить</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Image Selector */}
            {showImageSelector === fieldPath && (
              <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <h4 className="text-sm font-semibold text-white mb-3">Выберите изображение:</h4>
                <div className="space-y-4">
                  {(() => {
                    // Группируем изображения по категориям динамически
                    const categories = [...new Set(images.map(img => img.category))];
                    return categories.map(category => {
                      const categoryImages = images.filter(img => img.category === category);
                      if (categoryImages.length === 0) return null;
                      
                      return (
                        <div key={category}>
                          <h5 className="text-xs font-medium text-gray-300 mb-2 capitalize">{category}</h5>
                          <div className="grid grid-cols-4 gap-3">
                            {categoryImages.map((image) => (
                                 <button
                                   key={image.name}
                                   onClick={() => {
                                     updateFieldByField(field, fieldPath, `${image.category}/${image.path}`);
                                     setShowImageSelector(null);
                                   }}
                                   className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                                 >
                              <img
                                src={`https://pub-a6698d33e75a45ebb75c9b00d0c3ce2a.r2.dev/clients/user_34EvUVHa2Fv9rbrXKRzHCbR7791/images/${image.category}/${image.path}`}
                                alt={image.name}
                                className="w-full h-16 object-cover rounded"
                              />
                              <p className="text-xs text-gray-400 mt-1 truncate">{image.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  });
                  })()}
                </div>
                {images.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Нет загруженных изображений. Загрузите изображения в разделе &quot;Изображения&quot;
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div key={uniqueKey} className={`${indentClass} space-y-4`}>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-white">
                {field.label}
              </label>
                     <button
                       onClick={() => addArrayItem(actualFieldPath, field.itemSchema!)}
                       className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors"
                     >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Добавить</span>
              </button>
            </div>

            <div className="space-y-3">
              {arrayValue.map((item: unknown, index: number) => (
                <div key={index} className="p-4 bg-gray-800/30 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 space-y-3">
                      {field.itemSchema && renderField(field.itemSchema, `${fieldPath}.${index}`, level + 1, index)}
                    </div>
                           <button
                             onClick={() => removeArrayItem(actualFieldPath, index)}
                             className="ml-3 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                           >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {arrayValue.length === 0 && (
                <div className="p-4 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-600 text-center">
                  <p className="text-gray-400 text-sm">Нет элементов. Нажмите &quot;Добавить&quot; чтобы создать первый элемент.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'object':
        return (
          <div key={uniqueKey} className={`${indentClass} space-y-4`}>
            <label className="block text-sm font-semibold text-white">
              {field.label}
            </label>
            <div className="p-4 bg-gray-800/30 rounded-xl space-y-4">
              {field.fields?.map((subField, subFieldIndex) => {
                const subFieldKey = getFieldKey(subField);
                const subFieldPath = `${actualFieldPath}.${subFieldKey}`;
                return renderField(subField, subFieldPath, level + 1, subFieldIndex);
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      {/* Поля редактора */}
      {currentSchema.map((field: FieldSchema, index: number) => {
        const fieldPath = getFieldKey(field);
        return renderField(field, fieldPath, 0, index);
      })}

    </div>
  );
}
