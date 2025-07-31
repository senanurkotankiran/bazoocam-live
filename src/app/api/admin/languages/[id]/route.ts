import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Language from '@/models/Language';
import fs from 'fs/promises';
import path from 'path';

// GET - Fetch single language
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const language = await Language.findById(params.id).lean();
    
    if (!language) {
      return NextResponse.json(
        { success: false, error: 'Language not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(language))
    });
  } catch (error) {
    console.error('Error fetching language:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch language' },
      { status: 500 }
    );
  }
}

// PUT - Update language
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    const { code, name, nativeName, flag, isActive, isDefault } = body;

    // Check if language code already exists (excluding current language)
    if (code) {
      const existingLanguage = await Language.findOne({ 
        code, 
        _id: { $ne: params.id } 
      });
      if (existingLanguage) {
        return NextResponse.json(
          { success: false, error: 'Language code already exists' },
          { status: 400 }
        );
      }
    }

    const oldLanguage = await Language.findById(params.id);
    if (!oldLanguage) {
      return NextResponse.json(
        { success: false, error: 'Language not found' },
        { status: 404 }
      );
    }

    const oldCode = oldLanguage.code;

    // Update language
    const language = await Language.findByIdAndUpdate(
      params.id,
      { code, name, nativeName, flag, isActive, isDefault },
      { new: true, runValidators: true }
    );

    if (!language) {
      return NextResponse.json(
        { success: false, error: 'Language not found' },
        { status: 404 }
      );
    }

    // If code changed, rename translation file
    if (code && code !== oldCode) {
      await renameTranslationFile(oldCode, code);
    }

    // Config files are now dynamically read from database, no need to update them

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(language))
    });
  } catch (error) {
    console.error('Error updating language:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update language' },
      { status: 500 }
    );
  }
}

// DELETE - Delete language
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const language = await Language.findById(params.id);
    if (!language) {
      return NextResponse.json(
        { success: false, error: 'Language not found' },
        { status: 404 }
      );
    }

    // Prevent deleting default language
    if (language.isDefault) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete default language' },
        { status: 400 }
      );
    }

    // Check if there are other languages
    const languageCount = await Language.countDocuments({ isActive: true });
    if (languageCount <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last language' },
        { status: 400 }
      );
    }

    // Delete language
    await Language.findByIdAndDelete(params.id);

    // Delete translation file
    await deleteTranslationFile(language.code);

    // Config files are now dynamically read from database, no need to update them

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting language:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete language' },
      { status: 500 }
    );
  }
}

// Helper function to rename translation file
async function renameTranslationFile(oldCode: string, newCode: string) {
  try {
    const messagesDir = path.join(process.cwd(), 'messages');
    const oldFilePath = path.join(messagesDir, `${oldCode}.json`);
    const newFilePath = path.join(messagesDir, `${newCode}.json`);

    // Check if old file exists
    try {
      await fs.access(oldFilePath);
      await fs.rename(oldFilePath, newFilePath);
      console.log(`Renamed translation file: ${oldCode}.json -> ${newCode}.json`);
    } catch (error) {
      console.log(`Translation file ${oldCode}.json not found, skipping rename`);
    }
  } catch (error) {
    console.error('Error renaming translation file:', error);
    throw error;
  }
}

// Helper function to delete translation file
async function deleteTranslationFile(code: string) {
  try {
    const messagesDir = path.join(process.cwd(), 'messages');
    const filePath = path.join(messagesDir, `${code}.json`);

    try {
      await fs.unlink(filePath);
      console.log(`Deleted translation file: ${code}.json`);
    } catch (error) {
      console.log(`Translation file ${code}.json not found, skipping deletion`);
    }
  } catch (error) {
    console.error('Error deleting translation file:', error);
    throw error;
  }
} 