import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
// Import Category model to ensure it's registered
import Category from '@/models/Category';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Safely populate category - will work even if categoryId is null
    const post = await BlogPost.findById(params.id)
      .populate({
        path: 'categoryId',
        model: 'Category',
        select: 'name slug'
      })
      .lean();
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Handle data migration for prosAndCons if needed
    const postData = post as any;
    if (postData.prosAndCons) {
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
      if (postData.prosAndCons.pros) {
        const migratedPros: Record<string, string> = {};
        Object.entries(postData.prosAndCons.pros).forEach(([locale, data]) => {
          migratedPros[locale] = migrateProsConsData(data);
        });
        postData.prosAndCons.pros = migratedPros;
      }

      // Migrate cons data
      if (postData.prosAndCons.cons) {
        const migratedCons: Record<string, string> = {};
        Object.entries(postData.prosAndCons.cons).forEach(([locale, data]) => {
          migratedCons[locale] = migrateProsConsData(data);
        });
        postData.prosAndCons.cons = migratedCons;
      }
    }

    // Handle alternatives data migration
    if (postData.alternatives && Array.isArray(postData.alternatives)) {
      postData.alternatives = postData.alternatives.map((alt: any) => {
        // Handle old format where name was a string
        let name = alt.name;
        if (typeof name === 'string') {
          // Convert old string format to new Map format
          name = { en: name };
        } else if (name && typeof name === 'object' && name instanceof Map) {
          // Convert Map to plain object
          name = Object.fromEntries(name);
        }

        // Handle description
        let description = alt.description;
        if (description && typeof description === 'object' && description instanceof Map) {
          // Convert Map to plain object
          description = Object.fromEntries(description);
        }

        return {
          name: name || {},
          description: description || {}
        };
      });
    }

    // Handle alternativesDescription migration
    if (postData.alternativesDescription && postData.alternativesDescription instanceof Map) {
      postData.alternativesDescription = Object.fromEntries(postData.alternativesDescription);
    }

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(post))
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { title, content, description, imageUrl, author, categoryId, status, meta, faqs, alternatives, alternativesDescription, prosAndCons, rating, slug } = body;

    // Check if slug is being changed and if it already exists
    if (slug) {
      const existingPost = await BlogPost.findOne({ slug, _id: { $ne: params.id } });
      if (existingPost) {
        return NextResponse.json(
          { success: false, error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      title: new Map(Object.entries(title)),
      content: new Map(Object.entries(content)),
      description: new Map(Object.entries(description)),
      imageUrl,
      author: author || null,
      categoryId: categoryId || null,
      status,
      slug
    };

    // Handle rating data
    if (rating) {
      updateData.rating = {
        stars: rating.stars || 5,
        votes: rating.votes || 0
      };
    }

    if (meta) {
      updateData.meta = {
        title: new Map(Object.entries(meta.title)),
        description: new Map(Object.entries(meta.description)),
        keywords: new Map(Object.entries(meta.keywords)),
        canonical: meta.canonical
      };
    }

    if (faqs) {
      updateData.faqs = faqs.map((faq: any) => ({
        question: new Map(Object.entries(faq.question)),
        answer: new Map(Object.entries(faq.answer))
      }));
    }

    if (alternatives) {
      updateData.alternatives = alternatives.map((alt: any) => ({
        name: new Map(Object.entries(alt.name)),
        description: new Map(Object.entries(alt.description))
      }));
    }

    if (alternativesDescription) {
      updateData.alternativesDescription = new Map(Object.entries(alternativesDescription));
    }

    if (prosAndCons) {
      updateData.prosAndCons = {
        pros: new Map(Object.entries(prosAndCons.pros)),
        cons: new Map(Object.entries(prosAndCons.cons))
      };
    }

    const post = await BlogPost.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(post))
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const deletedPost = await BlogPost.findByIdAndDelete(params.id);
    
    if (!deletedPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
} 