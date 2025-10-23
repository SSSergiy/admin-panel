import { saveJsonFile } from '@/lib/r2';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, data } = await request.json();

    if (!filename || !data) {
      return NextResponse.json({ error: 'Filename and data are required' }, { status: 400 });
    }

    await saveJsonFile(userId, filename, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
