'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageSEO } from '@/types';

export default function PageSEOManagement() {
  const [pagesSEO, setPagesSEO] = useState<PageSEO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPagesSEO();
  }, []);

  const fetchPagesSEO = async () => {
    try {
      const response = await fetch('/api/admin/page-seo');
      const result = await response.json();
      
      if (result.success) {
        setPagesSEO(result.data);
      }
    } catch (error) {
      console.error('Error fetching pages SEO:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (pageKey: string) => {
    if (!confirm('Bu sayfa SEO ayarlarını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/page-seo/${pageKey}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPagesSEO(pagesSEO.filter(p => p.pageKey !== pageKey));
      } else {
        alert('Silme işlemi başarısız: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting page SEO:', error);
      alert('Silme işlemi sırasında hata oluştu');
    }
  };

  const pageDisplayNames: Record<string, string> = {
    'homepage': 'Ana Sayfa',
    'contact': 'İletişim',
    'privacy': 'Gizlilik',
    'terms': 'Kullanım Şartları',
    'about': 'Hakkımızda'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sayfa SEO Yönetimi</h1>
          <p className="text-gray-600">Sayfa meta taglarını ve JSON-LD verilerini yönetin</p>
        </div>
        <Link 
          href="/admin/page-seo/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Yeni Sayfa SEO Ekle
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sayfa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Başlık (TR)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Açıklama (TR)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                JSON-LD
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagesSEO.map((page) => (
              <tr key={page.pageKey} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {pageDisplayNames[page.pageKey] || page.pageKey}
                  </div>
                  <div className="text-sm text-gray-500">{page.pageKey}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {page.title?.en || 'Başlık yok'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {page.description?.en || 'Açıklama yok'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    page.jsonLd ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {page.jsonLd ? 'Var' : 'Yok'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    href={`/admin/page-seo/${page.pageKey}`}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Düzenle
                  </Link>
                  <button
                    onClick={() => deletePage(page.pageKey)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagesSEO.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">Henüz sayfa SEO ayarı eklenmemiş</div>
            <Link 
              href="/admin/page-seo/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              İlk Sayfa SEO Ayarını Ekle
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 