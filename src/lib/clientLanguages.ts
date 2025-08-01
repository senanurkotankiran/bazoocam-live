import { getCache, setCache } from "./cache";

export interface Locale {
  locale: string;
  name: string;
  flag: string;
}

// Fetch active languages from API (client-side) without caching
export async function fetchActiveLanguages(): Promise<Locale[]> {
  const cacheKey = 'active-languages';
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('⚠️⚠️[CACHE HIT] /api/admin/languages');
    return cached;
  }
  else {
    console.log('❌❌[DB HIT] /api/admin/languages');
    try {
      const response = await fetch(`${process.env.BAZOOCAM_LIVE_NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/languages`, {
        cache: 'no-store'
      });
      const result = await response.json();
      if (result.success) {
        const locaizedLanguages = result.data.filter((lang: any) => lang.isActive).map((lang: any) => ({
          locale: lang.code,
          name: lang.name,
          flag: lang.flag
        }));

        setCache(cacheKey, locaizedLanguages);

        return locaizedLanguages;
         
      }
  
      throw new Error('Failed to fetch languages');
    } catch (error) {
      console.error('Error fetching active languages:', error);
      
      // Fallback to default languages
      return [
        { locale: 'en', name: 'English', flag: '🇺🇸' },
        { locale: 'fr', name: 'Français', flag: '🇫🇷' },
        { locale: 'es', name: 'Español', flag: '🇪🇸' },
        { locale: 'it', name: 'Italiano', flag: '🇮🇹' },
      ];
    }
  }
 
}

// Get language by code
export function getLanguageByCode(languages: Locale[], code: string): Locale | undefined {
  return languages.find(lang => lang.locale === code);
}

// Get default language
export function getDefaultLanguage(languages: Locale[]): Locale | undefined {
  return languages.find(lang => lang.locale === 'en') || languages[0];
}
// Fetch active language codes only (client-side) without caching
export async function fetchActiveLanguageCodes(): Promise<string[]> {
  const languages = await fetchActiveLanguages();
  return languages.map(lang => lang.locale);
}
