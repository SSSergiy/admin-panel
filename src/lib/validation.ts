/**
 * Валидация входных данных для API
 */

/**
 * Валидирует имя файла
 * @param fileName - имя файла
 * @returns true если валидно
 */
export function validateFileName(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string') {
    return false;
  }
  
  // Запрещаем path traversal атаки
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }
  
  // Проверяем длину
  if (fileName.length > 255) {
    return false;
  }
  
  // Разрешаем только безопасные символы
  const safePattern = /^[a-zA-Z0-9._-]+$/;
  if (!safePattern.test(fileName)) {
    return false;
  }
  
  // Проверяем расширение
  const validExtensions = ['.json', '.js', '.ts', '.html', '.css'];
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  return hasValidExtension;
}

/**
 * Валидирует content для JSON
 * @param content - содержимое
 * @returns true если валидно
 */
export function validateJsonContent(content: any): boolean {
  if (!content || typeof content !== 'object') {
    return false;
  }
  
  try {
    // Проверяем что content можно сериализовать в JSON
    JSON.stringify(content);
    
    // Проверяем что нет опасных полей
    const contentStr = JSON.stringify(content);
    
    // Запрещаем инъекции
    if (contentStr.includes('__proto__') || 
        contentStr.includes('constructor') || 
        contentStr.includes('prototype')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Валидирует prefix (путь)
 * @param prefix - префикс пути
 * @returns true если валидно
 */
export function validatePrefix(prefix: string): boolean {
  if (!prefix || typeof prefix !== 'string') {
    return false;
  }
  
  // Запрещаем path traversal
  if (prefix.includes('..')) {
    return false;
  }
  
  // Проверяем длину
  if (prefix.length > 512) {
    return false;
  }
  
  // Разрешаем только безопасные символы в путях
  const safePattern = /^[a-zA-Z0-9/_/-]*$/;
  return safePattern.test(prefix);
}

/**
 * Валидирует key для удаления/получения файлов
 * @param key - ключ файла
 * @returns true если валидно
 */
export function validateFileKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  // Запрещаем path traversal
  if (key.includes('..')) {
    return false;
  }
  
  // Проверяем что key начинается с правильного префикса
  if (!key.startsWith('clients/')) {
    return false;
  }
  
  return true;
}

/**
 * Валидирует тип изображения
 * @param mimeType - MIME тип
 * @returns true если валидно
 */
export function validateImageType(mimeType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  return allowedTypes.includes(mimeType);
}

/**
 * Валидирует размер файла
 * @param size - размер в байтах
 * @param maxSizeMB - максимальный размер в МБ
 * @returns true если валидно
 */
export function validateFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size > 0 && size <= maxSizeBytes;
}

