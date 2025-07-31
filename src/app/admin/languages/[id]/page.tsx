'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ILanguage } from '@/models/Language';

interface EditLanguageProps {
  params: { id: string };
}

export default function EditLanguagePage({ params }: EditLanguageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<ILanguage>({
    code: '',
    name: '',
    nativeName: '',
    flag: '',
    isActive: true,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  useEffect(() => {
    fetchLanguage();
  }, []);

  const fetchLanguage = async () => {
    try {
      const response = await fetch(`/api/admin/languages/${params.id}`);
      const result = await response.json();
      if (result.success) {
        setFormData(result.data);
      } else {
        alert('Error: ' + result.error);
        router.push('/admin/languages');
      }
    } catch (error) {
      console.error('Error fetching language:', error);
      alert('Error occurred while fetching language');
      router.push('/admin/languages');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/languages/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert('Language updated successfully! Please restart the application for full effect.');
        router.push('/admin/languages');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      alert('Error occurred while updating language');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Language</h1>
            <p className="text-gray-600">Update language settings</p>
          </div>
          <Link
            href="/admin/languages"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Languages
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Language Details */}
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
                onChange={(e) => handleInputChange('code', e.target.value.toLowerCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., en, fr, de-DE"
                required
                pattern="[a-z]{2,5}(-[A-Z]{2})?"
                title="Use 2-5 lowercase letters, optionally followed by hyphen and 2 uppercase letters"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use standard language codes (e.g., 'en', 'fr', 'de-DE')
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., English, French, German"
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
                onChange={(e) => handleInputChange('nativeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., English, Français, Deutsch"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                How the language name appears in that language
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flag Emoji *
              </label>
              <input
                type="text"
                value={formData.flag}
                onChange={(e) => handleInputChange('flag', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 🇺🇸, 🇫🇷, 🇩🇪"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Flag emoji or any symbol to represent the language
              </p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active Language
              </label>
              <p className="ml-2 text-xs text-gray-500">
                (Language will be available on the frontend)
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                Set as Default Language
              </label>
              <p className="ml-2 text-xs text-gray-500">
                (This will be the fallback language)
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/languages"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Language'}
          </button>
        </div>
      </form>

      {/* Info */}
      {formData.isDefault && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Default Language
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This is the default language. It cannot be deleted and will be used as fallback.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 