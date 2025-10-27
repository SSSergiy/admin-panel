import { deleteFile } from '@/lib/r2';
import { checkApiRateLimit } from '@/lib/rate-limit';
import { validateFileKey } from '@/lib/validation';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🚦 Rate limiting
    if (!checkApiRateLimit(userId, '/api/files/delete')) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 });
    }

    // 🔒 Валидация ключа файла
    if (!validateFileKey(key)) {
      return NextResponse.json({ error: 'Invalid file key' }, { status: 400 });
    }

    await deleteFile(userId, key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
