import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getActiveLanguageCodes } from '@/lib/languages';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import { fetchActiveLanguages } from '@/lib/clientLanguages';

const inter = Inter({ subsets: ['latin'] });

interface BlogPost {
  _id: string;
  title: Record<string, string>;
  slug: string;
}

async function getFooterBlogs(locale: string): Promise<BlogPost[]> {
  try {
    await dbConnect();
    const posts = await BlogPost.find({ 
      status: 'published'
    })
      .select('title slug')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    
    // Filter blog posts to only include the specific locale's content
    const localizedPosts = posts.map((post: any) => ({
      _id: post._id.toString(), // Convert ObjectId to string
      title: post.title[locale] || post.title['en'] || '',
      slug: post.slug
    }));
    
    return localizedPosts;
  } catch (error) {
    console.error('Error fetching footer blogs:', error);
    return [];
  }
}

// Direct import function for locale-specific messages only
async function getLocaleMessages(locale: string) {
  try {
    // Only import the specific locale's messages
    const messages = (await import(`../../../messages/${locale}.json`)).default;
    return messages;
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    // Fallback to English if the specific locale fails
    if (locale !== 'en') {
      try {
        const fallbackMessages = (await import(`../../../messages/en.json`)).default;
        return fallbackMessages;
      } catch (fallbackError) {
        console.error('Error loading fallback messages:', fallbackError);
        return {}; // Empty messages as last resort
      }
    }
    return {};
  }
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  // Only get the current locale's metadata for SEO optimization
  // This prevents loading all languages in the HTML head
  const currentLang = locale === 'en' ? 'en' : locale;
  
  const languages: Record<string, string> = {
    [currentLang]: locale === 'en' 
      ? 'https://www.bazoocam.live' 
      : `https://www.bazoocam.live/${locale}`
  };

  // Add x-default hreflang
  languages['x-default'] = 'https://www.bazoocam.live';

  return {
    alternates: {
      canonical: `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}`,
      languages,
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Get dynamic active locales for validation only
  const activeLocales = await getActiveLanguageCodes();
  
  // Validate that the incoming `locale` parameter is valid
  if (!activeLocales.includes(locale)) {
    notFound();
  }

  // Get messages for the specific locale only - SEO optimization
  const messages = await getLocaleMessages(locale);

  // Fetch blog data for footer
  const footerBlogs = await getFooterBlogs(locale);

  const activeLanguages = await fetchActiveLanguages();
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Navigation activeLanguages={activeLanguages} />
            <main className="flex-grow">
              {children}
            </main>
            <Footer blogs={footerBlogs} />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 