import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import { BlogPost as BlogPostType, LocalizedBlogPost } from '@/types';

interface Props {
  params: {
    slug: string;
  };
}

async function getPost(slug: string, locale: string): Promise<LocalizedBlogPost | null> {
  try {
    await dbConnect();
    const post = await BlogPost.findOne({ slug, status: 'published' })
      .populate({
        path: 'categoryId',
        model: 'Category',
        select: 'name slug'
      })
      .lean() as BlogPostType | null;
    
    if (!post) {
      return null;
    }
    
    // Filter blog post to only include the specific locale's content
    const localizedPost = {
      _id: post._id?.toString() || '',
      slug: post.slug,
      imageUrl: post.imageUrl,
      status: post.status,
      rating: post.rating ? {
        stars: post.rating.stars || 4,
        votes: post.rating.votes || 2549
      } : {
        stars: 4,
        votes: 2549
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      // Filter title, description, content by locale
      title: post.title[locale] || post.title['en'] || '',
      description: post.description[locale] || post.description['en'] || '',
      content: post.content[locale] || post.content['en'] || '',
      // Filter meta data by locale
      meta: post.meta ? {
        title: post.meta.title[locale] || post.meta.title['en'] || '',
        description: post.meta.description[locale] || post.meta.description['en'] || '',
        keywords: post.meta.keywords?.[locale] || post.meta.keywords?.['en'] || '',
        canonical: post.meta.canonical
      } : undefined,
      // Filter category by locale
      categoryId: post.categoryId ? {
        _id: post.categoryId._id.toString(),
        name: post.categoryId.name[locale] || post.categoryId.name['en'] || '',
        slug: post.categoryId.slug
      } : undefined,
      // Filter alternatives by locale
      alternatives: post.alternatives ? post.alternatives.map((alt: any) => ({
        name: alt.name[locale] || alt.name['en'] || '',
        description: alt.description[locale] || alt.description['en'] || ''
      })) : undefined,
      alternativesDescription: post.alternativesDescription ? 
        post.alternativesDescription[locale] || post.alternativesDescription['en'] || '' : undefined,
      // Filter pros and cons by locale
      prosAndCons: post.prosAndCons ? {
        pros: (() => {
          const prosData = post.prosAndCons.pros[locale] || post.prosAndCons.pros['en'];
          return Array.isArray(prosData) ? prosData.join(', ') : (prosData || '');
        })(),
        cons: (() => {
          const consData = post.prosAndCons.cons[locale] || post.prosAndCons.cons['en'];
          return Array.isArray(consData) ? consData.join(', ') : (consData || '');
        })()
      } : undefined,
      // Filter FAQs by locale
      faqs: post.faqs ? post.faqs.map((faq: any) => ({
        question: faq.question[locale] || faq.question['en'] || '',
        answer: faq.answer[locale] || faq.answer['en'] || ''
      })) : undefined
    };
    
    return localizedPost;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { slug: rawSlug } = params;
    const slug = rawSlug.replace(/(\.html)+$/, ''); // Remove all trailing .html
    
    // Get locale from query params or default to 'en'
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const post = await getPost(slug, locale);
    
    if (!post) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Post not found' 
        },
        { status: 404 }
      );
    }

    const parsedPost = JSON.parse(JSON.stringify(post));

    return NextResponse.json({
      success: true,
      post: parsedPost
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog post' 
      },
      { status: 500 }
    );
  }
} 