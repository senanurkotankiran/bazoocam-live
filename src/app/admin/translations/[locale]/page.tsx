'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TranslationPageProps {
  params: { locale: string };
}

export default function TranslationManagementPage({ params }: TranslationPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [originalTranslations, setOriginalTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchTranslations();
  }, [params.locale]);

  const fetchTranslations = async () => {
    try {
      const response = await fetch(`/api/admin/translations/${params.locale}`);
      const result = await response.json();
      
      if (result.success) {
        setTranslations(result.data);
        setOriginalTranslations(result.data);
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
    }
  };

  const handleTranslationChange = (key: string, value: string, nestedKey?: string) => {
    setTranslations(prev => {
      if (nestedKey) {
        return {
          ...prev,
          [key]: {
            ...prev[key],
            [nestedKey]: value
          }
        };
      } else {
        return {
          ...prev,
          [key]: value
        };
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/translations/${params.locale}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(translations)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Translations saved successfully!');
        setOriginalTranslations(translations);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving translations:', error);
      alert('Error occurred while saving translations');
    } finally {
      setLoading(false);
    }
  };

  const renderTranslationInput = (key: string, value: any, path: string = '') => {
    const fullKey = path ? `${path}.${key}` : key;

    if (typeof value === 'string') {
      return (
        <div key={fullKey} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {fullKey}
          </label>
          <textarea
            value={value}
            onChange={(e) => {
              const keys = fullKey.split('.');
              if (keys.length === 1) {
                handleTranslationChange(keys[0], e.target.value);
              } else {
                handleTranslationChange(keys[0], e.target.value, keys[1]);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            rows={value.includes('\n') ? 4 : 2}
          />
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div key={fullKey} className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 capitalize">
            {key}
          </h3>
          <div className="pl-4 border-l-2 border-gray-200">
            {Object.entries(value).map(([nestedKey, nestedValue]) =>
              renderTranslationInput(nestedKey, nestedValue, fullKey)
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const hasUnsavedChanges = JSON.stringify(translations) !== JSON.stringify(originalTranslations);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Translations - {params.locale.toUpperCase()}
          </h1>
          <p className="text-gray-600">Manage translations for this language</p>
        </div>
        <div className="flex space-x-4">
          <Link
            href="/admin/languages"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Languages
          </Link>
          <button
            onClick={handleSave}
            disabled={loading || !hasUnsavedChanges}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have unsaved changes. Don't forget to save your work!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-6">Edit Translations</h2>
        
        <div className="space-y-6">
          {Object.entries(translations).map(([key, value]) =>
            renderTranslationInput(key, value)
          )}
        </div>

        {Object.keys(translations).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No translations found for this language</p>
          </div>
        )}
      </div>
    </div>
  );
} 