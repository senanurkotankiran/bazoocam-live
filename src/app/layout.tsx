import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getActiveLanguages } from '@/lib/languages';

const inter = Inter({ subsets: ['latin'] });

// Generate dynamic metadata with language alternates
export async function generateMetadata(): Promise<Metadata> {
  const activeLanguages = await getActiveLanguages();
  
  // Build dynamic languages object for alternates
  const languages: Record<string, string> = {};
  activeLanguages.forEach(lang => {
    if (lang.locale === 'en') {
      languages[lang.locale] = 'https://www.bazoocam.live';
    } else {
      languages[lang.locale] = `https://www.bazoocam.live/${lang.locale}`;
    }
  });

  // Add x-default hreflang
  languages['x-default'] = 'https://www.bazoocam.live';

  return {
    title: 'Bazoocam Live - Best Video Chat Applications',
    description: 'Discover the best live video chat applications and platforms. Find perfect alternatives to popular chat apps.',
    keywords: 'video chat, live chat, webcam chat, random chat, chatroulette, omegle alternatives',
    authors: [{ name: 'Bazoocam Live' }],
    creator: 'Bazoocam Live',
    publisher: 'Bazoocam Live',
    robots: 'index, follow',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://www.bazoocam.live',
      siteName: 'Bazoocam Live',
      title: 'Bazoocam Live - Best Video Chat Applications',
      description: 'Discover the best live video chat applications and platforms. Find perfect alternatives to popular chat apps.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Bazoocam Live - Best Video Chat Applications',
      description: 'Discover the best live video chat applications and platforms. Find perfect alternatives to popular chat apps.',
    },
    alternates: {
      canonical: 'https://www.bazoocam.live',
      languages,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 