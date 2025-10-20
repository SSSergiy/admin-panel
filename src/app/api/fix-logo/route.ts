import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем текущий config
    const configResponse = await fetch(`https://pub-a6698d33e75a45ebb75c9b00d0c3ce2a.r2.dev/clients/${userId}/data/config.json`);
    const config = await configResponse.json();
    
    // Исправляем путь к логотипу в header секции
    const headerSection = config.sections.find((s: any) => s.type === 'header');
    if (headerSection && headerSection.data.logo && !headerSection.data.logo.includes('/')) {
      headerSection.data.logo = `logos/${headerSection.data.logo}`;
      console.log('Исправлен логотип:', headerSection.data.logo);
    }

    // Сохраняем обновленный config
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/files/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'config.json',
        data: config
      }),
    });

    if (saveResponse.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Логотип исправлен!',
        logo: headerSection?.data.logo 
      });
    } else {
      throw new Error('Failed to save config');
    }
  } catch (error) {
    console.error('Error fixing logo:', error);
    return NextResponse.json(
      { error: 'Failed to fix logo' },
      { status: 500 }
    );
  }
}
