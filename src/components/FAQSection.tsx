'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

interface FAQSectionProps {
  faqs: Array<{
    question: Record<string, string> | string;
    answer: Record<string, string> | string;
    order?: number;
    isActive?: boolean;
  }>;
  locale: string;
}

export default function FAQSection({ faqs, locale }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0])); // First item open by default
  const t = useTranslations('post');

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h1 className="text-xl font-bold mb-4">{t('faqsTitle')}</h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const question = typeof faq.question === 'string' 
            ? faq.question 
            : (faq.question[locale] || faq.question['en'] || '');
          const answer = typeof faq.answer === 'string' 
            ? faq.answer 
            : (faq.answer[locale] || faq.answer['en'] || '');
          const isOpen = openItems.has(index);

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-3 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
              >
                <span className="font-medium text-gray-900">{question}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    isOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              
              {isOpen && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div
                    className="text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: answer }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
} 