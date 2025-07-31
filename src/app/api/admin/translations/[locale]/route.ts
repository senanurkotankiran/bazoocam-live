import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

// GET - Fetch translation file
export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  try {
    const messagesDir = path.join(process.cwd(), 'messages');
    const filePath = path.join(messagesDir, `${params.locale}.json`);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const translations = JSON.parse(fileContent);

      return NextResponse.json({
        success: true,
        data: translations
      });
    } catch (error) {
      // If file doesn't exist, return empty translations
      return NextResponse.json({
        success: true,
        data: {}
      });
    }
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

// PUT - Update translation file
export async function PUT(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const messagesDir = path.join(process.cwd(), 'messages');
    const filePath = path.join(messagesDir, `${params.locale}.json`);

    // Ensure messages directory exists
    try {
      await fs.access(messagesDir);
    } catch {
      await fs.mkdir(messagesDir, { recursive: true });
    }

    // Write updated translations to file
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Translations updated successfully'
    });
  } catch (error) {
    console.error('Error updating translations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update translations' },
      { status: 500 }
    );
  }
} 