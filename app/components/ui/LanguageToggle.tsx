'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';

export default function LanguageToggle() {
  const { locale, setLocale, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-none hover:border-black transition-colors"
      aria-label="Toggle language"
    >
      <span className={`text-sm font-medium ${locale === 'en' ? 'text-black' : 'text-gray-400'}`}>
        EN
      </span>
      <div className="relative w-8 h-4 bg-gray-200 rounded-full">
        <motion.div
          className="absolute top-0.5 w-3 h-3 bg-black rounded-full"
          animate={{ 
            // Use insetInlineStart for RTL support (logical property)
            insetInlineStart: locale === 'en' ? '2px' : 'calc(100% - 14px)' 
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <span className={`text-sm font-medium ${locale === 'ar' ? 'text-black' : 'text-gray-400'}`}>
        عربي
      </span>
    </motion.button>
  );
}