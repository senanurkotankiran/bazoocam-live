import mongoose from 'mongoose';
import { AdminUser } from '@/types';

const AdminUserSchema = new mongoose.Schema<AdminUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'editor'],
      default: 'editor'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.AdminUser || mongoose.model<AdminUser>('AdminUser', AdminUserSchema); 