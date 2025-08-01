'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HomepageFAQ } from '@/types';
import { fetchActiveLanguages, Locale } from '@/lib/clientLanguages';

export default function HomepageFAQsPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<HomepageFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<HomepageFAQ | null>(null);
  const [supportedLocales, setSupportedLocales] = useState<Locale[]>([]);

  const [formData, setFormData] = useState({
    question: {} as Record<string, string>,
    answer: {} as Record<string, string>,
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchFAQs();
    fetchSupportedLanguages();
  }, []);

  const fetchSupportedLanguages = async () => {
    try {
      const languages = await fetchActiveLanguages();
      setSupportedLocales(languages);
      
      // Initialize form data for all languages
      const initialData = {
        question: Object.fromEntries(languages.map(lang => [lang.locale, ''])),
        answer: Object.fromEntries(languages.map(lang => [lang.locale, '']))
      };
      
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    } catch (error) {
      console.error('Error fetching supported languages:', error);
      // Fallback to default languages
      const fallbackLanguages: Locale[] = [
        { locale: 'en', name: 'English', flag: '🇺🇸' },
        { locale: 'fr', name: 'Français', flag: '🇫🇷' },
        { locale: 'es', name: 'Español', flag: '🇪🇸' },
        { locale: 'it', name: 'Italiano', flag: '🇮🇹' },
      ];
      setSupportedLocales(fallbackLanguages);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/admin/homepage-faqs');
      const data = await response.json();
      
      if (data.success) {
        setFaqs(data.data);
      } else {
        setError('Failed to fetch FAQs');
      }
    } catch (error) {
      setError('Error fetching FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingFaq 
        ? `/api/admin/homepage-faqs/${editingFaq._id}`
        : '/api/admin/homepage-faqs';
      
      const method = editingFaq ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchFAQs();
        handleCloseModal();
      } else {
        setError(data.error || 'Failed to save FAQ');
      }
    } catch (error) {
      setError('Error saving FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`/api/admin/homepage-faqs/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchFAQs();
      } else {
        setError(data.error || 'Failed to delete FAQ');
      }
    } catch (error) {
      setError('Error deleting FAQ');
    }
  };

  const handleOpenModal = (faq?: HomepageFAQ) => {
    if (faq) {
      setEditingFaq(faq);
      // Ensure all active languages are present in the form data
      const questionData = { ...faq.question };
      const answerData = { ...faq.answer };
      
      // Add missing languages with empty strings
      supportedLocales.forEach(lang => {
        if (!questionData[lang.locale]) questionData[lang.locale] = '';
        if (!answerData[lang.locale]) answerData[lang.locale] = '';
      });
      
      setFormData({
        question: questionData,
        answer: answerData,
        order: faq.order,
        isActive: faq.isActive
      });
    } else {
      setEditingFaq(null);
      // Initialize with empty strings for all active languages
      const questionData = Object.fromEntries(supportedLocales.map(locale => [locale.locale, '']));
      const answerData = Object.fromEntries(supportedLocales.map(locale => [locale.locale, '']));
      
      setFormData({
        question: questionData,
        answer: answerData,
        order: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
    // Initialize with empty strings for all active languages
    const questionData = Object.fromEntries(supportedLocales.map(locale => [locale.locale, '']));
    const answerData = Object.fromEntries(supportedLocales.map(locale => [locale.locale, '']));
    
    setFormData({
      question: questionData,
      answer: answerData,
      order: 0,
      isActive: true
    });
    setError('');
  };

  const updateFormField = (field: 'question' | 'answer', language: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
  };

  if (loading && !isModalOpen) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Homepage FAQs</h1>
              <p className="text-gray-600 mt-1">Manage frequently asked questions</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add FAQ
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* FAQs List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No FAQs found</p>
              <button
                onClick={() => handleOpenModal()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Create your first FAQ
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {faqs.map((faq, index) => (
                <div key={faq._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                        <h3 className="text-lg font-medium text-gray-900">
                          {faq.question['en'] || Object.values(faq.question)[0] || 'No question'}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {faq.answer['en'] || Object.values(faq.answer)[0] || 'No answer'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Order: {faq.order}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          faq.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => handleOpenModal(faq)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Edit FAQ"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq._id!)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete FAQ"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.isActive.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Language Sections */}
                <div className="space-y-4">
                  {supportedLocales.map((lang) => (
                    <div key={lang.locale} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">{lang.flag}</span>
                        <h3 className="font-medium text-gray-900">{lang.name}</h3>
                        <span className="text-sm text-gray-500">({lang.locale.toUpperCase()})</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={formData.question[lang.locale] || ''}
                            onChange={(e) => updateFormField('question', lang.locale, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                            placeholder={`Question in ${lang.name}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Answer
                          </label>
                          <textarea
                            value={formData.answer[lang.locale] || ''}
                            onChange={(e) => updateFormField('answer', lang.locale, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-vertical"
                            placeholder={`Answer in ${lang.name}`}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Saving...' : (editingFaq ? 'Update' : 'Create')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 