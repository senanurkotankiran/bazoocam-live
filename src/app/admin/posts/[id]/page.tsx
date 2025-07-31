'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchActiveLanguageCodes } from '@/lib/clientLanguages';
import QuillEditor from '@/components/QuillEditor';

import 'react-quill/dist/quill.snow.css';

interface Category {
  _id: string;
  name: Record<string, string>;
  slug: string;
}

interface EditPostProps {
  params: {
    id: string;
  };
}

export default function EditPostPage({ params }: EditPostProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [supportedLocales, setSupportedLocales] = useState<string[]>(['en']);
  const [activeTab, setActiveTab] = useState('en'); // Active language tab
  
  // Add upload states
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    slug: '',
    title: {} as Record<string, string>,
    content: {} as Record<string, string>,
    description: {} as Record<string, string>,
    imageUrl: '',
    categoryId: '',
    status: 'draft' as 'draft' | 'published',
    rating: {
      stars: 5,
      votes: 0
    },
    faqs: [] as Array<{
      question: Record<string, string>;
      answer: Record<string, string>;
    }>,
    alternatives: [] as Array<{
      name: Record<string, string>;
      description: Record<string, string>;
    }>,
    alternativesDescription: {} as Record<string, string>,
    prosAndCons: {
      pros: {} as Record<string, string>,
      cons: {} as Record<string, string>
    }
  });

  useEffect(() => {
    fetchPost();
    fetchCategories();
    fetchSupportedLanguages();
  }, []);

  const fetchSupportedLanguages = async () => {
    try {
      const languages = await fetchActiveLanguageCodes();
      setSupportedLocales(languages);
      
      // Initialize form data for all languages if needed
      setFormData(prev => {
        const newFormData = { ...prev };
        
        // Ensure all language keys exist
        languages.forEach(locale => {
          if (!newFormData.title[locale]) newFormData.title[locale] = '';
          if (!newFormData.content[locale]) newFormData.content[locale] = '';
          if (!newFormData.description[locale]) newFormData.description[locale] = '';
          if (!newFormData.prosAndCons.pros[locale]) newFormData.prosAndCons.pros[locale] = '';
          if (!newFormData.prosAndCons.cons[locale]) newFormData.prosAndCons.cons[locale] = '';
        });
        
        return newFormData;
      });
    } catch (error) {
      console.error('Error fetching supported languages:', error);
    }
  };

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/posts/${params.id}`);
      const result = await response.json();
      
      if (result.success) {
        const post = result.data;
        
        // Ensure alternatives have the correct structure
        const processedAlternatives = (post.alternatives || []).map((alt: any) => ({
          name: alt.name || {},
          description: alt.description || {}
        }));

        setFormData({
          slug: post.slug || '',
          title: post.title || {},
          content: post.content || {},
          description: post.description || {},
          imageUrl: post.imageUrl || '',
          categoryId: post.categoryId || '',
          status: post.status || 'draft',
          rating: post.rating || { stars: 5, votes: 0 },
          faqs: post.faqs || [],
          alternatives: processedAlternatives,
          alternativesDescription: post.alternativesDescription || {},
          prosAndCons: post.prosAndCons || {
            pros: {},
            cons: {}
          }
        });
        // Set image preview if image exists
        setImagePreview(post.imageUrl || '');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setFetching(false);
    }
  }, [params.id]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleLocaleChange = useCallback((field: string, locale: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof typeof prev] as Record<string, string>,
        [locale]: value
      }
    }));
  }, []);

  const generateSlugFromTitle = useCallback(() => {
    const title = formData.title.en || formData.title.fr || formData.title.es || formData.title.it;
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // FAQ handlers
  const addFAQ = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, {
        question: Object.fromEntries(supportedLocales.map(locale => [locale, ''])),
        answer: Object.fromEntries(supportedLocales.map(locale => [locale, '']))
      }]
    }));
  }, []);

  const removeFAQ = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  }, []);

  const handleFAQChange = useCallback((index: number, field: 'question' | 'answer', locale: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index 
          ? {
              ...faq,
              [field]: {
                ...faq[field],
                [locale]: value
              }
            }
          : faq
      )
    }));
  }, []);

  // Pros & Cons handlers (simplified)
  const handleProsConsChange = useCallback((type: 'pros' | 'cons', locale: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      prosAndCons: {
        ...prev.prosAndCons,
        [type]: {
          ...prev.prosAndCons[type],
          [locale]: value
        }
      }
    }));
  }, []);

  // Rating handlers
  const handleRatingChange = useCallback((field: 'stars' | 'votes', value: string) => {
    const numValue = parseInt(value) || 0;
    
    // Stars validation: 1-5 arası
    if (field === 'stars') {
      const clampedValue = Math.max(1, Math.min(5, numValue));
      setFormData(prev => ({
        ...prev,
        rating: {
          ...prev.rating,
          [field]: clampedValue
        }
      }));
    } else {
      // Votes validation: 0 ve üzeri
      const clampedValue = Math.max(0, numValue);
      setFormData(prev => ({
        ...prev,
        rating: {
          ...prev.rating,
          [field]: clampedValue
        }
      }));
    }
  }, []);

  // Alternative Apps handlers
  const addAlternative = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      alternatives: [...prev.alternatives, {
        name: Object.fromEntries(supportedLocales.map(locale => [locale, ''])),
        description: Object.fromEntries(supportedLocales.map(locale => [locale, '']))
      }]
    }));
  }, []);

  const removeAlternative = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      alternatives: prev.alternatives.filter((_, i) => i !== index)
    }));
  }, []);

  const handleAlternativeChange = useCallback((index: number, field: 'name' | 'description', locale: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      alternatives: prev.alternatives.map((alt, i) => 
        i === index 
          ? { ...alt, [field]: { ...alt[field], [locale]: value } }
          : alt
      )
    }));
  }, []);

  const handleAlternativeDescriptionChange = useCallback((index: number, locale: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      alternativesDescription: {
        ...prev.alternativesDescription,
        [locale]: value
      }
    }));
  }, []);

  // Add image upload handler
  const handleImageUpload = async (file: File) => {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.data.url
        }));
        setImagePreview(result.data.url);
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate that alternative apps have at least English content
      for (let i = 0; i < formData.alternatives.length; i++) {
        const alternative = formData.alternatives[i];
        if (!alternative.name.en || !alternative.name.en.trim()) {
          alert(`Alternative App #${i + 1} için İngilizce uygulama adı gereklidir.`);
          setLoading(false);
          return;
        }
        if (!alternative.description.en || !alternative.description.en.trim()) {
          alert(`Alternative App #${i + 1} için İngilizce açıklama gereklidir.`);
          setLoading(false);
          return;
        }
      }

      const postData = {
        ...formData,
        meta: {
          title: formData.title,
          description: formData.description,
          keywords: Object.fromEntries(supportedLocales.map(locale => [locale, ''])),
          canonical: ''
        }
      };

      const response = await fetch(`/api/admin/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/posts');
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Güncelleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async () => {
    if (!confirm('Bu post\'u silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${params.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/posts');
      } else {
        alert('Silme işlemi başarısız: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Silme işlemi sırasında hata oluştu');
    }
  };

  const localeNames = useMemo(() => ({
    en: 'English',
    fr: 'Français', 
    es: 'Español',
    it: 'Italiano'
  }), []);

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
          <Link href="/admin/posts" className="hover:text-primary-600">Posts</Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          <button
            onClick={deletePost}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Post
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onClick={generateSlugFromTitle}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600 hover:bg-gray-200"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (İsteğe Bağlı)
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Kategori Seçmeyin (İsteğe Bağlı)</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name.en || category.name.fr || category.name.es || category.name.it}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={uploadLoading}
                    />
                    {uploadLoading && (
                      <div className="text-sm text-blue-600 mt-1">
                        Uploading...
                      </div>
                    )}
                  </div>
                  
                  {/* Preview */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {/* Alternative URL input */}
                  <div className="text-sm text-gray-500">
                    <div className="mb-2">Or use image URL:</div>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        const url = e.target.value;
                        handleInputChange('imageUrl', url);
                        setImagePreview(url);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-language Content with Tabs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Content</h2>
          
          {/* Language Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {supportedLocales.map(locale => (
                <button
                  key={locale}
                  type="button"
                  onClick={() => setActiveTab(locale)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === locale
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {locale.toUpperCase()} - {localeNames[locale as keyof typeof localeNames]}
                </button>
              ))}
            </nav>
          </div>

          {/* Content for Active Tab */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title[activeTab] || ''}
                onChange={(e) => handleLocaleChange('title', activeTab, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required={activeTab === 'en'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description[activeTab] || ''}
                onChange={(e) => handleLocaleChange('description', activeTab, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required={activeTab === 'en'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content * <span className="text-xs text-gray-500">(Resimler sürükle-bırak ile boyutlandırılabilir)</span>
              </label>
              <QuillEditor
                value={formData.content[activeTab] || ''}
                onChange={(value) => handleLocaleChange('content', activeTab, value)}
              />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">FAQ (İsteğe Bağlı)</h2>
            <button
              type="button"
              onClick={addFAQ}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              FAQ Ekle
            </button>
          </div>

          {formData.faqs.map((faq, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">FAQ #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeFAQ(index)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Sil
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {supportedLocales.map(locale => (
                  <div key={locale} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">
                      {locale.toUpperCase()}
                    </h4>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Soru
                      </label>
                      <input
                        type="text"
                        value={faq.question[locale] || ''}
                        onChange={(e) => handleFAQChange(index, 'question', locale, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Cevap
                      </label>
                      <textarea
                        value={faq.answer[locale] || ''}
                        onChange={(e) => handleFAQChange(index, 'answer', locale, e.target.value)}
                        rows={3}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {formData.faqs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Henüz FAQ eklenmemiş. Yukarıdaki "FAQ Ekle" butonuna tıklayarak başlayın.
            </div>
          )}
        </div>

        {/* Rating Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Rating (Değerlendirme)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yıldız Sayısı (1-5)
              </label>
              
              {/* Star Rating Component */}
              <div className="flex items-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange('stars', star.toString())}
                    className={`text-2xl transition-colors ${
                      star <= formData.rating.stars ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating.stars}
                onChange={(e) => handleRatingChange('stars', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="1-5 arası sayı girin"
              />
              <div className="mt-2 text-sm text-gray-500">
                Önizleme: {'⭐'.repeat(formData.rating.stars)}{'☆'.repeat(5 - formData.rating.stars)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oy Sayısı
              </label>
              <input
                type="number"
                min="0"
                value={formData.rating.votes}
                onChange={(e) => handleRatingChange('votes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Oy sayısını girin"
              />
              <div className="mt-2 text-sm text-gray-500">
                Önizleme: Rated: {'⭐'.repeat(formData.rating.stars)}{'☆'.repeat(5 - formData.rating.stars)} ({formData.rating.votes.toLocaleString()} votes)
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Apps Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Alternative Apps (İsteğe Bağlı)</h2>
            <button
              type="button"
              onClick={addAlternative}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Alternative App Ekle
            </button>
          </div>

          {/* General Description for Alternative Apps */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Genel Açıklama</h3>
            <div className="space-y-4">
              {supportedLocales.map(locale => (
                <div key={locale}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale.toUpperCase()} - {localeNames[locale as keyof typeof localeNames]}
                  </label>
                  <QuillEditor
                    value={formData.alternativesDescription[locale] || ''}
                    onChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        alternativesDescription: {
                          ...prev.alternativesDescription,
                          [locale]: value
                        }
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {formData.alternatives.map((alternative, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Alternative App #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeAlternative(index)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Sil
                </button>
              </div>

              <div className="space-y-4">
                {/* App Name in multiple languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Name (Uygulama Adı) *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {supportedLocales.map(locale => (
                      <div key={locale}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {locale.toUpperCase()}{locale === 'en' ? ' *' : ''}
                        </label>
                        <input
                          type="text"
                          value={alternative.name[locale] || ''}
                          onChange={(e) => handleAlternativeChange(index, 'name', locale, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="e.g. Zoom, Skype"
                          required={locale === 'en'}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description in multiple languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (İçerik) *
                  </label>
                  <div className="space-y-4">
                    {supportedLocales.map(locale => (
                      <div key={locale}>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          {locale.toUpperCase()} - {localeNames[locale as keyof typeof localeNames]}{locale === 'en' ? ' *' : ''}
                        </label>
                        <QuillEditor
                          value={alternative.description[locale] || ''}
                          onChange={(value) => handleAlternativeChange(index, 'description', locale, value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {formData.alternatives.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Henüz alternatif uygulama eklenmemiş. Yukarıdaki "Alternative App Ekle" butonuna tıklayarak başlayın.
            </div>
          )}
        </div>

        {/* Pros & Cons Section - Simplified */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Pros & Cons (İsteğe Bağlı)</h2>
          <p className="text-sm text-gray-600 mb-4">Her satıra bir artı/eksi özellik yazın. Boş bırakılabilir.</p>
          
          <div className="space-y-6">
            {supportedLocales.map(locale => (
              <div key={locale} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">
                  {locale.toUpperCase()} - {localeNames[locale as keyof typeof localeNames]}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pros */}
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Pros (Artılar)
                    </label>
                    <textarea
                      value={formData.prosAndCons.pros[locale] || ''}
                      onChange={(e) => handleProsConsChange('pros', locale, e.target.value)}
                      placeholder="- Hızlı performans&#10;- Kolay kullanım&#10;- Ücretsiz"
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Her satıra bir artı özellik yazın
                    </div>
                  </div>

                  {/* Cons */}
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-2">
                      Cons (Eksiler)
                    </label>
                    <textarea
                      value={formData.prosAndCons.cons[locale] || ''}
                      onChange={(e) => handleProsConsChange('cons', locale, e.target.value)}
                      placeholder="- Sınırlı özellikler&#10;- Reklam içeriyor&#10;- Premium gerekli"
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Her satıra bir eksi özellik yazın
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/posts"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  );
} 