// Демонстрация универсальной системы маппинга полей

import { getFieldKey, setFieldMapping, setFieldMappings } from './field-mapping';
import { FieldSchema } from './section-schemas';

// Пример 1: Добавление ЛЮБОГО поля с любым названием
export function addAnyField() {
  // Можно добавить поле с любым названием
  setFieldMapping('Мое супер поле', 'mySuperField');
  setFieldMapping('Поле с пробелами и символами!', 'fieldWithSpacesAndSymbols');
  setFieldMapping('123 Числовое поле', 'numericField123');
  setFieldMapping('Поле с эмодзи 🚀', 'fieldWithEmoji');
  setFieldMapping('Очень длинное название поля которое может быть любым', 'veryLongFieldName');
}

// Пример 2: Массовое добавление полей
export function addMultipleFields() {
  setFieldMappings({
    'Любое поле 1': 'anyField1',
    'Любое поле 2': 'anyField2',
    'Специальное поле': 'specialField',
    'Уникальное поле': 'uniqueField',
    'Поле для тестирования': 'testField'
  });
}

// Пример 3: Создание поля с автоматическим ключом
export function createFieldWithAutoKey() {
  const field: FieldSchema = {
    label: 'Мое новое поле',
    type: 'text',
    placeholder: 'Введите значение'
  };
  
  // Ключ будет автоматически сгенерирован
  const key = getFieldKey(field);
  console.log(`Поле "${field.label}" получило ключ: "${key}"`);
  
  return key;
}

// Пример 4: Создание поля с пользовательским ключом
export function createFieldWithCustomKey() {
  const field: FieldSchema = {
    label: 'Сложное название поля',
    type: 'text',
    placeholder: 'Введите значение'
  };
  
  // Устанавливаем пользовательский ключ
  setFieldMapping('Сложное название поля', 'complexFieldName');
  
  // Теперь ключ будет пользовательским
  const key = getFieldKey(field);
  console.log(`Поле "${field.label}" получило ключ: "${key}"`);
  
  return key;
}

// Пример 5: Создание полей для новой секции
export function createNewSectionFields() {
  const fields: FieldSchema[] = [
    { label: 'Название секции', type: 'text' },
    { label: 'Описание секции', type: 'textarea' },
    { label: 'Изображение секции', type: 'image' },
    { label: 'Кнопка действия', type: 'text' },
    { label: 'Ссылка на страницу', type: 'url' }
  ];
  
  // Устанавливаем маппинги для всех полей
  setFieldMappings({
    'Название секции': 'sectionTitle',
    'Описание секции': 'sectionDescription', 
    'Изображение секции': 'sectionImage',
    'Кнопка действия': 'actionButton',
    'Ссылка на страницу': 'pageLink'
  });
  
  // Генерируем ключи для всех полей
  fields.forEach(field => {
    const key = getFieldKey(field);
    console.log(`Поле "${field.label}" -> ключ "${key}"`);
  });
  
  return fields;
}
