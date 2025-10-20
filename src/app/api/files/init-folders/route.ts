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

// Стандартные папки для каждого клиента
const DEFAULT_FOLDERS = [
  'logos',
  'hero', 
  'about',
  'services',
  'gallery',
  'general'
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const createdFolders = [];

    // Создаем все стандартные папки
    for (const folder of DEFAULT_FOLDERS) {
      const folderKey = `clients/${userId}/images/${folder}/`;
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: folderKey,
        Body: '',
        ContentType: 'application/x-directory',
      });

      try {
        await s3Client.send(command);
        createdFolders.push(folder);
      } catch (error) {
        console.log(`Folder ${folder} might already exist`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Создано ${createdFolders.length} папок`,
      folders: createdFolders
    });
  } catch (error) {
    console.error('Error creating folders:', error);
    return NextResponse.json(
      { error: 'Failed to create folders' },
      { status: 500 }
    );
  }
}
