import { uploadFile } from '@/lib/r2';
import { checkApiRateLimit } from '@/lib/rate-limit';
import { validateFileSize, validateImageType, validatePrefix } from '@/lib/validation';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🚦 Rate limiting
    if (!checkApiRateLimit(userId, '/api/files/upload')) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const prefix = formData.get('prefix') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 🔒 Валидация типа файла
    if (!validateImageType(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // 🔒 Валидация размера файла
    if (!validateFileSize(file.size, 10)) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // 🔒 Валидация prefix
    if (prefix && !validatePrefix(prefix)) {
      return NextResponse.json({ error: 'Invalid prefix' }, { status: 400 });
    }

    const fileName = `${prefix}${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const url = await uploadFile(userId, fileName, Buffer.from(fileBuffer), file.type);

    return NextResponse.json({ 
      success: true, 
      fileName,
      url 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
