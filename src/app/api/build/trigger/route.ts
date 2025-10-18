import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { triggerBuild, getWorkflowStatus } from '@/lib/github';

// Карта для отслеживания последних билдов пользователей
const lastBuildTime = new Map<string, number>();
const BUILD_COOLDOWN = 5 * 60 * 1000; // 5 минут

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверка rate limiting (не чаще 1 раза в 5 минут)
    const now = Date.now();
    const lastBuild = lastBuildTime.get(userId);
    
    if (lastBuild && (now - lastBuild) < BUILD_COOLDOWN) {
      const remainingTime = Math.ceil((BUILD_COOLDOWN - (now - lastBuild)) / 1000 / 60);
      return NextResponse.json(
        { 
          error: `Подождите ${remainingTime} минут перед следующим билдом`,
          remainingTime 
        },
        { status: 429 }
      );
    }

    // Запуск GitHub Actions workflow
    await triggerBuild();
    
    // Обновляем время последнего билда
    lastBuildTime.set(userId, now);

    return NextResponse.json({ 
      success: true,
      message: 'Билд успешно запущен. Сайт будет обновлен через 2-5 минут.'
    });
  } catch (error) {
    console.error('Error triggering build:', error);
    return NextResponse.json(
      { error: 'Не удалось запустить билд. Проверьте настройки GitHub.' },
      { status: 500 }
    );
  }
}

// GET для проверки статуса последнего workflow
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getWorkflowStatus();
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting workflow status:', error);
    return NextResponse.json(
      { error: 'Failed to get workflow status' },
      { status: 500 }
    );
  }
}


