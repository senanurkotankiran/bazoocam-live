'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

interface BlogPost {
  _id: string;
  title: Record<string, string> | string;
  slug: string;
}

interface FooterProps {
  blogs: BlogPost[];
}

export default function Footer({ blogs }: FooterProps) {
  const t = useTranslations('navigation');
  const footerT = useTranslations('footer');
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string || 'en';

  // Check if we're on a blog detail page
  const isBlogDetailPage = pathname.includes('/apps/') && pathname.includes('.html');

  const getLocalizedPath = (path: string) => {
    if (locale === 'en') {
      return path;
    }
    return `/${locale}${path}`;
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">{footerT('about')}</h4>
            <div className="space-y-2">
              <Link href={getLocalizedPath('/apps/')} className="block text-gray-300 hover:text-white">
                {t('apps')}
              </Link>
              <Link href={getLocalizedPath('/privacy.html')} className="block text-gray-300 hover:text-white">
                {t('privacy')}
              </Link>
              <Link href={getLocalizedPath('/contact.html')} className="block text-gray-300 hover:text-white">
                {t('contact')}
              </Link>
            </div>
          </div>

          {/* Only show Other Applications section on non-blog detail pages */}
          {!isBlogDetailPage && (
            <div>
              <h4 className="text-lg font-semibold mb-4">{footerT('Other Applications')}</h4>
              <div className="space-y-2">
                {blogs.length > 0 ? (
                  blogs.map((blog) => {
                    // Handle both localized and multi-language blog title formats
                    const title = typeof blog.title === 'string' 
                      ? blog.title 
                      : (blog.title[locale] || blog.title['en'] || Object.values(blog.title)[0] || 'Untitled');
                    
                    return (
                      <Link 
                        key={blog._id}
                        href={getLocalizedPath(`/apps/${blog.slug}.html`)} 
                        className="block text-gray-300 hover:text-white"
                      >
                        {title}
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-gray-300">No applications available</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Bazoocam Live. {footerT('allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
} 