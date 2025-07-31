'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// İngilizce şablondan tüm çeviri anahtarları
const DEFAULT_TRANSLATIONS = {
  "navigation": {
    "home": "Home",
    "apps": "Apps", 
    "privacy": "Privacy",
    "contact": "Contact"
  },
  "common": {
    "readMore": "Read More",
    "startChat": "Start Chat",
    "exploreApps": "Explore Apps",
    "onlineUsers": "Online Users",
    "share": "Share",
    "like": "Like",
    "description": "Description",
    "features": "Features",
    "alternatives": "Alternatives",
    "pros": "Pros",
    "cons": "Cons",
    "faq": "FAQ"
  },
  "home": {
    "title": "Best Video Chat Applications",
    "subtitle": "Discover the best live video chat applications and platforms. Find perfect alternatives to popular chat apps.",
    "latestApps": "Latest Apps",
    "featuredApps": "Featured Apps"
  },
  "contact": {
    "title": "Contact Us",
    "subtitle": "Get in touch with us",
    "formTitle": "Send us a message",
    "name": "Name",
    "email": "Email",
    "subject": "Subject",
    "message": "Message",
    "sendMessage": "Send Message",
    "getInTouch": "Get in Touch",
    "description": "We are here to help and answer any questions you may have. We look forward to hearing from you.",
    "emailLabel": "Email",
    "emailValue": "contact@bazoocam.live",
    "responseTimeLabel": "Response Time",
    "responseTimeValue": "Within 24 hours",
    "supportLabel": "Support",
    "supportValue": "Available worldwide"
  },
  "privacy": {
    "title": "Privacy Policy",
    "subtitle": "Your privacy is important to us",
    "infoCollectTitle": "Information We Collect",
    "infoCollectText": "We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support.",
    "infoUseTitle": "How We Use Your Information",
    "infoUseItem1": "To provide, maintain, and improve our services",
    "infoUseItem2": "To process transactions and send related information",
    "infoUseItem3": "To send technical notices and support messages",
    "infoUseItem4": "To communicate with you about products, services, and events",
    "infoSharingTitle": "Information Sharing",
    "infoSharingText": "We do not sell, trade, or transfer your personal information to third parties without your consent, except as described in this policy.",
    "dataSecurityTitle": "Data Security",
    "dataSecurityText": "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
    "contactTitle": "Contact Us",
    "contactText": "If you have any questions about this Privacy Policy, please contact us at privacy@bazoocam.live.",
    "lastUpdated": "Last updated: December 2024"
  },
  "apps": {
    "title": "Video Chat Applications",
    "subtitle": "Explore all video chat apps",
    "searchPlaceholder": "Search apps...",
    "noResults": "No apps found",
    "loading": "Loading apps..."
  },
  "post": {
    "readTime": "min read",
    "publishedOn": "Published on",
    "updatedOn": "Updated on",
    "author": "Author",
    "category": "Category",
    "tags": "Tags",
    "rating": "Rating",
    "votes": "votes",
    "tableOfContents": "Table of Contents",
    "relatedPosts": "Related Posts",
    "sharePost": "Share this post",
    "topAlternativesTitle": "Top Alternatives to",
    "rated": "Rated:",
    "reviews": "reviews",
    "prosAndConsTitle": "Pros & Cons",
    "alternativeApplicationsTitle": "Alternative Applications",
    "faqsTitle": "FAQs"
  },
  "startChat": {
    "modalTitle": "Start Chatting on",
    "modalDescription": "You're about to be redirected to",
    "modalRedirectText": "to start video chatting with random people from around the world.",
    "continueButton": "Continue to",
    "cancelButton": "Cancel"
  },
  "footer": {
    "about": "About",
    "Other Applications": "Other Applications",
    "legal": "Legal",
    "followUs": "Follow Us",
    "newsletter": "Newsletter",
    "subscribe": "Subscribe",
    "allRightsReserved": "All rights reserved"
  },
  "meta": {
    "defaultTitle": "Bazoocam Live - Best Video Chat Applications",
    "defaultDescription": "Discover the best live video chat applications and platforms. Find perfect alternatives to popular chat apps."
  }
};

// Önceden tanımlanmış dil şablonları
const LANGUAGE_PRESETS = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

// Flatten nested object to dot notation
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = String(value);
      }
    }
  }
  
  return flattened;
}

// Convert flat object back to nested
function unflattenObject(flat: Record<string, string>): any {
  const result: any = {};
  
  for (const key in flat) {
    if (flat.hasOwnProperty(key)) {
      const keys = key.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = flat[key];
    }
  }
  
  return result;
}

export default function NewLanguagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Dil bilgileri
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nativeName: '',
    flag: '',
    isActive: true,
    isDefault: false,
    translations: DEFAULT_TRANSLATIONS
  });

  // Çeviriler (flat format)
  const [translations, setTranslations] = useState<Record<string, string>>(
    flattenObject(DEFAULT_TRANSLATIONS)
  );

  // Hızlı seçim için preset uygula
  const applyPreset = (preset: any) => {
    setFormData({
      ...formData,
      code: preset.code,
      name: preset.name,
      nativeName: preset.nativeName,
      flag: preset.flag
    });
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/languages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/languages');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating language:', error);
      alert('Error occurred while creating language');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/admin" className="hover:text-primary-600">Admin</Link>
          <span>/</span>
          <Link href="/admin/languages" className="hover:text-primary-600">Languages</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Language</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Basic Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('translations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'translations'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Translations
            </button>
          </nav>
        </div>

        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Language Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., tr, fr, es"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Two-letter ISO 639-1 code</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Turkish"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Native Name *
                </label>
                <input
                  type="text"
                  value={formData.nativeName}
                  onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Türkçe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flag Emoji *
                </label>
                <input
                  type="text"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="🇹🇷"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Set as Default</span>
              </label>
            </div>

            {/* Quick Select */}
            <div className="mt-8">
              <h3 className="text-md font-medium text-gray-900 mb-4">Quick Select</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {LANGUAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
                  >
                    <div className="text-2xl mb-1">{preset.flag}</div>
                    <div className="text-xs font-medium">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.nativeName}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Translations Tab */}
        {activeTab === 'translations' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Static Text Translations</h2>
            <p className="text-sm text-gray-600 mb-6">
              Enter translations for all static text that appears on the website. English text is shown for reference.
            </p>
            
            <div className="space-y-6">
              {Object.entries(translations).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {key}
                    </label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                      {value}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Your Translation
                    </label>
                    <input
                      type="text"
                      value={translations[key]}
                      onChange={(e) => setTranslations({ ...translations, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                      placeholder={`Enter ${formData.nativeName || 'translation'} for: ${value}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/languages"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Language'}
          </button>
        </div>
      </form>
    </div>
  );
} 