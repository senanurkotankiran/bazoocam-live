import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLdScript from '@/components/JsonLdScript';
import Breadcrumb from '@/components/Breadcrumb';
import StartChatButton from '@/components/StartChatButton';
import AlternativeApps from '@/components/AlternativeApps';
import ProsAndCons from '@/components/ProsAndCons';
import FAQSection from '@/components/FAQSection';
import { LocalizedBlogPost } from '@/types';
import { getActiveLanguages } from '@/lib/languages';
import { getTranslations } from 'next-intl/server';
import RandomBlogPosts from '@/components/RandomBlogPosts';
import { getCache, setCache } from '@/lib/cache';

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

// Add revalidate for caching

async function getPost(slug: string, locale: string): Promise<LocalizedBlogPost | null> {
  const cacheKey = `blog-post-${slug}-${locale}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('⚠️⚠️[CACHE HIT] /api/blog-post');
    return cached;
  }
  else {
    console.log('❌❌[DB HIT] /api/blog-post');
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog-post/${slug}?locale=${locale}`,{
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (!data.success) return null;
    if (data.success) {
      setCache(cacheKey, data.post);
      return data.post 
    }

  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
  }
  return null;
}
async function getRandomBlogPosts(locale: string, currentSlug: string, limit: number = 6) {
  const cacheKey = `random-blog-posts-${locale}-${currentSlug}-${limit}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('⚠️⚠️[CACHE HIT] /api/random-blog-posts');
    return cached;
  }
  else {
    console.log('❌❌[DB HIT] /api/random-blog-posts');
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/random-blog-posts?locale=${locale}&currentSlug=${currentSlug}&limit=${limit}`,
      {
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    if (!data.success) return [];
    if (data.success) {
      setCache(cacheKey, data.posts);
      return data.posts
    }
  } catch (error) {
    console.error('Error fetching random posts:', error);
    return [];
  }
}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug: rawSlug } = params;
  const slug = rawSlug.replace(/(\.html)+$/, ''); // Remove all trailing .html
  
  try {
    const post = await getPost(slug, locale);
    
    if (!post) {
      return {
        title: 'Not Found',
      };
    }

    // Get dynamic languages for alternates
    const activeLanguages = await getActiveLanguages();
    
    // Build dynamic languages object for alternates
    const languages: Record<string, string> = {};
    activeLanguages.forEach(lang => {
      if (lang.locale === 'en') {
        languages[lang.locale] = `https://www.bazoocam.live/apps/${slug}.html`;
      } else {
        languages[lang.locale] = `https://www.bazoocam.live/${lang.locale}/apps/${slug}.html`;
      }
    });

    // Add x-default hreflang
    languages['x-default'] = `https://www.bazoocam.live/apps/${slug}.html`;

    const title = post.meta?.title || post.title || '';
    const description = post.meta?.description || post.description || '';
    const keywords = post.meta?.keywords || '';
    const canonical = `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/apps/${slug}.html`;

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
        type: 'article',
        images: post.imageUrl ? [{ url: post.imageUrl }] : [],
        locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Error',
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug: rawSlug } = params;
  const slug = rawSlug.replace(/(\.html)+$/, ''); // Remove all trailing .html
  const post = await getPost(slug, locale);

  if (!post) {
    notFound();
  }

  const title = post.title || '';
  const content = post.content || '';
  const description = post.description || '';

  // Get random blog posts for the alternatives section
  const randomPosts = await getRandomBlogPosts(locale, slug, 6);

  // Get translations
  const t = await getTranslations({ locale, namespace: 'post' });

  return (
    <article className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <JsonLdScript post={post} locale={locale} />
      
      <div className="container mx-auto px-4 py-8">
       <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('topAlternativesTitle')} {post.title}
          </h2>
          <div className="flex items-center justify-center mb-4">
            <div className="text-md mr-2 mt-3">
              {t('rated')} {'⭐'.repeat(post.rating?.stars || 0)}{post.rating?.stars && post.rating?.stars % 1 !== 0 ? '⭐' : ''}{'☆'.repeat(5 - (post.rating?.stars || 0) - (post.rating?.stars && post.rating?.stars % 1 !== 0 ? 1 : 0))}
            </div>
            <span className="text-gray-600 mt-3">({post.rating?.votes?.toLocaleString() || 0} {t('reviews')})</span>
          </div>
        </div>

        {/* Random Blog Posts Grid - Similar to image */}
        {randomPosts.length > 0 && (
          <RandomBlogPosts 
            posts={randomPosts} 
            locale={locale} 
            currentTitle={title}
          />
        )}

        {/* Breadcrumb */}
        <div className="mb-2">
          <Breadcrumb post={post} locale={locale} />
        </div>

        {/* Main Content Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            {/* Featured Image */}
            {post.imageUrl && (
              <div className="relative h-full w-full">
                <img
                  src={post.imageUrl}
                  alt={title}
                  className="w-2/3 h-2/3 object-cover mx-auto"
                />
          
              </div>
            )}

            {/* Content */}
            <div className="md:p-8 p-4">
              {/* Start Chat Button */}
              <div className="flex justify-center mb-12">
                <StartChatButton appName={title} appSlug={slug} locale={locale} />
              </div>

              {/* Main Content */}
              <div className="prose prose-sm max-w-none mb-12 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>

              {/* Pros and Cons */}
              {post.prosAndCons && (
                <div className="mb-12">
                  <ProsAndCons prosAndCons={post.prosAndCons} locale={locale} />
                </div>
              )}

              {/* Alternative Apps */}
              {post.alternatives && post.alternatives.length > 0 && (
                <div className="mb-12">
                  <AlternativeApps 
                    alternatives={post.alternatives} 
                    alternativesDescription={post.alternativesDescription}
                    locale={locale} 
                  />
                </div>
              )}

              {/* FAQ Section */}
              {post.faqs && post.faqs.length > 0 && (
                <div>
                  <FAQSection faqs={post.faqs} locale={locale} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
} 