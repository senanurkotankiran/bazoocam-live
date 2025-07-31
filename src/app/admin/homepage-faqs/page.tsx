'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HomepageFAQ } from '@/types';

const DEFAULT_LANGUAGES = ['en', 'tr', 'fr', 'es', 'de', 'it'];

export default function HomepageFAQsPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<HomepageFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<HomepageFAQ | null>(null);

  const [formData, setFormData] = useState({
    question: {} as Record<string, string>,
    answer: {} as Record<string, string>,
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

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
      setFormData({
        question: { ...faq.question },
        answer: { ...faq.answer },
        order: faq.order,
        isActive: faq.isActive
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: {},
        answer: {},
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
    setFormData({
      question: {},
      answer: {},
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Homepage FAQs</h1>
              <button
                onClick={() => handleOpenModal()}
                className="btn btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add FAQ
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {faqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No FAQs found. Create your first FAQ!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {faq.question['en'] || Object.values(faq.question)[0] || 'No question'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {faq.answer['en'] || Object.values(faq.answer)[0] || 'No answer'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Order: {faq.order}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            faq.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {faq.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleOpenModal(faq)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq._id!)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className="input"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {DEFAULT_LANGUAGES.map((lang) => (
                <div key={lang} className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 uppercase">{lang}</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question
                    </label>
                    <input
                      type="text"
                      value={formData.question[lang] || ''}
                      onChange={(e) => updateFormField('question', lang, e.target.value)}
                      className="input"
                      placeholder={`Question in ${lang.toUpperCase()}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer
                    </label>
                    <textarea
                      value={formData.answer[lang] || ''}
                      onChange={(e) => updateFormField('answer', lang, e.target.value)}
                      className="input min-h-[100px]"
                      placeholder={`Answer in ${lang.toUpperCase()}`}
                      rows={4}
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : (editingFaq ? 'Update FAQ' : 'Create FAQ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 