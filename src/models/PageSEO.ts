import mongoose from 'mongoose';

export interface PageSEO {
  _id?: string;
  pageKey: string; // 'homepage', 'contact', 'privacy', etc.
  title: Map<string, string>; // Multi-language titles
  description: Map<string, string>; // Multi-language descriptions
  keywords: Map<string, string>; // Multi-language keywords
  jsonLd: Map<string, any>; // Multi-language JSON-LD structured data
  canonical?: string;
  robots?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PageSEOSchema = new mongoose.Schema<PageSEO>(
  {
    pageKey: {
      type: String,
      required: true,
      unique: true
    },
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
    jsonLd: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    canonical: String,
    robots: {
      type: String,
      default: 'index, follow'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.PageSEO || mongoose.model<PageSEO>('PageSEO', PageSEOSchema); 