import mongoose from 'mongoose';

export interface HomepageFAQ {
  _id?: string;
  question: Record<string, string>; // Multi-language questions
  answer: Record<string, string>; // Multi-language answers
  order: number; // For ordering FAQs
  isActive: boolean; // To enable/disable FAQs
  createdAt: Date;
  updatedAt: Date;
}

const HomepageFAQSchema = new mongoose.Schema<HomepageFAQ>(
  {
    question: {
      type: Map,
      of: String,
      required: true
    },
    answer: {
      type: Map,
      of: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Create index for better performance
HomepageFAQSchema.index({ order: 1, isActive: 1 });

export default mongoose.models.HomepageFAQ || mongoose.model<HomepageFAQ>('HomepageFAQ', HomepageFAQSchema); 