'use client';

import { useLanguage } from '@/app/context/LanguageContext';

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="inline-flex items-stretch border border-zinc-300 overflow-hidden"
      role="group"
      aria-label="Language"
    >
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
          locale === 'en' ? 'bg-black text-white' : 'bg-white text-zinc-500 hover:text-black'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('ar')}
        className={`px-3 py-1.5 text-xs font-bold tracking-wider transition-colors border-l border-zinc-300 ${
          locale === 'ar' ? 'bg-black text-white' : 'bg-white text-zinc-500 hover:text-black'
        }`}
      >
        عربي
      </button>
    </div>
  );
}