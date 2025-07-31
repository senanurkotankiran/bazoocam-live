'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageSEO } from '@/types';
import { fetchActiveLanguageCodes } from '@/lib/clientLanguages';

interface EditPageSEOProps {
  params: {
    pageKey: string;
  };
}

export default function EditPageSEO({ params }: EditPageSEOProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [supportedLocales, setSupportedLocales] = useState<string[]>(['en']);
  const [formData, setFormData] = useState({
    pageKey: params.pageKey,
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

      // Fetch page SEO data after languages are loaded
      fetchPageSEO();
    } catch (error) {
      console.error('Error fetching supported languages:', error);
      // Fallback to default languages
      setSupportedLocales(['en', 'fr', 'es', 'it']);
      fetchPageSEO();
    }
  };

  const fetchPageSEO = async () => {
    try {
      const response = await fetch(`/api/admin/page-seo/${params.pageKey}`);
      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        setFormData(prev => ({
          pageKey: data.pageKey,
          title: data.title || Object.fromEntries(supportedLocales.map(locale => [locale, ''])),
          description: data.description || Object.fromEntries(supportedLocales.map(locale => [locale, ''])),
          keywords: data.keywords || Object.fromEntries(supportedLocales.map(locale => [locale, ''])),
          jsonLd: data.jsonLd ? JSON.stringify(data.jsonLd, null, 2) : '',
          canonical: data.canonical || '',
          robots: data.robots || 'index, follow'
        }));
      }
    } catch (error) {
      console.error('Error fetching page SEO:', error);
    } finally {
      setFetching(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        jsonLd: formData.jsonLd ? JSON.parse(formData.jsonLd) : null
      };

      const response = await fetch(`/api/admin/page-seo/${params.pageKey}`, {
        method: 'PUT',
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
      console.error('Error updating page SEO:', error);
      alert('Güncelleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const pageDisplayNames: Record<string, string> = {
    'homepage': 'Ana Sayfa',
    'contact': 'İletişim',
    'privacy': 'Gizlilik',
    'terms': 'Kullanım Şartları',
    'about': 'Hakkımızda'
  };

  const localeNames = {
    en: 'English',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano'
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/admin" className="hover:text-primary-600">Admin</Link>
          <span>/</span>
          <Link href="/admin/page-seo" className="hover:text-primary-600">Sayfa SEO</Link>
          <span>/</span>
          <span>{pageDisplayNames[params.pageKey] || params.pageKey}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {pageDisplayNames[params.pageKey] || params.pageKey} SEO Düzenle
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayfa Anahtarı
              </label>
              <input
                type="text"
                value={formData.pageKey}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
              />
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
              JSON formatında olmalıdır.
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
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </form>
    </div>
  );
} 