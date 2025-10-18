# Multi-Tenant CMS - Админ-панель

Современная админ-панель для управления сайтами клиентов с автоматическим деплоем через GitHub Actions.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Cloudflare R2
R2_ACCESS_KEY_ID=your_r2_access_key_here
R2_SECRET_ACCESS_KEY=your_r2_secret_key_here
R2_BUCKET_NAME=your_bucket_name_here
R2_ACCOUNT_ID=your_r2_account_id_here
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com

# GitHub
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO_OWNER=your_username
GITHUB_REPO_NAME=website-code
```

### 3. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📋 Настройка сервисов

### Clerk (Аутентификация)

1. Создайте аккаунт на [clerk.com](https://clerk.com)
2. Создайте новое приложение
3. Включите Google Provider в настройках
4. Скопируйте ключи в `.env.local`

### Cloudflare R2 (Хранилище)

1. Создайте аккаунт на [cloudflare.com](https://cloudflare.com)
2. Перейдите в R2 Object Storage
3. Создайте новый bucket
4. Создайте API токен с правами Read & Write
5. Скопируйте данные в `.env.local`

### GitHub (Автоматизация)

1. Создайте репозиторий для сайтов клиентов
2. Создайте Personal Access Token с правами repo
3. Скопируйте токен в `.env.local`

## 🏗️ Архитектура

```
admin-panel/
├── src/
│   ├── app/
│   │   ├── api/files/          # API маршруты для работы с файлами
│   │   ├── dashboard/          # Страницы дашборда
│   │   └── page.tsx           # Главная страница
│   ├── components/
│   │   └── FileUploader.tsx   # Компонент загрузки файлов
│   └── lib/
│       ├── r2.ts              # Функции для работы с R2
│       └── github.ts          # Функции для работы с GitHub
└── middleware.ts              # Middleware для аутентификации
```

## 🔧 Функции

- ✅ Аутентификация через Google (Clerk)
- ✅ Загрузка изображений в Cloudflare R2
- ✅ JSON редактор с Monaco Editor
- ✅ Валидация JSON с Zod схемами
- ✅ Изоляция данных клиентов
- ✅ Валидация файлов (тип, размер)
- ✅ Удаление файлов
- ✅ Современный UI с Tailwind CSS
- ✅ TypeScript для типобезопасности

## 📝 TODO

- [ ] Предпросмотр сайта
- [ ] Экспорт данных в ZIP
- [ ] Триггер GitHub Actions
- [ ] Уведомления (toast)
- [ ] Создание второго репозитория для сайтов клиентов

## 🚀 Деплой

Проект готов для деплоя на Cloudflare Pages:

1. Подключите репозиторий к Cloudflare Pages
2. Добавьте переменные окружения
3. Деплой произойдет автоматически

## 📄 Лицензия

MIT