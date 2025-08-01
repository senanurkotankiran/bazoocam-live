import mongoose from 'mongoose';
import { BlogPost } from '@/types';

// Ensure Category model is loaded
import './Category';

const FAQSchema = new mongoose.Schema({
  question: {
    type: Map,
    of: String,
    required: true
  },
  answer: {
    type: Map,
    of: String,
    required: true
  }
});

const AlternativeSchema = new mongoose.Schema({
  name: {
    type: Map,
    of: String,
    required: true
  },
  description: {
    type: Map,
    of: String,
    required: true
  }
});

const BlogPostSchema = new mongoose.Schema<BlogPost>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: Map,
      of: String,
      required: true
    },
    content: {
      type: Map,
      of: String,
      required: true
    },
    description: {
      type: Map,
      of: String,
      required: true
    },
    imageUrl: String,
    author: String, // Blog yazarı
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false // Category artık zorunlu değil
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    rating: {
      stars: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
      },
      votes: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    meta: {
      title: {
        type: Map,
        of: String,
        required: true
      },
      description: {
        type: Map,
        of: String,
        required: true
      },
      keywords: {
        type: Map,
        of: String
      },
      canonical: String
    },
    faqs: [FAQSchema],
    alternatives: [AlternativeSchema],
    alternativesDescription: {
      type: Map,
      of: String
    },
    prosAndCons: {
      pros: {
        type: Map,
        of: String
      },
      cons: {
        type: Map,
        of: String
      }
    }
  },
  {
    timestamps: true
  }
);

// Create index for better performance
BlogPostSchema.index({ slug: 1, status: 1 });
BlogPostSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.BlogPost || mongoose.model<BlogPost>('BlogPost', BlogPostSchema); 