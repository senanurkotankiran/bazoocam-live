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
  const pageSEO = await getPageSEO('contact');
  
  let title: string;
  let description: string;
  let keywords: string;
  let canonical: string;
  let robots: string;

  if (pageSEO) {
    title = pageSEO.title?.[locale] || pageSEO.title?.en || 'Contact Us - Bazoocam Live';
    description = pageSEO.description?.[locale] || pageSEO.description?.en || 'Get in touch with our team for support and inquiries.';
    keywords = pageSEO.keywords?.[locale] || 'contact, support, help, customer service';
    canonical = pageSEO.canonical || `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/contact.html`;
    robots = pageSEO.robots || 'index, follow';
  } else {
    // Use fallback defaults
    const fallback = defaultMetaData.contact;
    title = fallback.title[locale as keyof typeof fallback.title] || fallback.title.en;
    description = fallback.description[locale as keyof typeof fallback.description] || fallback.description.en;
    keywords = 'contact, support, help, customer service';
    canonical = `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/contact.html`;
    robots = 'index, follow';
  }

  // Get dynamic languages for alternates
  const activeLanguages = await getActiveLanguages();
  
  // Build dynamic languages object for alternates
  const languages: Record<string, string> = {};
  activeLanguages.forEach(lang => {
    if (lang.locale === 'en') {
      languages[lang.locale] = 'https://www.bazoocam.live/contact.html';
    } else {
      languages[lang.locale] = `https://www.bazoocam.live/${lang.locale}/contact.html`;
    }
  });

  // Add x-default hreflang
  languages['x-default'] = 'https://www.bazoocam.live/contact.html';

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

export default async function ContactPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'contact' });
  
  // Get JSON-LD data
  const pageSEO = await getPageSEO('contact');
  const jsonLdScript = pageSEO?.jsonLd ? generateJsonLdScript(pageSEO.jsonLd) : null;

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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
              <p className="text-xl text-gray-600">
                {t('subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">{t('formTitle')}</h2>
                
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('subject')}
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {t('sendMessage')}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">{t('getInTouch')}</h2>
                  <p className="text-gray-600 mb-6">
                    {t('description')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">{t('emailLabel')}</h3>
                      <p className="text-gray-600">{t('emailValue')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">{t('responseTimeLabel')}</h3>
                      <p className="text-gray-600">{t('responseTimeValue')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">{t('supportLabel')}</h3>
                      <p className="text-gray-600">{t('supportValue')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 