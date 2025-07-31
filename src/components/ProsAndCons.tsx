import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

interface ProsAndConsProps {
  prosAndCons: {
    pros: Record<string, string | string[]> | string;
    cons: Record<string, string | string[]> | string;
  };
  locale: string;
}

export default async function ProsAndCons({ prosAndCons, locale }: ProsAndConsProps) {
  const t = await getTranslations({ locale, namespace: 'post' });
  
  // Handle both localized and multi-language formats
  const prosData = typeof prosAndCons.pros === 'string' 
    ? prosAndCons.pros 
    : (prosAndCons.pros[locale] || prosAndCons.pros['en'] || '');
  const consData = typeof prosAndCons.cons === 'string' 
    ? prosAndCons.cons 
    : (prosAndCons.cons[locale] || prosAndCons.cons['en'] || '');
  
  // Handle both string and array formats safely
  let pros: string[] = [];
  let cons: string[] = [];

  // Handle pros data
  if (Array.isArray(prosData)) {
    // Old format: array of strings
    pros = prosData.filter(item => item && item.trim());
  } else if (typeof prosData === 'string' && prosData.trim()) {
    // New format: string with lines
    pros = prosData.split('\n').filter(line => line.trim()).map(line => line.replace(/^-\s*/, '').trim());
  }

  // Handle cons data
  if (Array.isArray(consData)) {
    // Old format: array of strings
    cons = consData.filter(item => item && item.trim());
  } else if (typeof consData === 'string' && consData.trim()) {
    // New format: string with lines
    cons = consData.split('\n').filter(line => line.trim()).map(line => line.replace(/^-\s*/, '').trim());
  }

  if (pros.length === 0 && cons.length === 0) {
    return null;
  }

  // Get the maximum number of rows needed
  const maxRows = Math.max(pros.length, cons.length);

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-4">{t('prosAndConsTitle')}</h2>
      
      <div className="overflow-x-auto leading-tight">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2.5 text-left font-bold text-gray-800">Pros</th>
              <th className="border border-gray-300 px-4 py-2.5 text-left font-bold text-gray-800">Cons</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }, (_, index) => (
              <tr key={index} >
                <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">
                  {pros[index] || ''}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">
                  {cons[index] || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
} 