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
    alternates: {
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