import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Конфигурация R2 клиента
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

// Функция для получения списка файлов клиента
export async function listClientFiles(userId: string, prefix: string = '') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `clients/${userId}/${prefix}`,
    });

    const response = await r2Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
}

// Функция для загрузки файла
export async function uploadFile(userId: string, file: File, path: string) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `clients/${userId}/${path}`,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

// Функция для удаления файла
export async function deleteFile(userId: string, key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `clients/${userId}/${key}`,
    });

    await r2Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

// Функция для получения JSON файла
export async function getJsonFile(userId: string, filename: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `clients/${userId}/data/${filename}`,
    });

    const response = await r2Client.send(command);
    const content = await response.Body?.transformToString();
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error getting JSON file:', error);
    return null;
  }
}

// Функция для сохранения JSON файла
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveJsonFile(userId: string, filename: string, data: any) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `clients/${userId}/data/${filename}`,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });

    await r2Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error saving JSON file:', error);
    throw new Error('Failed to save JSON file');
  }
}

// Функция для автоматического создания стандартных папок
export async function ensureDefaultFolders(userId: string) {
  const DEFAULT_FOLDERS = ['logos', 'hero', 'about', 'services', 'gallery', 'general'];
  
  for (const folder of DEFAULT_FOLDERS) {
    try {
      const folderKey = `clients/${userId}/images/${folder}/`;
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: folderKey,
        Body: '',
        ContentType: 'application/x-directory',
      });

      await r2Client.send(command);
    } catch (error) {
      // Папка уже существует, это нормально
      console.log(`Folder ${folder} already exists or error creating it`);
    }
  }
}