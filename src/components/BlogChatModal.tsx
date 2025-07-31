'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import FullScreenIframe from './FullScreenIframe';

interface BlogChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  appSlug: string;
  locale: string;
}

export default function BlogChatModal({ isOpen, onClose, appName, appSlug, locale }: BlogChatModalProps) {
  const t = useTranslations('startChat');
  const [showIframe, setShowIframe] = useState(false);

  const handleGoToApp = () => {
    // Navigate to the specific app page
    const localizedPath = locale === 'en' ? `/apps/${appSlug}.html` : `/${locale}/apps/${appSlug}.html`;
    window.location.href = localizedPath;
  };

  const handleStartChat = () => {
    setShowIframe(true);
    // Don't close the modal immediately, let the iframe show
  };

  const handleCloseIframe = () => {
    setShowIframe(false);
  };

  return (
    <>
      {/* Modal - only show when not showing iframe */}
      {isOpen && !showIframe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-auto relative shadow-xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Title with lock icon */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <span className="text-yellow-500 text-xl mr-2">🔒</span>
                <h2 className="text-xl font-bold text-gray-900">
                  {t('readyToChatTitle')}
                </h2>
              </div>
            </div>

            {/* First speech bubble */}
            <div className="relative mb-6">
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 relative">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {t('stayHereText')} <strong>{appName}</strong>, {t('whyNotStayText')}
                </p>
                
                {/* Speech bubble arrow pointing down */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-200"></div>
                </div>
              </div>
              
              {/* Go to app button */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleGoToApp}
                  className="bg-blue-400 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200"
                >
                  {t('goToButton')} {appName}
                </button>
              </div>
            </div>

            {/* Second speech bubble */}
            <div className="relative mb-6">
              {/* Speech bubble arrow pointing up */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-blue-200"></div>
              </div>
              
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {t('orStayHereText')} <strong>{t('startChatText')}</strong>
                </p>
              </div>
            </div>

            {/* Main Start Chat button */}
            <div className="text-center">
              <button
                onClick={handleStartChat}
                className="relative bg-gradient-to-r from-pink-500 to-rose-400 text-white px-8 py-2 rounded-full font-semibold text-lg 
                         transition-all duration-700 ease-out
                         transform hover:scale-110 hover:-translate-y-1
                         shadow-lg hover:shadow-2xl hover:shadow-pink-500/30
                         border-2 border-transparent hover:border-white/20
                         animate-[gentleFloat_4s_ease-in-out_infinite]
                         overflow-hidden
                         before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                         before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000
                         after:absolute after:inset-0 after:bg-gradient-to-r after:from-pink-300/30 after:to-rose-400/30
                         after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300"
              >
                {t('startChatButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Iframe - always render, controlled by isOpen prop */}
      <FullScreenIframe
        isOpen={showIframe}
        onClose={handleCloseIframe}
        src="https://ftf.live/app?tc=unWPm0"
      />
    </>
  );
} 
