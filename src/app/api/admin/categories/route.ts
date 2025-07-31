import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import slugify from 'slugify';

export async function GET() {
  try {
    await dbConnect();
    
    const categories = await Category.find().sort({ name: 1 }).lean();
    
    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(categories))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    const categoryData = {
      slug,
      name: new Map(Object.entries(name)),
      description: description ? new Map(Object.entries(description)) : undefined
    };

    const category = new Category(categoryData);
    await category.save();

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(category))
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 