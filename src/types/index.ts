export interface BlogPost {
  _id?: string;
  slug: string;
  title: Record<string, string>; // { en: "title", fr: "titre", ... }
  content: Record<string, string>;
  description: Record<string, string>;
  imageUrl?: string;
  author?: string; // Blog yazarı
  categoryId?: any;
  status: 'draft' | 'published';
  rating?: {
    stars: number;
    votes: number;
  };
  meta: {
    title: Record<string, string>;
    description: Record<string, string>;
    keywords: Record<string, string>;
    canonical?: string;
  };
  faqs: FAQ[];
  alternatives?: Alternative[];
  alternativesDescription?: Record<string, string>; // Genel açıklama için
  prosAndCons?: {
    pros: Record<string, string | string[]>; // Support both formats
    cons: Record<string, string | string[]>; // Support both formats
  };
  createdAt: Date;
  updatedAt: Date;
}

// Localized version of BlogPost for SEO optimization
export interface LocalizedBlogPost {
  _id: string;
  slug: string;
  title: string; // Single locale content
  content: string; // Single locale content
  description: string; // Single locale content
  imageUrl?: string;
  author?: string; // Blog yazarı
  status: 'draft' | 'published';
  rating?: {
    stars: number;
    votes: number;
  };
  meta?: {
    title: string; // Single locale content
    description: string; // Single locale content
    keywords: string; // Single locale content
    canonical?: string;
  };
  categoryId?: {
    _id: string;
    name: string; // Single locale content
    slug: string;
  };
  alternatives?: {
    name: string; // Single locale content
    description: string; // Single locale content
  }[];
  alternativesDescription?: string; // Single locale content
  prosAndCons?: {
    pros: string; // Single locale content
    cons: string; // Single locale content
  };
  faqs?: {
    question: string; // Single locale content
    answer: string; // Single locale content
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  _id?: string;
  question: Record<string, string>;
  answer: Record<string, string>;
}

export interface HomepageFAQ {
  _id?: string;
  question: Record<string, string>; // Multi-language questions
  answer: Record<string, string>; // Multi-language answers
  order: number; // For ordering FAQs
  isActive: boolean; // To enable/disable FAQs
  createdAt: Date;
  updatedAt: Date;
}

export interface Alternative {
  name: Record<string, string>; // Çoklu dil desteği
  description: Record<string, string>;
}

export interface Category {
  _id?: string;
  name: Record<string, string>;
  slug: string;
  description?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  _id?: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'editor';
  createdAt: Date;
  updatedAt: Date;
}

export interface PageSEO {
  _id?: string;
  pageKey: string; // 'homepage', 'contact', 'privacy', etc.
  title: Record<string, string>; // Multi-language titles
  description: Record<string, string>; // Multi-language descriptions
  keywords?: Record<string, string>; // Multi-language keywords
  jsonLd?: Record<string, any>; // Multi-language JSON-LD structured data
  canonical?: string;
  robots?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Locale {
  locale: string;
  name: string;
  flag: string;
}

// DEPRECATED: This is now dynamically generated by the language management system
// Use fetchActiveLanguages() from @/lib/clientLanguages instead
export const supportedLocales: Locale[] = [
  { locale: 'en', name: 'English', flag: '🇺🇸' },
  { locale: 'fr', name: 'French', flag: '🇫🇷' },
  { locale: 'es', name: 'Spanish', flag: '🇪🇸' },
  { locale: 'it', name: 'Italian', flag: '🇮🇹' },
  { locale: 'tr', name: 'Turkish', flag: '🇹🇷' },
];

// Helper function to get active languages from database
export async function getActiveLanguages(): Promise<Locale[]> {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Language } = await import('@/models/Language');
    
    await dbConnect();
    const activeLanguages = await Language.find({ isActive: true }).lean();
    
    return activeLanguages.map(lang => ({
      locale: lang.code,
      name: lang.name,
      flag: lang.flag
    }));
  } catch (error) {
    console.error('Error fetching active languages:', error);
    // Fallback to default locales
    return supportedLocales;
  }
} 