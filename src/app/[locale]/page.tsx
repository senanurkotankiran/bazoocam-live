import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Hero from '@/components/Hero';
import PlatformList from '@/components/PlatformList';
import OnlineCounter from '@/components/OnlineCounter';
import FAQSection from '@/components/FAQSection';
import { getPageSEO, generateJsonLdScript } from '@/lib/seo';
import { getActiveLanguages } from '@/lib/languages';
import Image from 'next/image';
import { getCache, setCache } from '@/lib/cache';

async function getLatestBlogs(locale: string) {
  const cacheKey = `latest-blogs-${locale}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('⚠️⚠️[CACHE HIT] /api/latest-blogs'); // ✅ CACHE HIT
    return cached;
  }
  
  else {
    console.log('❌❌[DB HIT] /api/latest-blogs'); // ✅ CACHE MISS
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/latest-blogs`, {
        cache: 'no-store'
      });
  
      if (!response.ok) throw new Error('Failed to fetch latest blogs');
      const data = await response.json();
      if (!data.success) return [];
  
      // Filter blog posts to only include the specific locale's content
      const localizedPosts = data.blogs.map((post: any) => ({
        _id: post._id.toString(), // Convert ObjectId to string
        title: post.title?.[locale] || post.title?.['en'] || Object.values(post.title || {})[0] || '',
        description: post.description?.[locale] || post.description?.['en'] || Object.values(post.description || {})[0] || '',
       
        imageUrl: post.imageUrl,
        slug: post.slug
      }));
      
      setCache(cacheKey, localizedPosts);
      return localizedPosts;
    } catch (error) {
      console.error('Error fetching latest blogs:', error);
      return [];
    }
  }


}

