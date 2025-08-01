import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPageSEO, defaultMetaData, generateJsonLdScript } from '@/lib/seo';
import { getActiveLanguages } from '@/lib/languages';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  // Get SEO data from database
  const pageSEO = await getPageSEO('privacy');
  
  let title: string;
  let description: string;
  let keywords: string;
  let canonical: string;
  let robots: string;

  if (pageSEO) {
    title = pageSEO.title?.[locale] || pageSEO.title?.en || 'Privacy Policy - Bazoocam Live';
    description = pageSEO.description?.[locale] || pageSEO.description?.en || 'Read our privacy policy to understand how we protect your data.';
    keywords = pageSEO.keywords?.[locale] || 'privacy policy, data protection, user privacy, cookies';
    canonical = pageSEO.canonical || `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/privacy.html`;
    robots = pageSEO.robots || 'index, follow';
  } else {
    // Use fallback defaults
    const fallback = defaultMetaData.privacy;
    title = fallback.title[locale as keyof typeof fallback.title] || fallback.title.en;
    description = fallback.description[locale as keyof typeof fallback.description] || fallback.description.en;
    keywords = 'privacy policy, data protection, user privacy, cookies';
    canonical = `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/privacy.html`;
    robots = 'index, follow';
  }

  // Get dynamic languages for alternates
  const activeLanguages = await getActiveLanguages();
  
  // Build dynamic languages object for alternates
  const languages: Record<string, string> = {};
  activeLanguages.forEach(lang => {
    if (lang.locale === 'en') {
      languages[lang.locale] = 'https://www.bazoocam.live/privacy.html';
    } else {
      languages[lang.locale] = `https://www.bazoocam.live/${lang.locale}/privacy.html`;
    }
  });

  // Add x-default hreflang
  languages['x-default'] = 'https://www.bazoocam.live/privacy.html';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots,
  };
}

export default async function PrivacyPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'privacy' });
  
  // Get JSON-LD data
  const pageSEO = await getPageSEO('privacy');
  const jsonLdScript = pageSEO?.jsonLd ? generateJsonLdScript(pageSEO.jsonLd, locale) : null;

  return (
    <>
      {jsonLdScript && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript }}
        />
      )}
      
      <div className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1>{t('title')}</h1>
            
            <p className="lead">
              {t('subtitle')}
            </p>

            <h2>{t('infoCollectTitle')}</h2>
            <p>
              {t('infoCollectText')}
            </p>

            <h2>{t('infoUseTitle')}</h2>
            <ul>
              <li>{t('infoUseItem1')}</li>
              <li>{t('infoUseItem2')}</li>
              <li>{t('infoUseItem3')}</li>
              <li>{t('infoUseItem4')}</li>
            </ul>

            <h2>{t('infoSharingTitle')}</h2>
            <p>
              {t('infoSharingText')}
            </p>

            <h2>{t('dataSecurityTitle')}</h2>
            <p>
              {t('dataSecurityText')}
            </p>

            <h2>{t('contactTitle')}</h2>
            <p>
              {t('contactText')}
            </p>

            <p className="text-sm text-gray-600">
              {t('lastUpdated')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 