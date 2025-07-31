import mongoose from 'mongoose';

export interface ILanguage {
  _id?: string;
  code: string; // 'en', 'fr', 'es', etc.
  name: string; // 'English', 'Français', etc.
  nativeName: string; // Native language name
  flag: string; // Flag emoji or code
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LanguageSchema = new mongoose.Schema<ILanguage>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 2,
      maxlength: 5
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    nativeName: {
      type: String,
      required: true,
      trim: true
    },
    flag: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one default language
LanguageSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('Language').updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Index for better performance
LanguageSchema.index({ code: 1, isActive: 1 });
LanguageSchema.index({ isDefault: 1 });

export default mongoose.models.Language || mongoose.model<ILanguage>('Language', LanguageSchema); 