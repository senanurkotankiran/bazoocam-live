import mongoose from 'mongoose';
import { Category } from '@/types';

const CategorySchema = new mongoose.Schema<Category>(
  {
    name: {
      type: Map,
      of: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    description: {
      type: Map,
      of: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Category || mongoose.model<Category>('Category', CategorySchema); 