'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ChatModal from './ChatModal';
import BlogChatModal from './BlogChatModal';

interface RandomBlogPostsProps {
  posts: any[];
  locale: string;
  currentTitle: string;
}

export default function RandomBlogPosts({ posts, locale, currentTitle }: RandomBlogPostsProps) {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations('post');

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  if (posts.length === 0) return null;



  return (
    <>
      <section className="mb-12 mt-4">
      
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {posts.map((post: any, index: number) => {
            const postTitle = typeof post.title === 'string' 
              ? post.title 
              : (post.title?.[locale] || post.title?.['en'] || '');
            
            // Calculate individual post rating
            const postStars = post.rating?.stars || 4;
            const postVotes = post.rating?.votes || 2549;
            const postFullStars = Math.floor(postStars);
            const postHasHalfStar = postStars % 1 !== 0;
            
            return (
              <div 
                key={post._id} 
                className="block cursor-pointer"
                onClick={() => handlePostClick(post)}
              >
                <div className="bg-white rounded-xl py-1.5 px-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 text-center group transform hover:-translate-y-1">
                  {post.imageUrl ? (
                    <div className="w-12 h-12 mx-auto mb-2 rounded-md overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
                      <img
                        src={post.imageUrl}
                        alt={postTitle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-md flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-800 text-md group-hover:text-blue-600 transition-colors duration-300">
                    {postTitle}
                  </h3>
                  {/* Individual post rating */}
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-xs mr-1">
                        {'⭐'.repeat(postFullStars)}{postHasHalfStar ? '⭐' : ''}{'☆'.repeat(5 - postFullStars - (postHasHalfStar ? 1 : 0))}
                      </span>
                      <span className="text-xs font-medium">({postStars.toFixed(1)})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {postVotes.toLocaleString()} {t('reviews')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chat Modal */}
      {selectedPost && (
        <BlogChatModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          appName={typeof selectedPost.title === 'string' 
            ? selectedPost.title 
            : (selectedPost.title?.[locale] || selectedPost.title?.['en'] || '')}
          appSlug={selectedPost.slug}
          locale={locale}
        />
      )}
    </>
  );
} 