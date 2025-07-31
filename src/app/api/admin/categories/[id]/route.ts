import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import BlogPost from '@/models/BlogPost';
import slugify from 'slugify';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const category = await Category.findById(params.id).lean();
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(category))
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
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
    const { name, description } = body;

    // Generate slug from provided slug or English name
    let slug = body.slug;
    if (!slug) {
      slug = slugify(name.en || '', {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
    }

    // Check if slug is being changed and if it already exists
    if (slug) {
      const existingCategory = await Category.findOne({ slug, _id: { $ne: params.id } });
      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updateData = {
      slug,
      name: new Map(Object.entries(name)),
      description: description ? new Map(Object.entries(description)) : undefined
    };

    const category = await Category.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(category))
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
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
    
    // Check if category is being used by any posts
    const postsUsingCategory = await BlogPost.countDocuments({ categoryId: params.id });
    
    if (postsUsingCategory > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete category. It is being used by ${postsUsingCategory} post(s).` },
        { status: 400 }
      );
    }
    
    const deletedCategory = await Category.findByIdAndDelete(params.id);
    
    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 