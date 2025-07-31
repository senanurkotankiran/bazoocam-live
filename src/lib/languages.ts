import dbConnect from '@/lib/mongodb';
import Language from '@/models/Language';

export interface LocaleInfo {
  locale: string;
  name: string;
  flag: string;
}

// Cache for languages to avoid frequent database calls
let cachedLanguages: LocaleInfo[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Ensure default languages exist in database
export async function ensureDefaultLanguagesExist(): Promise<void> {
  try {
    await dbConnect();
    
    // Check if English exists as default
    const englishLang = await Language.findOne({ code: 'en' });
    
    if (!englishLang) {
      // Create English as default language
      const english = new Language({
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        isActive: true,
        isDefault: true
      });
      await english.save();
      console.log('Created default English language');
      
   
    } else if (!englishLang.isDefault) {
      // Make English default if it exists but not default
      await Language.updateMany({}, { isDefault: false });
      await Language.findByIdAndUpdate(englishLang._id, { isDefault: true });
      console.log('Set English as default language');
      
      
    }
  } catch (error: any) {
    // Ignore duplicate key errors - means language already exists
    if (error.code === 11000) {
      console.log('English language already exists');
      return;
    }
    console.error('Error ensuring default languages:', error);
  }
}

// Get active languages from database
export async function getActiveLanguages(): Promise<LocaleInfo[]> {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedLanguages && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedLanguages;
    }

    await dbConnect();
    
    const languages = await Language.find({ isActive: true })
      .sort({ isDefault: -1, name: 1 })
      .lean();

    const locales: LocaleInfo[] = languages.map((lang: any) => ({
      locale: lang.code || '',
      name: lang.name || '',
      flag: lang.flag || ''
    }));

    // Update cache
    cachedLanguages = locales;
    cacheTimestamp = now;

    return locales;
  } catch (error) {
    console.error('Error fetching active languages:', error);
    
    // Fallback to default languages if database fails
    return [
      { locale: 'en', name: 'English', flag: '🇺🇸' },
      { locale: 'fr', name: 'Français', flag: '🇫🇷' },
      { locale: 'es', name: 'Español', flag: '🇪🇸' },
      { locale: 'it', name: 'Italiano', flag: '🇮🇹' },
    ];
  }
}

// Get language codes only
export async function getActiveLanguageCodes(): Promise<string[]> {
  const languages = await getActiveLanguages();
  return languages.map(lang => lang.locale);
}

// Get default language
export async function getDefaultLanguage(): Promise<string> {
  try {
    await dbConnect();
    
    const defaultLang = await Language.findOne({ isDefault: true }).lean();
    return (defaultLang as any)?.code || 'en';
  } catch (error) {
    console.error('Error fetching default language:', error);
    return 'en';
  }
}



// Get supported locales in the format expected by existing code
export async function getSupportedLocales(): Promise<LocaleInfo[]> {
  return getActiveLanguages();
} 