import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import BlogPostCard from '@/components/BlogPostCard';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import { getActiveLanguages } from '@/lib/languages';
import StartChatButton from '@/components/StartChatButton';
import Hero from '@/components/Hero';
import ChatModal from '@/components/ChatModal';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  // Get translations for metadata
  const appsT = await getTranslations({ locale, namespace: 'apps' });
  
  const title = appsT('title') || 'Video Chat Applications - Bazoocam Live';
  const description = appsT('subtitle') || 'Explore all available video chat applications and platforms';
  const canonical = `https://www.bazoocam.live${locale === 'en' ? '' : `/${locale}`}/apps/`;

  // Get dynamic languages for alternates
  const activeLanguages = await getActiveLanguages();
  
  // Build dynamic languages object for alternates
  const languages: Record<string, string> = {};
  activeLanguages.forEach(lang => {
    if (lang.locale === 'en') {
      languages[lang.locale] = 'https://www.bazoocam.live/apps/';
    } else {
      languages[lang.locale] = `https://www.bazoocam.live/${lang.locale}/apps/`;
    }
  });

  // Add x-default hreflang
  languages['x-default'] = 'https://www.bazoocam.live/apps/';

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
}

async function getPublishedPostsForLocale(locale: string) {
  try {
    await dbConnect();
    const posts = await BlogPost.find({ 
      status: 'published',
      // Filter: Only include posts that have translation for this locale
      $or: [
        { [`title.${locale}`]: { $exists: true, $ne: "" } },
        { [`description.${locale}`]: { $exists: true, $ne: "" } },
        { [`content.${locale}`]: { $exists: true, $ne: "" } }
      ]
    })
      .select('title description content imageUrl slug createdAt updatedAt rating')
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function AppsPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const appsT = await getTranslations({ locale, namespace: 'apps' });
  const posts = await getPublishedPostsForLocale(locale);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 antialiased">
      {/* Header Section with Background Image */}
      <div className="w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(/uploads/bg5.png)` }}>
        <div className="py-32 bg-[#02040a66]/40">
          <div className="container">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-white">
                {appsT('title')}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {appsT('subtitle')}
              </p>
              
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post: any) => (
                  <BlogPostCard
                    key={post._id}
                    post={post}
                    locale={locale}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {appsT('noResults') || 'No posts found'}
                </h3>
                <p className="text-gray-600">
                  No posts available for the selected language.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
} 