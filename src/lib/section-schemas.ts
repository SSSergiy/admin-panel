// JSON схемы для динамического создания редакторов секций

export interface FieldSchema {
  type: 'text' | 'textarea' | 'email' | 'tel' | 'url' | 'image' | 'array' | 'object';
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number; // для textarea
  fields?: FieldSchema[]; // для object и array
  itemSchema?: FieldSchema; // для array
  imageCategory?: string; // для image
}

export interface SectionSchema {
  type: string;
  title: string;
  description: string;
  fields: FieldSchema[];
}

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  header: {
    type: 'header',
    title: 'Шапка сайта',
    description: 'Навигация и логотип',
    fields: [
      {
        type: 'image',
        label: 'Логотип',
        imageCategory: 'logos',
        required: false
      },
      {
        type: 'array',
        label: 'Навигационное меню',
        itemSchema: {
          type: 'object',
          fields: [
            { type: 'text', label: 'Название пункта', placeholder: 'Главная' },
            { type: 'text', label: 'Ссылка', placeholder: '/' }
          ]
        }
      },
      {
        type: 'object',
        label: 'Кнопка призыва к действию',
        fields: [
          { type: 'text', label: 'Текст кнопки', placeholder: 'Связаться' },
          { type: 'text', label: 'URL кнопки', placeholder: '/contact' }
        ]
      }
    ]
  },
  
  hero: {
    type: 'hero',
    title: 'Главный баннер',
    description: 'Главный баннер',
    fields: [
      { type: 'text', label: 'Заголовок', placeholder: 'Главный заголовок', required: true },
      { type: 'textarea', label: 'Подзаголовок', placeholder: 'Краткое описание', rows: 3 },
      {
        type: 'image',
        label: 'Фоновое изображение',
        imageCategory: 'hero',
        required: false
      },
      {
        type: 'object',
        label: 'Основная кнопка',
        fields: [
          { type: 'text', label: 'Текст кнопки', placeholder: 'Начать работу' },
          { type: 'text', label: 'URL кнопки', placeholder: '/contact' }
        ]
      },
      {
        type: 'object',
        label: 'Второстепенная кнопка',
        fields: [
          { type: 'text', label: 'Текст кнопки', placeholder: 'Узнать больше' },
          { type: 'text', label: 'URL кнопки', placeholder: '/about' }
        ]
      }
    ]
  },
  
  about: {
    type: 'about',
    title: 'О нас',
    description: 'Информация о компании',
    fields: [
      { type: 'text', label: 'Заголовок', placeholder: 'О нашей компании', required: true },
      { type: 'textarea', label: 'Описание', placeholder: 'Описание вашей компании', rows: 4 },
      {
        type: 'array',
        label: 'Особенности',
        itemSchema: {
          type: 'object',
          fields: [
            { type: 'text', label: 'Иконка (эмодзи)', placeholder: '🚀' },
            { type: 'text', label: 'Заголовок', placeholder: 'Название особенности' },
            { type: 'textarea', label: 'Описание', placeholder: 'Описание особенности', rows: 2 }
          ]
        }
      }
    ]
  },
  
  services: {
    type: 'services',
    title: 'Наши услуги',
    description: 'Список услуг',
    fields: [
      { type: 'text', label: 'Заголовок', placeholder: 'Что мы предлагаем', required: true },
      { type: 'text', label: 'Подзаголовок', placeholder: 'Полный спектр услуг для вашего бизнеса' },
      {
        type: 'array',
        label: 'Услуги',
        itemSchema: {
          type: 'object',
          fields: [
            { type: 'text', label: 'Название услуги', placeholder: 'Веб-разработка' },
            { type: 'textarea', label: 'Описание', placeholder: 'Описание услуги', rows: 2 },
            { type: 'text', label: 'Иконка (эмодзи)', placeholder: '💻' },
            { type: 'text', label: 'Цена', placeholder: 'от 50,000₽' },
            {
              type: 'array',
              label: 'Особенности',
              itemSchema: {
                type: 'text',
                placeholder: 'Адаптивный дизайн'
              }
            }
          ]
        }
      }
    ]
  },
  
  contact: {
    type: 'contact',
    title: 'Контакты',
    description: 'Контактная информация',
    fields: [
      { type: 'text', label: 'Заголовок', placeholder: 'Свяжитесь с нами', required: true },
      { type: 'text', label: 'Подзаголовок', placeholder: 'Готовы обсудить ваш проект?' },
      { type: 'email', label: 'Email', placeholder: 'info@example.com' },
      { type: 'tel', label: 'Телефон', placeholder: '+7 (999) 123-45-67' },
      { type: 'textarea', label: 'Адрес', placeholder: 'Москва, ул. Примерная, д. 1', rows: 2 },
      {
        type: 'array',
        label: 'Социальные сети',
        itemSchema: {
          type: 'object',
          fields: [
            { type: 'text', label: 'Платформа', placeholder: 'Telegram' },
            { type: 'url', label: 'URL', placeholder: 'https://t.me/example' }
          ]
        }
      }
    ]
  },
  
  footer: {
    type: 'footer',
    title: 'Подвал сайта',
    description: 'Подвал сайта',
    fields: [
      {
        type: 'image',
        label: 'Логотип',
        imageCategory: 'logos',
        required: false
      },
      { type: 'textarea', label: 'Описание компании', placeholder: 'Краткое описание вашей компании', rows: 3 },
      {
        type: 'array',
        label: 'Ссылки',
        itemSchema: {
          type: 'object',
          fields: [
            { type: 'text', label: 'Название группы', placeholder: 'Компания' },
            {
              type: 'array',
              label: 'Ссылки группы',
              itemSchema: {
                type: 'object',
                fields: [
                  { type: 'text', label: 'Название ссылки', placeholder: 'О нас' },
                  { type: 'text', label: 'URL', placeholder: '/about' }
                ]
              }
            }
          ]
        }
      },
      { type: 'text', label: 'Copyright', placeholder: '© 2024 Ваша компания. Все права защищены.' }
    ]
  }
};

// Функция для получения схемы секции по типу
export function getSectionSchema(type: string): SectionSchema | null {
  return SECTION_SCHEMAS[type] || null;
}

// Функция для получения всех доступных типов секций
export function getAvailableSectionTypes(): Array<{type: string, title: string, description: string}> {
  return Object.values(SECTION_SCHEMAS).map(schema => ({
    type: schema.type,
    title: schema.title,
    description: schema.description
  }));
}
