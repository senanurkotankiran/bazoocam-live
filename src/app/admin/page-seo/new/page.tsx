'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchActiveLanguageCodes } from '@/lib/clientLanguages';

const defaultJsonLdTemplates = {
  homepage: {
    en: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bazoocam Live",
      "url": "https://www.bazoocam.live",
      "description": "Discover the best video chat applications and platforms",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.bazoocam.live/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    fr: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bazoocam Live",
      "url": "https://www.bazoocam.live",
      "description": "Découvrez les meilleures applications de chat vidéo",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.bazoocam.live/fr/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    es: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bazoocam Live",
      "url": "https://www.bazoocam.live",
      "description": "Descubre las mejores aplicaciones de chat de vídeo",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.bazoocam.live/es/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    it: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bazoocam Live",
      "url": "https://www.bazoocam.live",
      "description": "Scopri le migliori applicazioni di chat video",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.bazoocam.live/it/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },
  contact: {
    en: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Us - Bazoocam Live",
      "url": "https://www.bazoocam.live/contact",
      "description": "Get in touch with our team for support and inquiries"
    },
    fr: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contactez-nous - Bazoocam Live",
      "url": "https://www.bazoocam.live/fr/contact",
      "description": "Contactez notre équipe pour obtenir du support"
    },
    es: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contáctanos - Bazoocam Live",
      "url": "https://www.bazoocam.live/es/contact",
      "description": "Póngase en contacto con nuestro equipo"
    },
    it: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contattaci - Bazoocam Live",
      "url": "https://www.bazoocam.live/it/contact",
      "description": "Contatta il nostro team per supporto"
    }
  },
  privacy: {
    en: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy - Bazoocam Live",
      "url": "https://www.bazoocam.live/privacy",
      "description": "Read our privacy policy to understand how we protect your data"
    },
    fr: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Politique de Confidentialité - Bazoocam Live",
      "url": "https://www.bazoocam.live/fr/privacy",
      "description": "Lisez notre politique de confidentialité"
    },
    es: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Política de Privacidad - Bazoocam Live",
      "url": "https://www.bazoocam.live/es/privacy",
      "description": "Lee nuestra política de privacidad"
    },
    it: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Politica sulla Privacy - Bazoocam Live",
      "url": "https://www.bazoocam.live/it/privacy",
      "description": "Leggi la nostra politica sulla privacy"
    }
  },
  apps: {
    en: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Video Chat Applications - Bazoocam Live",
      "url": "https://www.bazoocam.live/apps",
      "description": "Explore all available video chat applications and platforms",
      "mainEntity": {
        "@type": "ItemList",
        "name": "Video Chat Applications",
        "description": "A comprehensive list of video chat applications and platforms"
      }
    },
    fr: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Applications de Chat Vidéo - Bazoocam Live",
      "url": "https://www.bazoocam.live/fr/apps",
      "description": "Explorez toutes les applications de chat vidéo disponibles",
      "mainEntity": {
        "@type": "ItemList",
        "name": "Applications de Chat Vidéo",
        "description": "Une liste complète des applications de chat vidéo"
      }
    },
    es: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Aplicaciones de Chat de Vídeo - Bazoocam Live",
      "url": "https://www.bazoocam.live/es/apps",
      "description": "Explora todas las aplicaciones de chat de vídeo disponibles",
      "mainEntity": {
        "@type": "ItemList",
        "name": "Aplicaciones de Chat de Vídeo",
        "description": "Una lista completa de aplicaciones de chat de vídeo"
      }
    },
    it: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Applicazioni di Chat Video - Bazoocam Live",
      "url": "https://www.bazoocam.live/it/apps",
      "description": "Esplora tutte le applicazioni di chat video disponibili",
      "mainEntity": {
        "@type": "ItemList",
        "name": "Applicazioni di Chat Video",
        "description": "Una lista completa delle applicazioni di chat video"
      }
    }
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
    jsonLd: {} as Record<string, string>,
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
        keywords: Object.fromEntries(languages.map(locale => [locale, ''])),
        jsonLd: Object.fromEntries(languages.map(locale => [locale, '']))
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
    const pageTemplates = defaultJsonLdTemplates[pageKey as keyof typeof defaultJsonLdTemplates];
    if (pageTemplates) {
      // Set the template for all supported languages
      const updatedJsonLd: Record<string, string> = {};
      supportedLocales.forEach(lang => {
        const template = (pageTemplates as any)[lang];
        if (template) {
          updatedJsonLd[lang] = JSON.stringify(template, null, 2);
        } else {
          // Fallback to English template if language-specific template doesn't exist
          const fallbackTemplate = (pageTemplates as any)['en'];
          updatedJsonLd[lang] = fallbackTemplate ? JSON.stringify(fallbackTemplate, null, 2) : '';
        }
      });
      
      setFormData(prev => ({
        ...prev,
        jsonLd: updatedJsonLd
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse JSON-LD data for each language
      const parsedJsonLd: Record<string, any> = {};
      for (const [locale, jsonString] of Object.entries(formData.jsonLd)) {
        if (jsonString.trim()) {
          try {
            parsedJsonLd[locale] = JSON.parse(jsonString);
          } catch (error) {
            alert(`${locale.toUpperCase()} dilindeki JSON-LD verisi geçersiz JSON formatında. Lütfen kontrol edin.`);
            setLoading(false);
            return;
          }
        }
      }

      const payload = {
        ...formData,
        jsonLd: parsedJsonLd
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
      alert('Oluşturma sırasında hata oluştu');
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
                  loadJsonLdTemplate(e.target.value); // Default to English for now
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
                <option value="apps">Uygulamalar</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JSON-LD Structured Data
                  </label>
                  <textarea
                    value={formData.jsonLd[locale] || ''}
                    onChange={(e) => handleLocaleChange('jsonLd', locale, e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="JSON-LD structured data..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JSON formatında olmalıdır. Her dil için ayrı JSON-LD verisi ekleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          ))}
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