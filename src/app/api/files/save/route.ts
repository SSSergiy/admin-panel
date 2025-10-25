import { triggerGitHubBuild } from '@/lib/github';
import { saveJsonFile } from '@/lib/r2';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📡 API /api/files/save called');
    
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, content } = await request.json();
    console.log('📄 Saving file:', fileName);
    
    if (!fileName || !content) {
      console.log('❌ Missing fileName or content');
      return NextResponse.json({ error: 'File name and content are required' }, { status: 400 });
    }

    // Сохраняем файл в R2
    console.log('💾 Saving to R2...');
    await saveJsonFile(userId, fileName, content);
    console.log('✅ File saved to R2');
    
    // 🚀 Триггерим GitHub Actions если изменился content.json
    if (fileName === 'content.json') {
      console.log('🔄 Content.json updated, triggering GitHub Actions...');
      const triggered = await triggerGitHubBuild(userId);
      
      if (triggered) {
        console.log('✅ GitHub Actions triggered successfully');
      } else {
        console.log('❌ Failed to trigger GitHub Actions');
      }
    } else {
      console.log('ℹ️ File is not content.json, skipping GitHub trigger');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'File saved successfully',
      githubTriggered: fileName === 'content.json'
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}