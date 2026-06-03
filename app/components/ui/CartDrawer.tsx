'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { DELIVERY_FEE } from '@/app/data/wilayas-data';
import { getThemeColors } from '@/lib/theme';

export default function CartDrawer() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    isOpen, 
    setIsOpen, 
    totalItems, 
    totalPrice,
    setIsCheckoutOpen
  } = useCart();
  
  const { t, isRTL } = useLanguage();
  const colors = getThemeColors('primary');

  const totalWithDelivery = totalPrice + DELIVERY_FEE;

  const handleCheckout = () => {
    setIsOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${isRTL ? 'left-0 border-r' : 'right-0 border-l'} h-full w-full max-w-md bg-white border-gray-300 z-[90] shadow-2xl`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2
                  className="text-2xl font-extrabold text-black uppercase tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t('cart.title')} ({totalItems})
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-black hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">{t('cart.empty')}</p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-black hover:text-gray-600 underline"
                    >
                      {t('cart.continue')}
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <CartItem 
                      key={`${item.product.id}-${item.size}-${item.color || 'nocolor'}`}
                      item={item}
                      removeItem={removeItem}
                      updateQuantity={updateQuantity}
                      setIsOpen={setIsOpen}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  <div className="space-y-2">
                    <div className={`flex justify-between items-center text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-600">{t('cart.subtotal')}</span>
                      <span className="text-black">{totalPrice.toLocaleString()} DA</span>
                    </div>
                    <div className={`flex justify-between items-center text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-600">{t('cart.deliveryFee')}</span>
                      <span className="text-black">{DELIVERY_FEE.toLocaleString()} DA</span>
                    </div>
                    <div className={`flex justify-between items-center pt-2 border-t border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-700">{t('cart.total')}</span>
                      <span className="text-xl font-bold text-black">
                        {totalWithDelivery.toLocaleString()} DA
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    {t('cart.checkout')}
                  </button>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 border border-gray-300 text-black hover:border-black transition-colors uppercase text-sm tracking-wider"
                  >
                    {t('cart.continue')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Separate component for cart item with loading state
function CartItem({ 
  item, 
  removeItem, 
  updateQuantity, 
  setIsOpen 
}: { 
  item: any;
  removeItem: (id: number, size: string, color?: string) => void;
  updateQuantity: (id: number, size: string, qty: number, color?: string) => void;
  setIsOpen: (open: boolean) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t, isRTL } = useLanguage();
  const colors = getThemeColors('primary');

  // Get smaller image URL by adding resize parameters if it's a WordPress image
  const getOptimizedImageUrl = (url: string) => {
    if (!url) return '/placeholder.png';
    // If it's already a small image or placeholder, return as-is
    if (url.includes('placeholder') || url.endsWith('.svg')) return url;
    
    // For WordPress images, try to get a smaller version
    // Common WordPress resize patterns
    if (url.includes('wp-content/uploads')) {
      // Remove any existing resize parameters and add our own
      const baseUrl = url.replace(/-\d+x\d+\.(jpg|jpeg|png|webp)$/i, '.$1');
      // Add a small resize parameter (150x150 thumbnail size)
      return baseUrl.replace(/\.(jpg|jpeg|png|webp)$/i, '-150x150.$1');
    }
    return url;
  };

  const optimizedImageUrl = getOptimizedImageUrl(item.product.images[0]?.src);

  return (
    <div className={`flex gap-4 border-b border-zinc-200 pb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Image with loading state */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-zinc-100 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        )}
        <Image
          src={optimizedImageUrl}
          alt={item.product.name}
          fill
          sizes="80px"
          className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          quality={60}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
      </div>

      {/* Info */}
      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
        <Link
          href={`/product/${item.product.slug}`}
          onClick={() => setIsOpen(false)}
          className="block font-bold text-black uppercase tracking-tight truncate hover:underline transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.product.name}
        </Link>
        <p className="text-xs text-zinc-500 uppercase tracking-wide mt-0.5">{t('product.size')}: {item.size}</p>
        {item.color && (
          <p className="text-xs text-zinc-500 uppercase tracking-wide">{t('product.color')}: {item.color}</p>
        )}
        <p className="text-black font-bold mt-1">{item.product.price}</p>

        {/* Quantity Controls */}
        <div className={`flex items-center gap-3 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1, item.color)}
            className="w-7 h-7 border border-zinc-300 text-black hover:border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center text-sm"
          >
            -
          </button>
          <span className="text-black w-6 text-center font-semibold tabular-nums">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1, item.color)}
            className="w-7 h-7 border border-zinc-300 text-black hover:border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center text-sm"
          >
            +
          </button>
          <button
            onClick={() => removeItem(item.product.id, item.size, item.color)}
            className={`text-zinc-400 hover:text-black transition-colors ${isRTL ? 'mr-auto' : 'ml-auto'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}