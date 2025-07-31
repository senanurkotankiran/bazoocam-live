'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchActiveLanguageCodes } from '@/lib/clientLanguages';

const defaultJsonLdTemplates = {
  homepage: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bazoocam Live",
    "url": "https://www.bazoocam.live",
    "description": "En iyi video sohbet uygulamalarını keşfedin",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.bazoocam.live/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  contact: {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "İletişim - Bazoocam Live",
    "url": "https://www.bazoocam.live/contact",
    "description": "Bizimle iletişime geçin"
  },
  privacy: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Gizlilik Politikası - Bazoocam Live",
    "url": "https://www.bazoocam.live/privacy",
    "description": "Gizlilik politikamızı okuyun"
  }
};

export default function NewPageSEO() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [supportedLocales, setSupportedLocales] = useState<string[]>(['en']);
  const [formData, setFormData] = useState({
    pageKey: '',
    title: {} as Record<string, string>,
    description: {} as Record<string, string>,
    keywords: {} as Record<string, string>,
    jsonLd: '',
    canonical: '',
    robots: 'index, follow'
  });

  useEffect(() => {
    fetchSupportedLanguages();
  }, []);

  const fetchSupportedLanguages = async () => {
    try {
      const languages = await fetchActiveLanguageCodes();
      setSupportedLocales(languages);
      
      // Initialize form data for all languages
      const initialData = {
        title: Object.fromEntries(languages.map(locale => [locale, ''])),
        description: Object.fromEntries(languages.map(locale => [locale, ''])),
        keywords: Object.fromEntries(languages.map(locale => [locale, '']))
      };
      
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    } catch (error) {
      console.error('Error fetching supported languages:', error);
      // Fallback to default languages
      setSupportedLocales(['en', 'fr', 'es', 'it']);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocaleChange = (field: string, locale: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field as keyof typeof prev] as Record<string, string>),
        [locale]: value
      }
    }));
  };

  const loadJsonLdTemplate = (pageKey: string) => {
    const template = defaultJsonLdTemplates[pageKey as keyof typeof defaultJsonLdTemplates];
    if (template) {
      setFormData(prev => ({
        ...prev,
        jsonLd: JSON.stringify(template, null, 2)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        jsonLd: formData.jsonLd ? JSON.parse(formData.jsonLd) : null
      };

      const response = await fetch('/api/admin/page-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/page-seo');
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating page SEO:', error);
      alert('Kaydetme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const localeNames = {
    en: 'English',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano'
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/admin" className="hover:text-primary-600">Admin</Link>
          <span>/</span>
          <Link href="/admin/page-seo" className="hover:text-primary-600">Sayfa SEO</Link>
          <span>/</span>
          <span>Yeni</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Yeni Sayfa SEO Ekle</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayfa Anahtarı *
              </label>
              <select
                value={formData.pageKey}
                onChange={(e) => {
                  handleInputChange('pageKey', e.target.value);
                  loadJsonLdTemplate(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Sayfa seçin...</option>
                <option value="homepage">Ana Sayfa</option>
                <option value="contact">İletişim</option>
                <option value="privacy">Gizlilik</option>
                <option value="terms">Kullanım Şartları</option>
                <option value="about">Hakkımızda</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={formData.canonical}
                  onChange={(e) => handleInputChange('canonical', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://www.bazoocam.live/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robots
                </label>
                <select
                  value={formData.robots}
                  onChange={(e) => handleInputChange('robots', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Çok Dilli İçerik</h2>
          
          {supportedLocales.map(locale => (
            <div key={locale} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">
                {locale.toUpperCase()} - {localeNames[locale as keyof typeof localeNames] || locale}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title[locale] || ''}
                    onChange={(e) => handleLocaleChange('title', locale, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={formData.description[locale] || ''}
                    onChange={(e) => handleLocaleChange('description', locale, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anahtar Kelimeler
                  </label>
                  <input
                    type="text"
                    value={formData.keywords[locale] || ''}
                    onChange={(e) => handleLocaleChange('keywords', locale, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="video chat, live chat, webcam"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">JSON-LD Structured Data</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON-LD (Schema.org)
            </label>
            <textarea
              value={formData.jsonLd}
              onChange={(e) => handleInputChange('jsonLd', e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="JSON-LD structured data..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Sayfa seçildiğinde otomatik şablon yüklenecektir. JSON formatında olmalıdır.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/page-seo"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
} 