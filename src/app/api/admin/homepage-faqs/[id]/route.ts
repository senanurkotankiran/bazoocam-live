import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HomepageFAQ from '@/models/FAQ';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { question, answer, order, isActive } = body;

    const updateData: any = {
      question: new Map(Object.entries(question)),
      answer: new Map(Object.entries(answer)),
      order,
      isActive
    };

    const faq = await HomepageFAQ.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!faq) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(faq))
    });
  } catch (error) {
    console.error('Error updating homepage FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ' },
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
    
    const faq = await HomepageFAQ.findByIdAndDelete(params.id);

    if (!faq) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting homepage FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
} 