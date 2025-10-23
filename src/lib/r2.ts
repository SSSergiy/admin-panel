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
      Delimiter: '/', // Это ключевое изменение!
    });

    const response = await r2Client.send(command);
    
    // Объединяем папки и файлы
    const folders = (response.CommonPrefixes || []).map(prefix => ({
      Key: prefix.Prefix || '',
      LastModified: new Date().toISOString(),
      Size: 0,
    }));
    
    const files = response.Contents || [];
    
    return [...folders, ...files];
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
}

// Функция для загрузки файла
export async function uploadFile(userId: string, fileName: string, buffer: Buffer, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `clients/${userId}/${fileName}`,
      Body: buffer,
      ContentType: contentType,
    });

    await r2Client.send(command);
    
    // Возвращаем URL файла
    const publicUrl = `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`;
    const url = `${publicUrl}/clients/${userId}/${fileName}`;
    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
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
    const body = await response.Body?.transformToString();
    
    if (!body) {
      throw new Error('File not found');
    }

    return JSON.parse(body);
  } catch (error) {
    console.error('Error getting JSON file:', error);
    throw new Error('Failed to get JSON file');
  }
}

// Функция для сохранения JSON файла
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

// Функция для удаления файла
export async function deleteFile(userId: string, key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key, // Используем ключ как есть, без добавления префикса
    });

    await r2Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}
