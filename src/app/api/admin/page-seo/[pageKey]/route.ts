import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageSEO from '@/models/PageSEO';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageKey: string } }
) {
  try {
    await dbConnect();
    
    const pageSEO = await PageSEO.findOne({ pageKey: params.pageKey }).lean();
    
    if (!pageSEO) {
      return NextResponse.json(
        { success: false, error: 'Page SEO not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(pageSEO))
    });
  } catch (error) {
    console.error('Error fetching page SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page SEO' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { pageKey: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { title, description, keywords, jsonLd, canonical, robots } = body;

    const updateData: any = {
      title: new Map(Object.entries(title)),
      description: new Map(Object.entries(description)),
      canonical,
      robots
    };

    if (keywords) {
      updateData.keywords = new Map(Object.entries(keywords));
    }

    if (jsonLd) {
      updateData.jsonLd = jsonLd;
    }

    const pageSEO = await PageSEO.findOneAndUpdate(
      { pageKey: params.pageKey },
      updateData,
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(pageSEO))
    });
  } catch (error) {
    console.error('Error updating page SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update page SEO' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pageKey: string } }
) {
  try {
    await dbConnect();
    
    const deletedPageSEO = await PageSEO.findOneAndDelete({ pageKey: params.pageKey });
    
    if (!deletedPageSEO) {
      return NextResponse.json(
        { success: false, error: 'Page SEO not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Page SEO deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting page SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete page SEO' },
      { status: 500 }
    );
  }
} 