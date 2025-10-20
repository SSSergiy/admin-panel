import { FieldSchema } from './section-schemas';

// Удален неиспользуемый интерфейс MappingRule

// Удалены все хардкод правила - теперь используется только универсальный camelCase

// Кэш для пользовательских маппингов полей
const CUSTOM_FIELD_MAPPINGS = new Map<string, string>();

// Функция для установки пользовательского маппинга поля
export function setFieldMapping(fieldLabel: string, key: string): void {
  CUSTOM_FIELD_MAPPINGS.set(fieldLabel.toLowerCase(), key);
}

// Функция для получения пользовательского маппинга поля
export function getFieldMapping(fieldLabel: string): string | undefined {
  return CUSTOM_FIELD_MAPPINGS.get(fieldLabel.toLowerCase());
}

// Функция для автоматического создания ключа поля на основе его типа и контекста
export function getFieldKey(field: FieldSchema): string {
  // УНИВЕРСАЛЬНАЯ ЛОГИКА: всегда используем camelCase
  // Это работает для всех полей - и корневых, и вложенных
  const autoKey = toCamelCase(field.label);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Field Key] "${field.label}" -> "${autoKey}" (auto camelCase)`);
  }
  return autoKey;
}

// Функция для автоматической генерации ключа поля (устарела, используется только camelCase)
// function generateFieldKey(field: FieldSchema): string {
//   const label = field.label.toLowerCase();
//   
//   // Ищем подходящее правило в конфигурации
//   for (const rule of FIELD_MAPPING_RULES) {
//     const { patterns, key, requireAll = false } = rule;
//     
//     if (requireAll) {
//       // Все паттерны должны присутствовать
//       if (patterns.every(pattern => label.includes(pattern))) {
//         return key;
//       }
//     } else {
//       // Любой из паттернов должен присутствовать
//       if (patterns.some(pattern => label.includes(pattern))) {
//         return key;
//       }
//     }
//   }
//   
//   // Если не найдено специальное правило, используем camelCase
//   return toCamelCase(field.label);
// }

// Функция для преобразования строки в camelCase
function toCamelCase(str: string): string {
  // Если строка уже в camelCase (начинается с маленькой буквы), возвращаем как есть
  if (str.length > 0 && str[0] === str[0].toLowerCase() && str[0] !== str[0].toUpperCase()) {
    return str;
  }
  
  // Обрабатываем PascalCase (например, "CtaButton" -> "ctaButton")
  if (str.length > 1 && str[0] === str[0].toUpperCase() && str[1] === str[1].toLowerCase()) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
  
  // Обрабатываем обычные строки с пробелами
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        // Первое слово - все в нижнем регистре
        return word.toLowerCase();
      } else {
        // Остальные слова - первая буква заглавная, остальные строчные
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join('');
}

// Удалены неиспользуемые функции для работы с правилами маппинга

// Функция для массовой установки пользовательских маппингов
export function setFieldMappings(mappings: Record<string, string>): void {
  Object.entries(mappings).forEach(([label, key]) => {
    setFieldMapping(label, key);
  });
}

// Функция для получения всех пользовательских маппингов
export function getCustomFieldMappings(): Record<string, string> {
  const result: Record<string, string> = {};
  CUSTOM_FIELD_MAPPINGS.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// Функция для очистки пользовательских маппингов
export function clearCustomFieldMappings(): void {
  CUSTOM_FIELD_MAPPINGS.clear();
}

// Функция для удаления конкретного пользовательского маппинга
export function removeFieldMapping(fieldLabel: string): boolean {
  return CUSTOM_FIELD_MAPPINGS.delete(fieldLabel.toLowerCase());
}

// Функция для автоматической генерации схемы полей на основе данных
export function generateSchemaFromData(data: Record<string, unknown>): FieldSchema[] {
  const fields: FieldSchema[] = [];
  
  function processValue(key: string, value: unknown, level = 0): FieldSchema {
    // Универсальное определение типа поля на основе содержимого и контекста
    if (typeof value === 'string') {
      // Анализируем содержимое строки для определения типа
      
      // Email - проверяем содержимое на паттерн email
      if (value.includes('@') && value.includes('.') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { type: 'email', label: key.charAt(0).toUpperCase() + key.slice(1), placeholder: `Enter ${key}` };
      }
      
      // URL - проверяем содержимое на паттерн URL
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('www.') || value.startsWith('/')) {
        return { type: 'url', label: key.charAt(0).toUpperCase() + key.slice(1), placeholder: `Enter ${key}` };
      }
      
      // Phone - проверяем содержимое на паттерн телефона
      if (/^[\+]?[0-9\s\-\(\)]{7,}$/.test(value.replace(/\s/g, ''))) {
        return { type: 'tel', label: key.charAt(0).toUpperCase() + key.slice(1), placeholder: `Enter ${key}` };
      }
      
      // Image - проверяем содержимое на паттерн изображения
      if (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || 
          value.includes('.gif') || value.includes('.webp') || value.includes('.svg') ||
          value.includes('images/') || value.includes('logo')) {
        return { type: 'image', label: key.charAt(0).toUpperCase() + key.slice(1), imageCategory: 'general' };
      }
      
      // Textarea - определяем по длине и содержимому
      if (value.length > 100 || value.includes('\n') || value.split(' ').length > 10) {
        return { type: 'textarea', label: key.charAt(0).toUpperCase() + key.slice(1), placeholder: `Enter ${key}`, rows: 3 };
      }
      
      // Обычный текст для всего остального
      return { type: 'text', label: key.charAt(0).toUpperCase() + key.slice(1), placeholder: `Enter ${key}` };
    } else if (typeof value === 'number') {
      return { type: 'text', label: key.charAt(0).toUpperCase() + key.slice(1), placeholder: `Enter ${key}` };
    } else if (typeof value === 'boolean') {
      return { type: 'text', label: key.charAt(0).toUpperCase() + key.slice(1), placeholder: `Enter ${key}` };
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        return {
          type: 'array',
          label: key.charAt(0).toUpperCase() + key.slice(1),
          itemSchema: {
            type: 'object',
            label: 'Item',
            fields: Object.entries(value[0] as Record<string, unknown>).map(([subKey, subValue]) => 
              processValue(subKey, subValue, level + 1)
            )
          }
        };
      } else {
        return {
          type: 'array',
          label: key.charAt(0).toUpperCase() + key.slice(1),
          itemSchema: {
            type: 'text',
            label: 'Item',
            placeholder: 'Enter item'
          }
        };
      }
    } else if (typeof value === 'object' && value !== null) {
      return {
        type: 'object',
        label: key.charAt(0).toUpperCase() + key.slice(1),
        fields: Object.entries(value as Record<string, unknown>).map(([subKey, subValue]) => 
          processValue(subKey, subValue, level + 1)
        )
      };
    } else {
      return {
        type: 'text',
        label: key.charAt(0).toUpperCase() + key.slice(1),
        placeholder: `Enter ${key}`
      };
    }
  }
  
  Object.entries(data).forEach(([key, value]) => {
    fields.push(processValue(key, value));
  });
  
  return fields;
}

// Функция для автоматического создания маппингов на основе существующих данных
export function autoCreateMappingsFromData(data: Record<string, unknown>, schema: FieldSchema[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auto Mapping] Анализируем данные для создания маппингов...');
  }
  
  // Функция для поиска подходящего ключа в данных
  function findMatchingKey(fieldLabel: string, dataObj: Record<string, unknown>): string | null {
    const fieldLabelLower = fieldLabel.toLowerCase();
    const availableKeys = Object.keys(dataObj);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auto Mapping] Ищем ключ для "${fieldLabel}" среди:`, availableKeys);
    }
    
    // 1. Точное совпадение (регистронезависимо)
    for (const key of availableKeys) {
      if (key.toLowerCase() === fieldLabelLower) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Auto Mapping] Найдено точное совпадение: "${key}"`);
        }
        return key;
      }
    }
    
    // 2. Простое сопоставление без хардкода
    // Ищем ключи, которые содержат слова из названия поля
    const fieldWords = fieldLabelLower.split(/\s+/);
    for (const key of availableKeys) {
      const keyLower = key.toLowerCase();
      const matchingWords = fieldWords.filter(word => keyLower.includes(word));
      if (matchingWords.length > 0) {
        console.log(`[Auto Mapping] Найдено по словам "${matchingWords.join(', ')}" -> "${key}"`);
        return key;
      }
    }
    
    // 3. Ищем частичное совпадение
    for (const key of availableKeys) {
      const keyLower = key.toLowerCase();
      if (keyLower.includes(fieldLabelLower) || fieldLabelLower.includes(keyLower)) {
        console.log(`[Auto Mapping] Найдено частичное совпадение: "${key}"`);
        return key;
      }
    }
    
    // 4. Ищем по ключевым словам
    const keywords = fieldLabelLower.split(/\s+/);
    for (const key of availableKeys) {
      const keyLower = key.toLowerCase();
      if (keywords.some(keyword => keyLower.includes(keyword))) {
        console.log(`[Auto Mapping] Найдено по ключевому слову: "${key}"`);
        return key;
      }
    }
    
    console.log(`[Auto Mapping] Ключ для "${fieldLabel}" не найден`);
    return null;
  }

  function processFields(fields: FieldSchema[], parentData: Record<string, unknown>, parentPath = '') {
    fields.forEach(field => {
      const fieldPath = parentPath ? `${parentPath}.${field.label}` : field.label;
      
      // Если это объект, обрабатываем его поля
      if (field.type === 'object' && field.fields) {
        const objectData = getNestedValue(parentData, parentPath) as Record<string, unknown> || {};
        processFields(field.fields, objectData, fieldPath);
      }
      // Если это массив, обрабатываем схему элементов
      else if (field.type === 'array' && field.itemSchema) {
        const arrayData = getNestedValue(parentData, parentPath) as unknown[] || [];
        if (arrayData.length > 0 && field.itemSchema.fields) {
          const firstItem = arrayData[0] as Record<string, unknown>;
          processFields(field.itemSchema.fields, firstItem, `${fieldPath}[0]`);
        }
      }
      // Для простых полей ищем подходящий ключ в данных
      else {
        const existingMapping = getFieldMapping(field.label);
        if (!existingMapping) {
          const matchingKey = findMatchingKey(field.label, parentData);
          if (matchingKey) {
            setFieldMapping(field.label, matchingKey);
            console.log(`[Auto Mapping] "${field.label}" -> "${matchingKey}" (найден в данных)`);
          } else {
            // Если не найден, используем camelCase
            const autoKey = toCamelCase(field.label);
            setFieldMapping(field.label, autoKey);
            console.log(`[Auto Mapping] "${field.label}" -> "${autoKey}" (camelCase fallback)`);
          }
        }
      }
    });
  }
  
  processFields(schema, data);
}

// Вспомогательная функция для получения вложенных значений
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (!path) return obj;
  return path.split('.').reduce((current: unknown, key: string) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj);
}

// Функция для создания маппинга на основе схемы
export function createFieldMapping(schema: FieldSchema[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  function processFields(fields: FieldSchema[]) {
    fields.forEach(field => {
      const key = getFieldKey(field);
      mapping[field.label.toLowerCase().replace(/\s+/g, '_')] = key;
      
      if (field.fields) {
        processFields(field.fields);
      }
    });
  }
  
  processFields(schema);
  return mapping;
}
