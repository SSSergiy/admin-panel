import { getJsonFile } from '@/lib/r2';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 🔒 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем авторизацию
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Unauthorized access attempt to /api/files/get');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    // 🔒 БЕЗОПАСНО: Используем userId из сессии, а не хардкод
    console.log(`🔍 User ${userId} requesting file: ${fileName}`);
    const jsonData = await getJsonFile(userId, fileName);
    
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error loading file:', error);
    return NextResponse.json({ error: 'Failed to load file' }, { status: 500 });
  }
}