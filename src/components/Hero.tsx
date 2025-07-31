'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import ChatModal from './ChatModal';

export default function Hero() {
  const t = useTranslations('home');
  const commonT = useTranslations('common');
  const params = useParams();
  const locale = params.locale as string || 'en';
  const [showModal, setShowModal] = useState(false);

  const handleStartChat = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <section className="bg-[#eaf7ff] py-20 antialiased shadow-lg">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-6 text-blue-400">
            {t('title')}
          </h1>
          
          <p className="text-md mb-8 text-black max-w-3xl mx-auto">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-1/2 mx-auto">
            <div className="relative group">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"></div>
              
              {/* Main button with magical animations */}
              <button 
                onClick={handleStartChat}
                className="relative bg-gradient-to-l from-rose-400 to-pink-500 text-white px-6 py-3 rounded-full font-semibold text-lg 
                         transition-all duration-700 ease-out
                         transform hover:scale-110 hover:-translate-y-1
                         shadow-lg hover:shadow-2xl hover:shadow-pink-500/30
                         border-2 border-transparent hover:border-white/20
                         animate-[float_3s_ease-in-out_infinite]
                         overflow-hidden
                         before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                         before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000
                         after:absolute after:inset-0 after:bg-gradient-to-r after:from-pink-300/30 after:to-rose-400/30
                         after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300"
              >
                <span className="relative z-10 flex items-center gap-4 px-3 pr-4 whitespace-nowrap">
                <span className="animate-[gentleSparkle_3s_ease-in-out_infinite] ">🎥</span>

                  {commonT('startChat')}
                </span>
              </button>
              
      
            </div>
          </div>
        </div>
      </section>

      {/* Chat Modal */}
      <ChatModal
        isOpen={showModal}
        onClose={handleCloseModal}
        appName="Bazoocam.live"
        appSlug=""
        locale={locale}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        
        @keyframes gentleSparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(1.1) rotate(90deg); }
        }
        
      `}</style>
    </>
  );
} 