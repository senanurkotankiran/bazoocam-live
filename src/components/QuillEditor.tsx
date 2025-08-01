'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with error handling
const ReactQuill = dynamic(() => {
  return import('react-quill').then((mod) => {
    // Register Quill modules on client side
    if (typeof window !== 'undefined') {
      try {
        const Quill = require('quill');
        const QuillResizeImage = require('quill-resize-image');
        Quill.register('modules/resize', QuillResizeImage);
        
        // Link modülünü özelleştir - target ve rel özelliklerini kaldır
        const Link = Quill.import('formats/link');
        class CustomLink extends Link {
          static create(value: string) {
            const node = super.create(value);
            // target ve rel özelliklerini kaldır
            node.removeAttribute('target');
            node.removeAttribute('rel');
            return node;
          }
        }
        Quill.register('formats/link', CustomLink, true);
      } catch (error) {
        console.warn('Quill modules registration failed:', error);
      }
    }
    return mod.default || mod;
  });
}, { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded flex items-center justify-center">
    <div className="text-gray-500">Editor yükleniyor...</div>
  </div>
});

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function QuillEditor({ 
  value, 
  onChange, 
  placeholder = "İçerik yazın...",
  className = "" 
}: QuillEditorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mevcut içerikteki linklerden target ve rel özelliklerini temizle
  const cleanLinks = (content: string) => {
    // Server-side ve client-side'da çalışacak regex tabanlı çözüm
    return content.replace(
      /<a([^>]*?)>/gi,
      (match, attributes) => {
        // target ve rel özelliklerini kaldır
        let cleanedAttributes = attributes
          .replace(/\s*target\s*=\s*["'][^"']*["']/gi, '') // target="..." veya target='...'
          .replace(/\s*rel\s*=\s*["'][^"']*["']/gi, ''); // rel="..." veya rel='...'
        
        return `<a${cleanedAttributes}>`;
      }
    );
  };

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    resize: {
      locale: {}
    }
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'link', 'image', 'align', 'code-block'
  ];

  // İçerik değiştiğinde linkleri temizle
  const handleChange = (content: string) => {
    const cleanedContent = cleanLinks(content);
    onChange(cleanedContent);
  };

  if (!isClient) {
    return (
      <div className={`h-64 bg-gray-100 animate-pulse rounded flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Editor yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactQuill
        value={value}
        onChange={handleChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
        className="bg-white"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
} 
