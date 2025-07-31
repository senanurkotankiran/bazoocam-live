import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import Category from '@/models/Category';
import { Category as CategoryType } from '@/types';

interface Props {
  params: {
    slug: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    const { slug } = params;
    
    // First, get the category
    const category = await Category.findOne({ slug }).lean() as CategoryType | null;
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category has content for the requested locale
    const categoryName = category.name[locale] || category.name['en'];
    const categoryDescription = category.description?.[locale] || category.description?.['en'];
    
    if (!categoryName) {
      return NextResponse.json(
        { success: false, error: 'Category not available in this language' },
        { status: 404 }
      );
    }
    
    // Get posts for this category with locale filtering
    const skip = (page - 1) * limit;
    
    const posts = await BlogPost.find({
      'categoryId': category._id,
      status: 'published',
      $or: [
        { [`title.${locale}`]: { $exists: true, $ne: "" } },
        { [`description.${locale}`]: { $exists: true, $ne: "" } },
        { [`content.${locale}`]: { $exists: true, $ne: "" } }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    // Get total count for pagination
    const totalPosts = await BlogPost.countDocuments({
      'categoryId': category._id,
      status: 'published',
      $or: [
        { [`title.${locale}`]: { $exists: true, $ne: "" } },
        { [`description.${locale}`]: { $exists: true, $ne: "" } },
        { [`content.${locale}`]: { $exists: true, $ne: "" } }
      ]
    });
    
    // Filter posts to only include the specific locale's content
    const localizedPosts = posts.map((post: any) => ({
      _id: post._id?.toString() || '',
      slug: post.slug,
      title: post.title[locale] || post.title['en'] || '',
      description: post.description[locale] || post.description['en'] || '',
      content: post.content[locale] || post.content['en'] || '',
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      rating: {
        stars: post.rating?.stars || 4,
        votes: post.rating?.votes || 2549
      }
    }));
    
    const totalPages = Math.ceil(totalPosts / limit);
    
    return NextResponse.json({
      success: true,
      category: {
        _id: category._id?.toString() || '',
        name: categoryName,
        description: categoryDescription,
        slug: category.slug
      },
      posts: localizedPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts by category' },
      { status: 500 }
    );
  }
} 