import { saveJsonFile } from '@/lib/r2';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fileName, content } = await request.json();
    
    if (!fileName || !content) {
      return NextResponse.json({ error: 'File name and content are required' }, { status: 400 });
    }

    await saveJsonFile('user_34EvUVHa2Fv9rbrXKRzHCbR7791', fileName, content);
    
    return NextResponse.json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}