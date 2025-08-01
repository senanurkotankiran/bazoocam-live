import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
// Import Category model to ensure it's registered
import Category from '@/models/Category';
import slugify from 'slugify';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const posts = await BlogPost.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        model: 'Category',
        select: 'name slug'
      })
      .lean();

    // Handle data migration for prosAndCons if needed
    const migratedPosts = posts.map((post: any) => {
      if (post.prosAndCons) {
        const migrateProsConsData = (data: any) => {
          if (Array.isArray(data)) {
            // Old format: array of strings -> convert to string (one per line)
            return data.filter((item: any) => item && typeof item === 'string' && item.trim()).join('\n');
          } else if (typeof data === 'string') {
            // New format: already a string
            return data;
          } else {
            // Fallback: empty string
            return '';
          }
        };

        // Migrate pros data
        if (post.prosAndCons.pros) {
          const migratedPros: Record<string, string> = {};
          Object.entries(post.prosAndCons.pros).forEach(([locale, data]) => {
            migratedPros[locale] = migrateProsConsData(data);
          });
          post.prosAndCons.pros = migratedPros;
        }

        // Migrate cons data
        if (post.prosAndCons.cons) {
          const migratedCons: Record<string, string> = {};
          Object.entries(post.prosAndCons.cons).forEach(([locale, data]) => {
            migratedCons[locale] = migrateProsConsData(data);
          });
          post.prosAndCons.cons = migratedCons;
        }
      }

      // Clean alternatives data - remove url and imageUrl fields
      if (post.alternatives && Array.isArray(post.alternatives)) {
        post.alternatives = post.alternatives.map((alt: any) => ({
          name: alt.name,
          description: alt.description
        }));
      }

      return post;
    });

    const total = await BlogPost.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(migratedPosts)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { title, content, description, imageUrl, author, categoryId, status, meta, faqs, alternatives, alternativesDescription, prosAndCons, rating } = body;
    
    // Generate slug from provided slug or English title
    let slug = body.slug;
    if (!slug) {
      slug = slugify(title.en || '', {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
    }

    // Check if slug already exists
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    const postData: any = {
      slug,
      title: new Map(Object.entries(title)),
      content: new Map(Object.entries(content)),
      description: new Map(Object.entries(description)),
      imageUrl,
      author: author || null,
      categoryId: categoryId || null,
      status: status || 'draft'
    };

    // Handle rating data
    if (rating) {
      postData.rating = {
        stars: rating.stars || 5,
        votes: rating.votes || 0
      };
    }

    if (meta) {
      postData.meta = {
        title: new Map(Object.entries(meta.title)),
        description: new Map(Object.entries(meta.description)),
        keywords: new Map(Object.entries(meta.keywords)),
        canonical: meta.canonical
      };
    }

    if (faqs && faqs.length > 0) {
      postData.faqs = faqs.map((faq: any) => ({
        question: new Map(Object.entries(faq.question)),
        answer: new Map(Object.entries(faq.answer))
      }));
    }

    if (alternatives && alternatives.length > 0) {
      postData.alternatives = alternatives.map((alt: any) => ({
        name: new Map(Object.entries(alt.name)),
        description: new Map(Object.entries(alt.description))
      }));
    }

    if (alternativesDescription) {
      postData.alternativesDescription = new Map(Object.entries(alternativesDescription));
    }

    if (prosAndCons) {
      postData.prosAndCons = {
        pros: new Map(Object.entries(prosAndCons.pros)),
        cons: new Map(Object.entries(prosAndCons.cons))
      };
    }

    const post = new BlogPost(postData);
    await post.save();

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(post))
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 