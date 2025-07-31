import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HomepageFAQ from '@/models/FAQ';

export async function GET() {
  try {
    await dbConnect();
    
    const faqs = await HomepageFAQ.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(faqs))
    });
  } catch (error) {
    console.error('Error fetching homepage FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { question, answer, order, isActive } = body;

    const faqData = {
      question: new Map(Object.entries(question)),
      answer: new Map(Object.entries(answer)),
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    };

    const faq = new HomepageFAQ(faqData);
    await faq.save();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(faq))
    });
  } catch (error) {
    console.error('Error creating homepage FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
} 