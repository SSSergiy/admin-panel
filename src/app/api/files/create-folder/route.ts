import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { folderName, category } = await request.json();

    if (!folderName || !category) {
      return NextResponse.json({ error: 'Folder name and category are required' }, { status: 400 });
    }

    // Создаем папку, загружая пустой файл с "/" в конце
    const folderKey = `clients/${userId}/images/${category}/${folderName}/`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: folderKey,
      Body: '',
      ContentType: 'application/x-directory',
    });

    await s3Client.send(command);

    return NextResponse.json({ 
      success: true, 
      message: `Папка ${folderName} создана в категории ${category}`,
      path: folderKey
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
