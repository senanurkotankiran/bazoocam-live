'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function OnlineCounter() {
  const [isVisible, setIsVisible] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const t = useTranslations('common');

  useEffect(() => {
    // Generate a random user count between 180k and 250k
    const count = Math.floor(Math.random() * (250000 - 180000) + 180000);
    setUserCount(count);

    // Show popup after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Hide popup after 8 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        <span className="font-medium">
          {userCount.toLocaleString()} {t('onlineUsers')}
        </span>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 ml-2"
        >
          ×
        </button>
      </div>
    </div>
  );
} 