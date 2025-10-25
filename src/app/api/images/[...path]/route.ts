import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

// R2 клиент
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/');
    
    // 🔒 БЕЗОПАСНО: Используем только изображения, не JSON файлы
    if (imagePath.includes('data/') || imagePath.endsWith('.json')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imagePath,
    });

    const response = await r2Client.send(command);
    const body = await response.Body?.transformToByteArray();
    
    if (!body) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Возвращаем изображение с правильными заголовками
    return new NextResponse(body, {
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // 1 год кеша
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}
