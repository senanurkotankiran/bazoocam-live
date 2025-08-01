'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/outline';
import { BlogPost } from '@/types';

interface BlogPostCardProps {
  post: BlogPost;
  locale: string;
}

export default function BlogPostCard({ post, locale }: BlogPostCardProps) {
  const t = useTranslations('common');
  const params = useParams();
  const currentLocale = (params.locale as string) || 'en';

  const getLocalizedPath = (path: string) => {
    if (currentLocale === 'en') {
      return path;
    }
    return `/${currentLocale}${path}`;
  };

  const title = post.title[locale] || post.title['en'] || '';
  const description = post.description[locale] || post.description['en'] || '';
  const content = post.content?.[locale] || post.content?.['en'] || '';

  const truncateContent = (content: string, maxLength: number = 80) => {
    const strippedContent = content.replace(/<[^>]*>/g, '');
    if (strippedContent.length <= maxLength) {
      return strippedContent;
    }
    return strippedContent.substring(0, maxLength).trim() + '...';
  };

  return (
    <article className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Featured Image */}
      {post.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.imageUrl}
            alt={title}
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
              <time dateTime={typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString()}>
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
            {title}
          </Link>
        </h2>
        
        {/* Content Preview */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {truncateContent(content, 80)}
        </p>
        
        {/* Read More Link */}
        <Link 
          href={getLocalizedPath(`/apps/${post.slug}.html`)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          {t('readMore') || 'Read More'}
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </article>
  );
} 