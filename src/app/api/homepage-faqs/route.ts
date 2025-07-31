import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HomepageFAQ from '@/models/FAQ';


export async function GET() {

    try {
      await dbConnect();
      
      const faqs = await HomepageFAQ.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();
  
      const parsedFaqs = JSON.parse(JSON.stringify(faqs));
  
      return NextResponse.json({ success: true, data: parsedFaqs });
    } catch (error) {
      console.error('Error fetching homepage FAQs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch FAQs' },
        { status: 500 }
      );
    }
  }


