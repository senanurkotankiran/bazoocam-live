import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/outline';
import { getActiveLanguages } from '@/lib/languages';
import { getTranslations } from 'next-intl/server';
import { getCache, setCache } from '@/lib/cache';

interface Props {
  params: {
    locale: string;
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

interface CategoryData {
  _id: string;
  name: string;
  description?: string;
  slug: string;
}

interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  author?: string; // Blog yazarı
  createdAt: string;
  updatedAt: string;
  rating?: {
    stars: number;
    votes: number;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

async function getCategoryData(slug: string, locale: string, page: number = 1) {
  const cacheKey = `category-${slug}-${locale}-${page}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('⚠️⚠️[CACHE HIT] /api/blog-posts-by-category');
    return cached;
  } else {
    console.log('❌❌[DB HIT] /api/blog-posts-by-category');
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(
          `${baseUrl}/api/blog-posts-by-category/${slug}?locale=${locale}&page=${page}&limit=12`,
          {
            cache: 'no-store'
          }
        );
        
        if (!response.ok) {
          return null;
        }
        
        const data = await response.json();
        if (!data.success) return null;
        
        setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error('Error fetching category data:', error);
        return null;
      }
  }

 
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = params;
  
  try {
    const data = await getCategoryData(slug, locale);
    
    if (!data) {
      return {
        title: 'Category Not Found',
      };
    }

    const category = data.category as CategoryData;
    const activeLanguages = await getActiveLanguages();
    
    // Build dynamic languages object for alternates
    const languages: Record<string, string> = {};
    activeLanguages.forEach(lang => {
      if (lang.locale === 'en') {
        languages[lang.locale] = `https://www.bazoocam.live/${slug}`;
      } else {
        languages[lang.locale] = `https://www.bazoocam.live/${lang.locale}/${slug}`;
      }
    });

    // Add x-default hreflang
    languages['x-default'] = `https://www.bazoocam.live/${slug}`;

    const title = `${category.name} ` || "Blog Posts | Bazoocam Live";
    const description = category.description || `Explore ${category.name} blog posts and articles on Bazoocam Live.`;
    const canonical = `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/${slug}`;

    return {
      title,
      description,
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
    };
  } catch (error) {
    return {
      title: 'Error',
    };
  }
}

function generateArticleSchema(posts: BlogPost[], category: CategoryData, locale: string) {
  const articles = posts.map((post, index) => ({
    "@type": "Article",
    "@id": `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/apps/${post.slug}.html#article`,
    "headline": post.title,
    "description": post.description,
    "image": post.imageUrl ? [post.imageUrl] : [],
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": post.author ? "Person" : "Organization",
      "name": post.author || "Bazoocam Live"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bazoocam Live",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.bazoocam.live/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/apps/${post.slug}.html`
    },
    "articleSection": category.name,
    "inLanguage": locale
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/${category.slug}#webpage`,
        "url": `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/${category.slug}`,
        "name": `${category.name} - Blog Posts`,
        "description": category.description || `Explore ${category.name} blog posts and articles`,
        "inLanguage": locale,
        "isPartOf": {
          "@id": "https://www.bazoocam.live/#website"
        },
        "about": {
          "@type": "Thing",
          "name": category.name
        },
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": articles.map((article, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": article
          }))
        }
      },
      ...articles
    ]
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = params;
  const page = parseInt(searchParams.page || '1');
  
  const data = await getCategoryData(slug, locale, page);
  
  if (!data) {
    notFound();
  }

  const category = data.category as CategoryData;
  const posts = data.posts as BlogPost[];
  const pagination = data.pagination as PaginationData;

  // Get translations
  const t = await getTranslations({ locale, namespace: 'navigation' });
  const commonT = await getTranslations({ locale, namespace: 'common' });

  // Generate schema markup
  const schemaData = generateArticleSchema(posts, category, locale);

  const getLocalizedPath = (path: string) => {
    if (locale === 'en') {
      return path;
    }
    return `/${locale}${path}`;
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    const strippedContent = content.replace(/<[^>]*>/g, '');
    if (strippedContent.length <= maxLength) {
      return strippedContent;
    }
    return strippedContent.substring(0, maxLength).trim() + '...';
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 antialiased">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="max-w-6xl mx-auto mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link 
                href={getLocalizedPath('/')}
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {t('home') || 'Home'}
              </Link>
            </li>
            
            <li className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400 mx-1" />
              <span className="text-gray-900 font-semibold capitalize">
                {category.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-4 capitalize antialiased">
              {category.name}
            </h1>
          
         
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-6xl mx-auto">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <article key={post._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Featured Image */}
                  {post.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <time dateTime={post.createdAt}>
                            {new Date(post.createdAt).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                        </div>
                        {post.author && (
                          <div className="flex items-center">
                            <span className="text-gray-400">•</span>
                            <span className="ml-1">{post.author}</span>
                          </div>
                        )}
                      </div>
                      {post.rating && (
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{post.rating.stars}/5</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                      <Link href={getLocalizedPath(`/apps/${post.slug}.html`)}>
                        {post.title}
                      </Link>
                    </h2>
                    
                 
                    
                    {/* Content Preview */}
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {truncateContent(post.content, 80)}
                    </p>
                    
                    {/* Read More Link */}
                    <Link 
                      href={getLocalizedPath(`/apps/${post.slug}.html`)}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                      {commonT('readMore') || 'Read More'}
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {commonT('noPostsFound') || 'No posts found'}
              </h3>
              <p className="text-gray-600">
                {commonT('noPostsInCategory') || 'No posts available in this category for the selected language.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mb-8">
              {pagination.hasPrevPage && (
                <Link
                  href={`${getLocalizedPath(`/${slug}`)}?page=${pagination.currentPage - 1}`}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {commonT('previous') || 'Previous'}
                </Link>
              )}
              
              <span className="px-4 py-2 text-sm text-gray-700">
                {commonT('page') || 'Page'} {pagination.currentPage} {commonT('of') || 'of'} {pagination.totalPages}
              </span>
              
              {pagination.hasNextPage && (
                <Link
                  href={`${getLocalizedPath(`/${slug}`)}?page=${pagination.currentPage + 1}`}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {commonT('next') || 'Next'}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 