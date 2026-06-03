'use client';

import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';

export default function CartButton() {
  const { totalItems, setIsOpen } = useCart();
  const { t } = useLanguage();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`fixed top-[45px] right-16 z-[55] w-10 h-10 flex items-center justify-center text-black hover:text-gray-600 transition-colors`}
      aria-label={t('cart.open')}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs font-bold flex items-center justify-center rounded-full animate-pulse">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </button>
  );
}