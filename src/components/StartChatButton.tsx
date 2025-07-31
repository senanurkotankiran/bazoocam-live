'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ChatModal from './ChatModal';

interface StartChatButtonProps {
  appName: string;
  appSlug?: string;
  locale?: string;
}

export default function StartChatButton({ appName, appSlug = '', locale = 'en' }: StartChatButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const t = useTranslations('common');

  const handleStartChat = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="relative group">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"></div>
        
        {/* Main button with magical animations */}
        <button
          onClick={handleStartChat}
          className="relative bg-gradient-to-r from-pink-500 to-rose-400 text-white px-8 py-4 rounded-full font-semibold text-lg 
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
          <span className="relative z-10 flex items-center gap-2">
            <span className="animate-[gentleSparkle_3s_ease-in-out_infinite]">🎥</span>
            {t('startChat')} 
          </span>
        </button>
        
   
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={showModal}
        onClose={handleCloseModal}
        appName={appName}
        appSlug={appSlug}
        locale={locale}
      />

      <style jsx>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.01); }
        }
        
     
        
        @keyframes gentleSparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(1.1) rotate(90deg); }
        }
        
      
      `}</style>
    </>
  );
} 