async function getHomepageFAQs(locale: string) {
  const cacheKey = `homepage-faqs-${locale}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('⚠️⚠️[CACHE HIT] /api/homepage-faqs'); // ✅ CACHE HIT
    return cached;
  }
  else {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/homepage-faqs`, {
        cache: 'no-store'
      });
  
      console.log('❌❌[DB HIT] /api/homepage-faqs'); // ✅ CACHE MISS
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      const data = await response.json();
      if (!data.success) return [];
  
      // Filtered localized version
      const localizedFaqs = data.data.map((faq: any) => ({
        _id: faq._id.toString(),
        question: faq.question[locale] || faq.question['en'] || '',
        answer: faq.answer[locale] || faq.answer['en'] || '',
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
      }));
  
      setCache(cacheKey, localizedFaqs);
      return localizedFaqs;
    } catch (error) {
      console.error('Error fetching homepage FAQs:', error);
      return [];
    }
  }

  

 
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  // Get translations for meta data
  const metaT = await getTranslations({ locale, namespace: 'meta' });
  const homeT = await getTranslations({ locale, namespace: 'home' });

  // Primary: Use SEO database, Secondary: Use translation files, Tertiary: Use defaults
  const pageSEO = await getPageSEO('homepage');
  
  let title: string;
  let description: string;
  let keywords: string;
  let canonical: string;
  let robots: string;

  // Primary: Use SEO database, Secondary: Use translation files, Tertiary: Use defaults
  if (pageSEO) {
    title = pageSEO.title?.[locale] || pageSEO.title?.en || 'Bazoocam Live - Best Video Chat Applications';
    description = pageSEO.description?.[locale] || pageSEO.description?.en || 'Discover the best live video chat applications and platforms.';
  } else if (metaT && homeT) {
    title = metaT('defaultTitle') || homeT('title') || 'Bazoocam Live - Best Video Chat Applications';
    description = metaT('defaultDescription') || homeT('subtitle') || 'Discover the best live video chat applications and platforms.';
  } else {
    // Final fallback
    title = 'Bazoocam Live - Best Video Chat Applications';
    description = 'Discover the best live video chat applications and platforms.';
  }

  keywords = pageSEO?.keywords?.[locale] || 'video chat, live chat, webcam chat, random chat, chatroulette, omegle alternatives';
  canonical = pageSEO?.canonical || `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}`;
  robots = pageSEO?.robots || 'index, follow';

  // Get dynamic languages for alternates
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
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical,
      languages,
    },
    robots,
  };
}

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'home' });
  
  // Get data
  const [latestBlogs, homepageFaqs, pageSEO] = await Promise.all([
    getLatestBlogs(locale),
    getHomepageFAQs(locale),
    getPageSEO('homepage')
  ]);

  // Generate JSON-LD for FAQs
  const faqJsonLd = homepageFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": homepageFaqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // Get JSON-LD data from SEO
  const seoJsonLd = pageSEO?.jsonLd ? generateJsonLdScript(pageSEO.jsonLd, locale) : null;

  return (
    <>
      {seoJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seoJsonLd }}
        />
      )}
      
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      
      <div>
        <OnlineCounter />
        <Hero />
        
        {/* About Platform Section */}
        <section className="py-16 bg-gradient-to-b from-[#eaf7ff]/40 to-white antialiased shadow-lg md:px-0 px-4">
          <div className="container">
            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
              {/* Text Content - Left Side */}
              <div className="flex-1 lg:pr-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {t('aboutPlatform.mainTitle')}
                </h1>
                <p className="md:text-[16px] text-sm text-gray-700 leading-relaxed text-justify mb-8">
                  {t('aboutPlatform.mainDescription')}
                </p>
                
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {t('aboutPlatform.title2')}
                </h2>
                <p className="md:text-[16px] text-sm text-gray-700 leading-relaxed text-justify mb-8">
                  {t('aboutPlatform.featuresDescription')}
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {t('aboutPlatform.title3')}
                </h3>
                <p className="md:text-[16px] text-sm text-gray-700 leading-relaxed text-justify">
                  {t('aboutPlatform.privacyDescription')}
                </p>
              </div>
              
              {/* Image - Right Side */}
              <div className="flex-shrink-0">
                <div className="w-80 h-80 lg:w-96 lg:h-96">
                  <Image
                    src={`/uploads/card.png`}
                    alt="Bazoocam Live Video Chat Platform"
                    width={384}
                    height={384}
                    className="w-full h-full object-cover "
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {latestBlogs.length > 0 && (
          <PlatformList latestBlogs={latestBlogs} locale={locale} />
        )}

        {/* Static Cards Section */}
        <section className="py-16 antialiased">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* How Bazoocam Works */}
              <div className="card text-center py-8 px-4">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <img src={`/uploads/card1.webp`} alt="How Bazoocam Works" width={96} height={96} className="rounded-lg" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('howItWorksTitle')}</h3>
                <p className="text-gray-600">{t('howItWorksDescription')}</p>
              </div>

              {/* Why Choose Bazoocam */}
              <div className="card text-center py-8 px-4">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <img src={`/uploads/card2.webp`} alt="Why Choose Bazoocam" width={96} height={96} className="rounded-lg" />

                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('whyChooseTitle')}</h3>
                <p className="text-gray-600">{t('whyChooseDescription')}</p>
              </div>

              {/* Top Tips */}
              <div className="card text-center py-8 px-4">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <img src={`/uploads/card3.webp`} alt="Top Tips" width={96} height={96} className="rounded-lg" />

                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('tipsTitle')}</h3>
                <p className="text-gray-600">{t('tipsDescription')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {homepageFaqs.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container">
              <h2 className="text-3xl font-bold text-center mb-12">
                {t('faqTitle')}
              </h2>
              <div className="max-w-4xl mx-auto">
                <FAQSection faqs={homepageFaqs} locale={locale} />
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA Section */}
        <section className="py-16">
          <div className="container text-center">
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('connectDescription')}
            </p>
          </div>
        </section>
      </div>
    </>
  );
} 