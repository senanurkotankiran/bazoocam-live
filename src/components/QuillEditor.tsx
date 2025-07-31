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
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
        className="bg-white"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
} 