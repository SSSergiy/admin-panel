// Пример использования универсальной системы маппинга полей

import {
	addMappingRule,
	addMappingRules,
	clearMappingRules,
	getMappingRules
} from './field-mapping';

// Пример 1: Добавление одного правила
export function addCustomMappingRule() {
  addMappingRule({
    patterns: ['кастомное', 'поле'],
    key: 'customField',
    requireAll: true
  });
}

// Пример 2: Добавление нескольких правил для новой секции
export function addBlogSectionMappings() {
  addMappingRules([
    { patterns: ['статья', 'article'], key: 'article' },
    { patterns: ['автор', 'author'], key: 'author' },
    { patterns: ['дата', 'date'], key: 'date' },
    { patterns: ['теги', 'tags'], key: 'tags' },
    { patterns: ['категория', 'category'], key: 'category' },
    { patterns: ['изображение', 'статьи'], key: 'articleImage', requireAll: true }
  ]);
}

// Пример 3: Добавление правил для e-commerce секции
export function addEcommerceMappings() {
  addMappingRules([
    { patterns: ['товар', 'product'], key: 'product' },
    { patterns: ['цена', 'price'], key: 'price' },
    { patterns: ['скидка', 'discount'], key: 'discount' },
    { patterns: ['количество', 'quantity'], key: 'quantity' },
    { patterns: ['в_корзину', 'add_to_cart'], key: 'addToCart', requireAll: true },
    { patterns: ['купить', 'buy'], key: 'buyNow', requireAll: true }
  ]);
}

// Пример 4: Получение всех правил для отладки
export function debugMappingRules() {
  const rules = getMappingRules();
  console.log('Current mapping rules:', rules);
  return rules;
}

// Пример 5: Очистка и настройка с нуля
export function resetToCustomMappings() {
  clearMappingRules();
  
  // Добавляем только необходимые правила
  addMappingRules([
    { patterns: ['заголовок'], key: 'title' },
    { patterns: ['описание'], key: 'description' },
    { patterns: ['кнопка'], key: 'button' }
  ]);
}

// Пример 6: Динамическое добавление правил на основе конфигурации
export function loadMappingsFromConfig(config: any) {
  if (config.customMappings) {
    addMappingRules(config.customMappings);
  }
}

// Пример 7: Установка пользовательского маппинга для конкретного поля
export function setCustomFieldMapping() {
  // Устанавливаем точный маппинг для поля
  setFieldMapping('Мое кастомное поле', 'myCustomField');
  setFieldMapping('Специальная кнопка', 'specialButton');
  setFieldMapping('Уникальный заголовок', 'uniqueTitle');
}

// Пример 8: Массовая установка пользовательских маппингов
export function setMultipleCustomMappings() {
  setFieldMappings({
    'Любое поле 1': 'anyField1',
    'Любое поле 2': 'anyField2',
    'Сложное название поля': 'complexFieldName',
    'Поле с пробелами': 'fieldWithSpaces',
    'Поле с цифрами 123': 'fieldWithNumbers123'
  });
}

// Пример 9: Получение всех пользовательских маппингов
export function debugCustomMappings() {
  const customMappings = getCustomFieldMappings();
  console.log('Custom field mappings:', customMappings);
  return customMappings;
}

// Пример 10: Удаление пользовательского маппинга
export function removeCustomMapping() {
  removeFieldMapping('Мое кастомное поле');
}

// Пример 11: Очистка всех пользовательских маппингов
export function clearAllCustomMappings() {
  clearCustomFieldMappings();
}

// Пример 12: Полная настройка с нуля
export function setupCustomFieldSystem() {
  // Очищаем все существующие маппинги
  clearMappingRules();
  clearCustomFieldMappings();
  
  // Устанавливаем только нужные нам маппинги
  setFieldMappings({
    'Заголовок': 'title',
    'Описание': 'description',
    'Кнопка': 'button',
    'Изображение': 'image',
    'Ссылка': 'link'
  });
  
  console.log('Custom field system setup complete!');
}
