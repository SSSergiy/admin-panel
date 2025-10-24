import { getJsonFile } from '@/lib/r2';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    const jsonData = await getJsonFile('user_34EvUVHa2Fv9rbrXKRzHCbR7791', fileName);
    
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error loading file:', error);
    return NextResponse.json({ error: 'Failed to load file' }, { status: 500 });
  }
}