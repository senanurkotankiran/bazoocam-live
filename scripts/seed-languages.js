const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
// Language schema
const LanguageSchema = new mongoose.Schema({
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
}, {
  timestamps: true
});

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

const Language = mongoose.models.Language || mongoose.model('Language', LanguageSchema);

const defaultLanguages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isActive: true,
    isDefault: true
  }
];

async function seedLanguages() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('Connected to MongoDB');

    // Check if languages already exist
    const existingLanguages = await Language.countDocuments();
    
    if (existingLanguages > 0) {
      console.log(`Found ${existingLanguages} existing languages. Skipping seed.`);
      return;
    }

    // Create languages
    for (const langData of defaultLanguages) {
      const existingLang = await Language.findOne({ code: langData.code });
      
      if (!existingLang) {
        const language = new Language(langData);
        await language.save();
        console.log(`Created language: ${langData.name} (${langData.code})`);
      } else {
        console.log(`Language ${langData.code} already exists`);
      }
    }

    console.log('Languages seeded successfully!');

  } catch (error) {
    console.error('Error seeding languages:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedLanguages();
}

module.exports = seedLanguages; 