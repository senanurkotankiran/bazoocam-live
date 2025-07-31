'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import FullScreenIframe from './FullScreenIframe';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  appSlug: string;
  locale: string;
}

export default function ChatModal({ isOpen, onClose, appName, appSlug, locale }: ChatModalProps) {
  const t = useTranslations('startChat');
  const [showIframe, setShowIframe] = useState(false);

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
          <div className="bg-white rounded-3xl p-8 max-w-md mx-auto relative shadow-2xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10 "
            >
              ×
            </button>
            
            {/* Header with lock icon and title */}
            <div className="flex items-center mb-6">
              <span className="text-amber-400 text-xl mr-3">🔒</span>
              <h2 className="text-xl font-bold text-gray-900">
                {t('readyToChatTitle')}
              </h2>
            </div>

            {/* Body text */}
            <div className="mb-8 text-center">
              <p className="text-gray-700 text-base mb-1">
                {t('usersOnlineText')}
              </p>
              <p className="text-gray-700 text-base">
                {t('startVideoCallText')}
              </p>
            </div>

            {/* Main action button */}
            <div className="text-center">
              <button
                onClick={handleStartChat}
                className="relative bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 
                         text-white px-6 py-3 rounded-full font-semibold text-md 
                         transition-all duration-300 transform hover:scale-105 
                         shadow-lg hover:shadow-xl w-3/4 
                         animate-pulse hover:animate-none
                         overflow-hidden
                         before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                         before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000
                         after:absolute after:inset-0 after:bg-gradient-to-r after:from-pink-300/30 after:to-rose-400/30
                         after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="animate-bounce">🎥</span>
                  {t('yesImReadyButton')}
                </span>
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            
            @keyframes gentlePulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
            
            @keyframes buttonGlow {
              0%, 100% { box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3); }
              50% { box-shadow: 0 10px 35px rgba(236, 72, 153, 0.5); }
            }
          `}</style>
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