'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Locale } from '@/types';

export default function Navigation({ activeLanguages }: { activeLanguages: Locale[] }) {
  const t = useTranslations('navigation');
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string || 'en';

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-dropdown')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const getLocalizedPath = (path: string) => {
    if (locale === 'en') {
      return path;
    }
    return `/${locale}${path}`;
  };

  const handleLanguageChange = (newLocale: string) => {
    // Get current pathname from next/navigation
    let currentPath = pathname;
    
    // Remove current locale prefix if it exists
    const supportedLocaleCodes = activeLanguages.map(l => l.locale);
    let pathWithoutLocale = currentPath;
    
    // Check if path starts with a locale
    for (const localeCode of supportedLocaleCodes) {
      if (currentPath.startsWith(`/${localeCode}/`)) {
        pathWithoutLocale = currentPath.replace(`/${localeCode}`, '');
        break;
      } else if (currentPath === `/${localeCode}`) {
        pathWithoutLocale = '/';
        break;
      }
    }
    
    // If no locale prefix found, it means we're on the default (en) locale
    if (pathWithoutLocale === currentPath && currentPath !== '/') {
      pathWithoutLocale = currentPath;
    }
    
    // Construct new path
    let newPath = '';
    if (newLocale === 'en') {
      // English doesn't need prefix
      newPath = pathWithoutLocale === '/' ? '/' : pathWithoutLocale;
    } else {
      // Other languages need prefix
      newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    }
    
    // Navigate to new path
    window.location.href = newPath;
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-blue-400 shadow-lg antialiased">
      <div className="container">
        <div className="flex justify-between items-center py-6">
          <Link href={getLocalizedPath('/')} className="text-2xl font-bold text-white">
            Bazoocam Live
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href={getLocalizedPath('/')} className="text-white ">
              {t('home')}
            </Link>
            <Link href={getLocalizedPath('/apps/')} className="text-white ">
              {t('apps')}
            </Link>
            <Link href={getLocalizedPath('/privacy.html')} className="text-white ">
              {t('privacy')}
            </Link>
            <Link href={getLocalizedPath('/contact.html')} className="text-white ">
              {t('contact')}
            </Link>
          </div>

          <div className="relative language-dropdown">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors"
            >
              <span>{locale.toUpperCase()}</span>
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

         

            { dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                {activeLanguages.map((lang) => (
                  <button
                    key={lang.locale}
                    onClick={() => handleLanguageChange(lang.locale)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      lang.locale === locale ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 