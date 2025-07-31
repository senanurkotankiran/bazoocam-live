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

    // Update config files
    await updateConfigFiles();

  

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

    // Update config files
    await updateConfigFiles();



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

// Helper function to update config files
async function updateConfigFiles() {
  try {
    // Get active languages
    const activeLanguages = await Language.find({ isActive: true }).lean();
    const languageCodes = activeLanguages.map(lang => lang.code);

    // Update middleware.ts
    await updateMiddleware(languageCodes, activeLanguages.find(lang => lang.isDefault)?.code || 'en');

    // Update i18n.ts
    await updateI18nConfig(languageCodes, activeLanguages.find(lang => lang.isDefault)?.code || 'en');

    // Update types/index.ts
    await updateTypesFile(activeLanguages);

  } catch (error) {
    console.error('Error updating config files:', error);
    throw error;
  }
}

// Update middleware.ts
async function updateMiddleware(locales: string[], defaultLocale: string) {
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  const middlewareContent = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ${JSON.stringify(locales)};
const defaultLocale = '${defaultLocale}';

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;

  // Skip middleware for admin, api, static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Check if the pathname starts with a locale
  const localeInPath = locales.find(
    (locale) => pathname.startsWith(\`/\${locale}/\`) || pathname === \`/\${locale}\`
  );

  // If there's a locale in path
  if (localeInPath) {
    // If it's the default locale, redirect to remove the prefix
    if (localeInPath === defaultLocale) {
      const newPath = pathname.slice(3) || '/'; // Remove /locale
      return NextResponse.redirect(new URL(newPath, request.url));
    }
    // For other locales, continue normally
    return NextResponse.next();
  }

  // If no locale in path, assume it's the default locale
  // Rewrite to /defaultLocale internally but don't change the URL
  const url = request.nextUrl.clone();
  url.pathname = \`/\${defaultLocale}\${pathname}\`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin).*)']
}; 
`;

  await fs.writeFile(middlewarePath, middlewareContent, 'utf-8');
}

// Update i18n.ts
async function updateI18nConfig(locales: string[], defaultLocale: string) {
  const i18nPath = path.join(process.cwd(), 'src', 'i18n.ts');
  const i18nContent = `import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

const locales = ${JSON.stringify(locales)}
const defaultLocale = '${defaultLocale}'

export default getRequestConfig(async ({ locale }: { locale?: string }) => {
  // if locale is missing, use defaultLocale
  const code = locale ?? defaultLocale

  if (!locales.includes(code)) {
    notFound()
  }

  return {
    locale: code,
    messages: (await import(\`../messages/\${code}.json\`)).default
  }
})
`;

  await fs.writeFile(i18nPath, i18nContent, 'utf-8');
}

// Update types/index.ts
async function updateTypesFile(languages: any[]) {
  const typesPath = path.join(process.cwd(), 'src', 'types', 'index.ts');
  
  // Read current types file
  const currentContent = await fs.readFile(typesPath, 'utf-8');
  
  // Find the supportedLocales export and replace it
  const supportedLocalesArray = languages.map(lang => 
    `  { locale: '${lang.code}', name: '${lang.name}', flag: '${lang.flag}' }`
  ).join(',\n');

  const newSupportedLocales = `export const supportedLocales: Locale[] = [
${supportedLocalesArray},
];`;

  // Replace the existing supportedLocales export
  const updatedContent = currentContent.replace(
    /export const supportedLocales: Locale\[\] = \[[\s\S]*?\];/,
    newSupportedLocales
  );

  await fs.writeFile(typesPath, updatedContent, 'utf-8');
} 