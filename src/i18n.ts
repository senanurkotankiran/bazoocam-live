import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// Default fallback values
const defaultLocales = ["en", "fr", "es", "it", "tr"];
const defaultLocale = 'en';

async function getLocales() {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Language } = await import('@/models/Language');
    
    await dbConnect();
    const activeLanguages = await Language.find({ isActive: true }).lean();
    return {
      locales: activeLanguages.map(lang => lang.code),
      defaultLocale: activeLanguages.find(lang => lang.isDefault)?.code || defaultLocale
    };
  } catch (error) {
    console.error('Error fetching locales from database:', error);
    return {
      locales: defaultLocales,
      defaultLocale
    };
  }
}

export default getRequestConfig(async ({ locale }: { locale?: string }) => {
  const { locales, defaultLocale: currentDefaultLocale } = await getLocales();
  
  // if locale is missing, use defaultLocale
  const code = locale ?? currentDefaultLocale

  if (!locales.includes(code)) {
    notFound()
  }

  try {
    return {
      locale: code,
      messages: (await import(`../messages/${code}.json`)).default
    }
  } catch (error) {
    console.error(`Error loading messages for locale ${code}:`, error);
    // Fallback to default locale messages
    try {
      return {
        locale: currentDefaultLocale,
        messages: (await import(`../messages/${currentDefaultLocale}.json`)).default
      }
    } catch (fallbackError) {
      console.error(`Error loading fallback messages for ${currentDefaultLocale}:`, fallbackError);
      // Return empty messages as last resort
      return {
        locale: code,
        messages: {}
      }
    }
  }
})
