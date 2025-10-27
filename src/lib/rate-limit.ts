/**
 * Rate limiting для защиты от спама и DDoS
 * Простая in-memory реализация
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Очищает старые записи
 */
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Проверяет rate limit
 * @param identifier - уникальный идентификатор (userId, IP, etc)
 * @param maxRequests - максимальное количество запросов
 * @param windowMs - окно времени в миллисекундах
 * @returns true если можно продолжить, false если лимит exceeded
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): boolean {
  // Очищаем старые записи каждые 5 секунд
  if (Math.random() < 0.1) {
    cleanup();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    // Создаем новую запись
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  // Инкрементируем счетчик
  entry.count++;

  if (entry.count > maxRequests) {
    console.log(`🚫 Rate limit exceeded for ${identifier}`);
    return false;
  }

  return true;
}

/**
 * Проверяет rate limit для API endpoints
 * @param userId - ID пользователя
 * @param endpoint - имя endpoint
 * @returns true если можно продолжить
 */
export function checkApiRateLimit(userId: string, endpoint: string): boolean {
  // Разные лимиты для разных endpoints
  const limits: Record<string, { max: number; window: number }> = {
    '/api/files/save': { max: 100, window: 60 * 1000 }, // 100 в минуту
    '/api/files/upload': { max: 50, window: 60 * 1000 }, // 50 в минуту
    '/api/files/delete': { max: 200, window: 60 * 1000 }, // 200 в минуту
    '/api/files/get': { max: 300, window: 60 * 1000 }, // 300 в минуту
    '/api/files/list': { max: 100, window: 60 * 1000 }, // 100 в минуту
  };

  const limit = limits[endpoint] || { max: 100, window: 60 * 1000 };
  const identifier = `${userId}:${endpoint}`;

  return checkRateLimit(identifier, limit.max, limit.window);
}

