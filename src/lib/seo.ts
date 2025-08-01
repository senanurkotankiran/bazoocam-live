import dbConnect from '@/lib/mongodb';
import PageSEO from '@/models/PageSEO';
import { PageSEO as PageSEOType } from '@/types';
import { getCache, setCache } from '@/lib/cache';

export async function getPageSEO(pageKey: string): Promise<PageSEOType | null> {
  const cacheKey = `page-seo-${pageKey}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    await dbConnect();
    
    const pageSEO = await PageSEO.findOne({ pageKey }).lean();
    
    if (!pageSEO) {
      return null;
    }

    const parsedPageSEO = JSON.parse(JSON.stringify(pageSEO));
    setCache(cacheKey, parsedPageSEO);
    return parsedPageSEO;
  } catch (error) {
    console.error('Error fetching page SEO:', error);
    return null;
  }
}

export function generateJsonLdScript(jsonLd: any, locale: string = 'en'): string {
  if (!jsonLd) return '';
  
  // Handle multi-language JSON-LD
  if (typeof jsonLd === 'object' && !Array.isArray(jsonLd)) {
    // Check if it's a multi-language structure
    if (jsonLd[locale]) {
      return JSON.stringify(jsonLd[locale]);
    } else if (jsonLd['en']) {
      // Fallback to English
      return JSON.stringify(jsonLd['en']);
    } else {
      // If no language-specific data, try to use the object as-is
      return JSON.stringify(jsonLd);
    }
  }
  
  // Handle legacy single JSON-LD format
  return JSON.stringify(jsonLd);
}

// Default fallback meta data
export const defaultMetaData = {
  homepage: {
    title: {
      en: 'Bazoocam Live - Best Video Chat Applications',
      fr: 'Bazoocam Live - Meilleures Applications de Chat Vidéo',
      es: 'Bazoocam Live - Mejores Aplicaciones de Chat de Vídeo',
      it: 'Bazoocam Live - Migliori Applicazioni di Chat Video'
    },
    description: {
      en: 'Discover the best live video chat applications and platforms. Find perfect alternatives to popular chat apps.',
      fr: 'Découvrez les meilleures applications de chat vidéo en direct. Trouvez des alternatives parfaites aux applications de chat populaires.',
      es: 'Descubre las mejores aplicaciones de chat de vídeo en directo. Encuentra alternativas perfectas a las aplicaciones de chat populares.',
      it: 'Scopri le migliori applicazioni di chat video dal vivo. Trova alternative perfette alle app di chat popolari.'
    }
  },
  contact: {
    title: {
      en: 'Contact Us - Bazoocam Live',
      fr: 'Contactez-nous - Bazoocam Live',
      es: 'Contáctanos - Bazoocam Live',
      it: 'Contattaci - Bazoocam Live'
    },
    description: {
      en: 'Get in touch with our team for support and inquiries.',
      fr: 'Contactez notre équipe pour obtenir du support et des renseignements.',
      es: 'Póngase en contacto con nuestro equipo para soporte y consultas.',
      it: 'Contatta il nostro team per supporto e richieste.'
    }
  },
  privacy: {
    title: {
      en: 'Privacy Policy - Bazoocam Live',
      fr: 'Politique de Confidentialité - Bazoocam Live',
      es: 'Política de Privacidad - Bazoocam Live',
      it: 'Politica sulla Privacy - Bazoocam Live'
    },
    description: {
      en: 'Read our privacy policy to understand how we protect your data.',
      fr: 'Lisez notre politique de confidentialité pour comprendre comment nous protégeons vos données.',
      es: 'Lee nuestra política de privacidad para entender cómo protegemos tus datos.',
      it: 'Leggi la nostra politica sulla privacy per capire come proteggiamo i tuoi dati.'
    }
  }
}; 