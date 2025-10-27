import { listClientFiles } from '@/lib/r2';
import { checkApiRateLimit } from '@/lib/rate-limit';
import { validatePrefix } from '@/lib/validation';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🚦 Rate limiting
    if (!checkApiRateLimit(userId, '/api/files/list')) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';

    // 🔒 Валидация prefix
    if (prefix && !validatePrefix(prefix)) {
      return NextResponse.json({ error: 'Invalid prefix' }, { status: 400 });
    }

    const files = await listClientFiles(userId, prefix);
    
    
    // Показываем папки, но исключаем саму папку images/
    const folders = files.filter(file => {
      const key = file.Key || '';
      if (!key.endsWith('/')) return false;
      
      // Исключаем саму папку images/ (пустую папку)
      const withoutClientPrefix = key.replace(`clients/${userId}/`, '');
      if (withoutClientPrefix === 'images/') return false;
      
      return true;
    }).map(folder => ({
      ...folder,
      type: 'folder' as const
    }));
    
    
    const imageFiles = files.filter(file => {
      const key = file.Key || '';
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(key);
      const isNotFolder = !key.endsWith('/');
      return isImage && isNotFolder;
    });
    
    // Добавляем URL для каждого файла
    // Используем API прокси вместо прямого R2 URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log(`🔗 Using API proxy URL: ${apiBaseUrl}`);
    
    const filesWithUrls = imageFiles.map(file => ({
      ...file,
      url: `${apiBaseUrl}/api/images/${file.Key}`,
      type: 'file'
    }));
    
    const foldersWithUrls = folders.map(folder => ({
      ...folder,
      url: null, // Папки не имеют URL
      type: 'folder'
    }));
    
    // Объединяем папки и файлы
    const allItems = [...foldersWithUrls, ...filesWithUrls];

    return NextResponse.json({ files: allItems });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
