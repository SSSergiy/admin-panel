# Инструкция по установке

## Шаг 1: Установка зависимостей

Откройте терминал в папке `admin-panel` и выполните:

```bash
npm install
```

## Шаг 2: Настройка переменных окружения

Создайте файл `.env.local` в папке `admin-panel`:

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

## Шаг 3: Настройка Clerk

1. Перейдите на [clerk.com](https://clerk.com)
2. Создайте новый проект
3. В разделе "Authentication" включите Google Provider
4. Скопируйте ключи в `.env.local`

## Шаг 4: Настройка Cloudflare R2

1. Перейдите на [cloudflare.com](https://cloudflare.com)
2. Войдите в R2 Object Storage
3. Создайте новый bucket
4. Создайте API токен с правами Read & Write
5. Скопируйте данные в `.env.local`

## Шаг 5: Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Что уже готово:

✅ Next.js проект с TypeScript и Tailwind CSS
✅ Интеграция с Clerk для аутентификации
✅ Функции для работы с Cloudflare R2
✅ API маршруты для загрузки/удаления файлов
✅ JSON редактор с Monaco Editor
✅ Валидация JSON с Zod схемами
✅ Компонент загрузки файлов с drag & drop
✅ Страницы дашборда, загрузки и редактирования
✅ Middleware для защиты маршрутов
✅ Валидация файлов (тип, размер)

## Следующие шаги:

1. Настройте переменные окружения
2. Запустите проект
3. Протестируйте аутентификацию
4. Протестируйте загрузку файлов
5. Протестируйте JSON редактор
6. Настройте GitHub Actions для автоматического деплоя
