import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';


export async function GET(request: NextRequest) {

    try {
      await dbConnect();
      
      // Get the latest 7 published blog posts
      const posts = await BlogPost.find({ 
        status: 'published'
      })
        .sort({ createdAt: -1 })
        .limit(7)
        .select('title description imageUrl slug')
        .lean();
      
      const parsedPosts = JSON.parse(JSON.stringify(posts));
  
      return NextResponse.json({
        success: true,
        blogs: parsedPosts
      });
    } catch (error) {
      console.error('Error fetching latest blogs:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch blogs' 
        },
        { status: 500 }
      );
    }
  
  
} 