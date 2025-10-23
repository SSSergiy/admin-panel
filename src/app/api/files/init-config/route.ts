import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // НЕ СОЗДАЕМ admin.config.json - он должен быть в R2!
    // Админка должна загружать конфигурацию из R2, а не создавать её
    return NextResponse.json({ 
      error: 'admin.config.json должен быть загружен из R2, а не создан здесь' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error initializing config:', error);
    return NextResponse.json({ error: 'Failed to initialize config' }, { status: 500 });
  }
}
