'use client';

import { useEffect } from 'react';

interface FullScreenIframeProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
}

export default function FullScreenIframe({ isOpen, onClose, src }: FullScreenIframeProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when iframe is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when iframe is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore body scroll
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Only render iframe when isOpen is true
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        ×
      </button>
      
      {/* Full screen iframe - only loads when isOpen is true */}
      <iframe
        src={src}
        allow="camera; microphone; geolocation; autoplay; encrypted-media"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: 1
        }}
        title="FTF Live Chat"
      />
    </div>
  );
} 