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

  // Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: post.imageUrl || undefined,
    author: {
      '@type': 'Organization',
      name: 'Bazoocam Live'
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
      '@id': `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/apps/${post.slug}.html`
    }
  };

  // FAQ Schema
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

  // Breadcrumb Schema
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}`
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Apps',
      item: `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/apps/`
    }
  ];

  // Add category if it exists
  if (post.categoryId?.name) {
    const categoryName = typeof post.categoryId.name === 'string' 
      ? post.categoryId.name 
      : (post.categoryId.name[locale] || post.categoryId.name['en'] || '');
    const categorySlug = post.categoryId.slug || createSlug(categoryName);
    const categoryDisplayName = createSlug(categoryName); // Always use slug format for display
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: categorySlug,
      item: `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/apps/${categoryDisplayName}`
    });
  }

  // Add the current blog post
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: title,
    item: `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/apps/${post.slug}.html`
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
    </>
  );
} 