import { Alternative } from '@/types';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

interface AlternativeAppsProps {
  alternatives: Alternative[] | { name: string; description: string }[];
  alternativesDescription?: Record<string, string> | string;
  locale: string;
}

export default async function AlternativeApps({ alternatives, alternativesDescription, locale }: AlternativeAppsProps) {
  const t = await getTranslations({ locale, namespace: 'post' });
  const generalDescription = typeof alternativesDescription === 'string' 
    ? alternativesDescription 
    : (alternativesDescription?.[locale] || alternativesDescription?.['en'] || '');
  
    function cleanLinksFromHtml(html: string) {
      // Server-side ve client-side'da çalışacak regex tabanlı çözüm
      return html.replace(
        /<a([^>]*?)>/gi,
        (match, attributes) => {
          // target ve rel özelliklerini kaldır
          let cleanedAttributes = attributes
            .replace(/\s*target\s*=\s*["'][^"']*["']/gi, '') // target="..." veya target='...'
            .replace(/\s*rel\s*=\s*["'][^"']*["']/gi, ''); // rel="..." veya rel='...'
          
          return `<a${cleanedAttributes}>`;
        }
      );
    }
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-6">{t('alternativeApplicationsTitle')}</h2>
      
      {/* General Description */}
      {generalDescription && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <div 
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: generalDescription }}
          />
        </div>
      )}
      
      <div className="space-y-6">
        {alternatives.map((app, index) => {
          const appName = typeof app.name === 'string' ? app.name : (app.name[locale] || app.name['en'] || '');
          const description = typeof app.description === 'string' ? app.description : (app.description[locale] || app.description['en'] || '');
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-8">
              <h3 className="text-blue-400 font-semibold text-lg mb-3">
                {appName}
              </h3>
              <div 
                className="prose prose-sm max-w-none text-gray-800 leading-relaxed antialiased"
                dangerouslySetInnerHTML={{ __html: cleanLinksFromHtml(description) }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
} 