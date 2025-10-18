import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { saveJsonFile } from '@/lib/r2';
import { z } from 'zod';

// Схема валидации для config.json
const configSchema = z.object({
  site: z.object({
    title: z.string().min(1, 'Название сайта обязательно'),
    description: z.string().optional(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
  }),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат цвета'),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат цвета'),
    fontFamily: z.string().optional(),
  }),
  pages: z.array(z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    content: z.string(),
    published: z.boolean().default(false),
  })).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, data } = await request.json();

    if (!filename || !data) {
      return NextResponse.json(
        { error: 'Filename and data are required' },
        { status: 400 }
      );
    }

    // Валидация для config.json
    if (filename === 'config.json') {
      try {
        configSchema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { 
              error: 'Validation failed',
              details: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
              }))
            },
            { status: 400 }
          );
        }
        throw error;
      }
    }

    const result = await saveJsonFile(userId, filename, data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving JSON file:', error);
    return NextResponse.json(
      { error: 'Failed to save JSON file' },
      { status: 500 }
    );
  }
}
