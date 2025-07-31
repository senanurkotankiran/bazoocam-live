'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ILanguage } from '@/models/Language';

export default function LanguagesManagement() {
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/admin/languages');
      const result = await response.json();
      if (result.success) {
        setLanguages(result.data);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/languages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      const result = await response.json();
      
      if (result.success) {
        setLanguages(languages.map(lang => 
          lang._id === id 
            ? { ...lang, isActive: !isActive }
            : lang
        ));
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling language:', error);
      alert('Error occurred while updating language');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/languages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isDefault: true })
      });

      const result = await response.json();
      
      if (result.success) {
        setLanguages(languages.map(lang => ({
          ...lang,
          isDefault: lang._id === id
        })));
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error setting default language:', error);
      alert('Error occurred while setting default language');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete the language "${code}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/languages/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setLanguages(languages.filter(lang => lang._id !== id));
        alert('Language deleted successfully. Please restart the application for full effect.');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting language:', error);
      alert('Error occurred while deleting language');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Language Management</h1>
          <p className="text-gray-600">Manage supported languages and translations</p>
        </div>
        <Link
          href="/admin/languages/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Add New Language
        </Link>
      </div>

      {/* Languages Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Language
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Native Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Default
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {languages.map((language) => (
              <tr key={language._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{language.flag}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {language.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {language.code}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {language.nativeName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(language._id!, language.isActive)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      language.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {language.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {language.isDefault ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(language._id!)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Set Default
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/languages/${language._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/translations/${language.code}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Translations
                    </Link>
                    {!language.isDefault && (
                      <button
                        onClick={() => handleDelete(language._id!, language.code)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {languages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No languages found</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Language Management Notes
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Adding a new language automatically creates translation files and updates configuration</li>
                <li>Each language needs a unique 2-5 character code (e.g., 'en', 'fr', 'de-DE')</li>
                <li>The default language is used when no specific language is detected</li>
                <li>Inactive languages won't appear in the frontend but data is preserved</li>
                <li>After making changes, restart the application for full effect</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 