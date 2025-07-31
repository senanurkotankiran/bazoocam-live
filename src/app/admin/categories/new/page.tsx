'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchActiveLanguageCodes } from '@/lib/clientLanguages';

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [supportedLocales, setSupportedLocales] = useState<string[]>(['en']);
  const [formData, setFormData] = useState({
    slug: '',
    name: {} as Record<string, string>,
    description: {} as Record<string, string>
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
        name: Object.fromEntries(languages.map(locale => [locale, ''])),
        description: Object.fromEntries(languages.map(locale => [locale, '']))
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

  const generateSlugFromName = () => {
    const name = formData.name.en || formData.name.fr || formData.name.es || formData.name.it;
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/categories');
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating category:', error);
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
          <Link href="/admin/categories" className="hover:text-primary-600">Kategoriler</Link>
          <span>/</span>
          <span>Yeni</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Yeni Kategori Ekle</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <button
                  type="button"
                  onClick={generateSlugFromName}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600 hover:bg-gray-200"
                >
                  Generate
                </button>
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
                    Kategori Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name[locale] || ''}
                    onChange={(e) => handleLocaleChange('name', locale, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required={locale === 'en'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description[locale] || ''}
                    onChange={(e) => handleLocaleChange('description', locale, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/categories"
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