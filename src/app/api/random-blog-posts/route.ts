import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const currentSlug = searchParams.get('currentSlug') || '';
    const limit = parseInt(searchParams.get('limit') || '6');
    
    const posts = await BlogPost.aggregate([
      {
        $match: {
          status: 'published',
          slug: { $ne: currentSlug },
          $or: [
            { [`title.${locale}`]: { $exists: true, $ne: "" } },
            { [`description.${locale}`]: { $exists: true, $ne: "" } },
            { [`content.${locale}`]: { $exists: true, $ne: "" } }
          ]
        }
      },
      { $sample: { size: limit } },
      {
        $project: {
          title: 1,
          description: 1,
          imageUrl: 1,
          slug: 1,
          rating: 1
        }
      }
    ]);
    
    // Filter blog posts to only include the specific locale's content
    const localizedPosts = posts.map((post: any) => ({
      _id: post._id.toString(), // Convert ObjectId to string
      title: post.title[locale] || post.title['en'] || '',
      description: post.description[locale] || post.description['en'] || '',
      imageUrl: post.imageUrl,
      slug: post.slug,
      rating: post.rating ? {
        stars: post.rating.stars || 4,
        votes: post.rating.votes || 2549
      } : {
        stars: 4,
        votes: 2549
      }
    }));
    
    const parsedPosts = JSON.parse(JSON.stringify(localizedPosts));

    return NextResponse.json({
      success: true,
      posts: parsedPosts
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching random posts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch random posts' 
      },
      { status: 500 }
    );
  }
} 