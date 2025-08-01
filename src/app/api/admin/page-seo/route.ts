import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageSEO from '@/models/PageSEO';
import { PageSEO as PageSEOType } from '@/types';

export async function GET() {
  try {
    await dbConnect();
    
    const pagesSEO = await PageSEO.find().sort({ pageKey: 1 }).lean();
    
    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(pagesSEO))
    });
  } catch (error) {
    console.error('Error fetching pages SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pages SEO' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { pageKey, title, description, keywords, jsonLd, canonical, robots } = body;

    // Check if page SEO already exists
    const existingPageSEO = await PageSEO.findOne({ pageKey });
    
    if (existingPageSEO) {
      return NextResponse.json(
        { success: false, error: 'Page SEO already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    const pageSEO = new PageSEO({
      pageKey,
      title: new Map(Object.entries(title)),
      description: new Map(Object.entries(description)),
      keywords: keywords ? new Map(Object.entries(keywords)) : undefined,
      jsonLd: jsonLd ? new Map(Object.entries(jsonLd)) : undefined,
      canonical,
      robots
    });

    await pageSEO.save();

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(pageSEO))
    });
  } catch (error) {
    console.error('Error creating page SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create page SEO' },
      { status: 500 }
    );
  }
} 