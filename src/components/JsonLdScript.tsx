import { BlogPost, LocalizedBlogPost } from '@/types';

interface JsonLdScriptProps {
  post: BlogPost | LocalizedBlogPost;
  locale: string;
}

export default function JsonLdScript({ post, locale }: JsonLdScriptProps) {
  // Handle both localized and multi-language post types
  const title = typeof post.title === 'string' ? post.title : (post.title[locale] || post.title['en'] || '');
  const description = typeof post.description === 'string' ? post.description : (post.description[locale] || post.description['en'] || '');
  
  // Helper function to create slug from text
  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  // Helper function to get localized URL
  const getLocalizedUrl = (path: string) => {
    const baseUrl = 'https://www.bazoocam.live';
    return locale === 'en' ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
  };

  // Helper function to get localized navigation text
  const getLocalizedText = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      home: {
        en: 'Home',
        tr: 'Ana Sayfa',
        fr: 'Accueil',
        es: 'Inicio',
        it: 'Home',
        de: 'Startseite',
        pt: 'Início',
        ru: 'Главная',
        ar: 'الرئيسية',
        ja: 'ホーム',
        ko: '홈',
        zh: '首页'
      },
      apps: {
        en: 'Apps',
        tr: 'Uygulamalar',
        fr: 'Applications',
        es: 'Aplicaciones',
        it: 'App',
        de: 'Apps',
        pt: 'Aplicativos',
        ru: 'Приложения',
        ar: 'التطبيقات',
        ja: 'アプリ',
        ko: '앱',
        zh: '应用'
      }
    };

    return translations[key]?.[locale] || translations[key]?.['en'] || key;
  };

  // Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: post.imageUrl ? {
      '@type': 'ImageObject',
      'inLanguage': locale === 'en' ? 'en-US' : `${locale}-${locale.toUpperCase()}`,
      '@id': getLocalizedUrl(`/apps/${post.slug}.html#primaryimage`),
      'url': process.env.NEXT_PUBLIC_APP_URL + post.imageUrl,
      'contentUrl': process.env.NEXT_PUBLIC_APP_URL + post.imageUrl
    } : undefined,
    author: {
      '@type': post.author ? 'Person' : 'Organization',
      name: post.author || 'Bazoocam Live'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bazoocam Live',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.bazoocam.live/logo.png'
      }
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getLocalizedUrl(`/apps/${post.slug}.html`)
    },
    // Add article section if category exists
    ...(post.categoryId?.name && {
      articleSection: typeof post.categoryId.name === 'string' 
        ? post.categoryId.name 
        : (post.categoryId.name[locale] || post.categoryId.name['en'] || '')
    })
  };

  // FAQ Schema - Only include if FAQs exist and are localized
  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(faq => ({
      '@type': 'Question',
      name: typeof faq.question === 'string' ? faq.question : (faq.question[locale] || faq.question['en'] || ''),
      acceptedAnswer: {
        '@type': 'Answer',
        text: typeof faq.answer === 'string' ? faq.answer : (faq.answer[locale] || faq.answer['en'] || '')
      }
    }))
  } : null;

  // Breadcrumb Schema with localized URLs and names
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: getLocalizedText('home'),
      item: getLocalizedUrl('')
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: getLocalizedText('apps'),
      item: getLocalizedUrl('/apps/')
    }
  ];

  // Add category if it exists with localized name
  if (post.categoryId?.name) {
    const categoryName = typeof post.categoryId.name === 'string' 
      ? post.categoryId.name 
      : (post.categoryId.name[locale] || post.categoryId.name['en'] || '');
    const categorySlug = post.categoryId.slug || createSlug(categoryName);
    const categoryDisplayName = createSlug(categoryName); // Always use slug format for display
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: categoryName, // Use localized category name
      item: getLocalizedUrl(`/apps/${categorySlug}`)
    });
  }

  // Add the current blog post with localized title
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: title, // Use localized title
    item: getLocalizedUrl(`/apps/${post.slug}.html`)
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems
  };

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bazoocam Live',
    url: 'https://www.bazoocam.live',
    logo: 'https://www.bazoocam.live/logo.png',
    sameAs: [
      // Add social media URLs here when available
    ]
  };

  // WebSite Schema with localized URLs
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bazoocam Live',
    url: getLocalizedUrl(''),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: getLocalizedUrl('/search?q={search_term_string}')
      },
      'query-input': 'required name=search_term_string'
    }
  };

  // bu şemalar bir uygulamayı, yazılımı veya cihazı ürün gibi tanıtıyorsan kullanılır.
  // Product Schema for the app being reviewed
/*   const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description,
    image: post.imageUrl || undefined,
    url: getLocalizedUrl(`/apps/${post.slug}.html`),
    ...(post.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: post.rating.stars,
        reviewCount: post.rating.votes,
        bestRating: 5,
        worstRating: 1
      }
    }),
    ...(post.categoryId?.name && {
      category: typeof post.categoryId.name === 'string' 
        ? post.categoryId.name 
        : (post.categoryId.name[locale] || post.categoryId.name['en'] || '')
    })
  };

  // Review Schema for the app
  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: title
    },
    reviewBody: description,
    author: {
      '@type': 'Organization',
      name: 'Bazoocam Live'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bazoocam Live'
    },
    ...(post.rating && {
      reviewRating: {
        '@type': 'Rating',
        ratingValue: post.rating.stars,
        bestRating: 5,
        worstRating: 1
      }
    }),
    datePublished: post.createdAt,
    dateModified: post.updatedAt
  };
 */


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
   
   
    </>
  );
} 