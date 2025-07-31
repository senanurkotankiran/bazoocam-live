import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { BlogPost, LocalizedBlogPost } from '@/types';

interface BreadcrumbProps {
  post: BlogPost | LocalizedBlogPost;
  locale: string;
}

export default function Breadcrumb({ post, locale }: BreadcrumbProps) {
  const title = typeof post.title === 'string' ? post.title : (post.title[locale] || post.title['en'] || '');
  
  const getLocalizedPath = (path: string) => {
    if (locale === 'en') {
      return path;
    }
    return `/${locale}${path}`;
  };

  return (
    <nav className="max-w-4xl mx-auto px-4 mb-3" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-xs">
        <li>
          <Link 
            href={getLocalizedPath('/')}
            className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            Home
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400 mx-1" />
          <Link 
            href={getLocalizedPath('/apps/')}
            className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            Apps
          </Link>
        </li>
        
        {/* Category breadcrumb if available */}
        {post.categoryId && (
          <li className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400 mx-1" />
            <Link 
              href={getLocalizedPath(`/${post.categoryId.slug}`)}
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium capitalize"
            >
              {typeof post.categoryId.name === 'string' 
                ? post.categoryId.name 
                : (post.categoryId.name[locale] || post.categoryId.name['en'])}
            </Link>
          </li>
        )}
        
        <li className="flex items-center">
          <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400 mx-1" />
          <span className="text-gray-900 font-semibold truncate max-w-xs capitalize">
            {title}
          </span>
        </li>
      </ol>
    </nav>
  );
} 