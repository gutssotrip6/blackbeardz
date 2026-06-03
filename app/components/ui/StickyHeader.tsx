'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { getCategories } from '@/lib/woocommerce';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import LanguageToggle from './LanguageToggle';
import type { WooCategory } from '@/types/woocommerce';

export default function StickyHeader() {
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems, setIsOpen: openCart } = useCart();
  const { t, isRTL } = useLanguage();
  const marqueeItems = Array.from({ length: 8 });

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const menuLinks = [
    { name: t('nav.home'), href: '/' },
    ...categories.map(cat => ({ name: cat.name, href: `/${cat.slug}` })),
    { name: t('nav.store'), href: '/store' },
  ];

  return (
    <>
      {/* ── Marquee Banner ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black py-2 overflow-hidden border-b border-zinc-800">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: isRTL ? ['-50%', '0%'] : ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
        >
          {marqueeItems.map((_, i) => (
            <span key={i} className="mx-10 text-xs tracking-widest text-white/90 uppercase font-medium">
              {t('hero.marquee')}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Sticky Navigation Bar ── */}
      <header className="fixed top-[32px] left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto h-14 flex items-center px-4 md:px-6 gap-3">

          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col justify-center items-center w-8 h-8 gap-[5px] group flex-shrink-0"
            aria-label="Open menu"
          >
            <span className="block w-5 h-[2px] bg-black transition-all duration-300 group-hover:bg-gray-500" />
            <span className="block w-5 h-[2px] bg-black transition-all duration-300 group-hover:bg-gray-500" />
            <span className="block w-3 h-[2px] bg-black transition-all duration-300 group-hover:w-5 group-hover:bg-gray-500" />
          </button>

          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/favicon.png"
              alt={siteConfig.name}
              width={28}
              height={28}
              className="object-contain"
            />
            <span
              className="font-extrabold text-xl uppercase tracking-tight leading-none hidden sm:block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {siteConfig.name}
            </span>
          </Link>

          {/* Category links – always visible on top, scrollable on mobile */}
          <nav className="flex-1 flex items-center gap-4 md:gap-6 mx-2 md:mx-4 overflow-x-auto no-scrollbar md:justify-center">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="relative text-[0.78rem] font-bold text-black hover:text-zinc-500 transition-colors uppercase tracking-wide whitespace-nowrap py-1 after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/store"
              className="relative text-[0.78rem] font-bold text-black hover:text-zinc-500 transition-colors uppercase tracking-wide whitespace-nowrap py-1 after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
            >
              All Products
            </Link>
          </nav>

          {/* Right side: language toggle + cart */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="scale-[0.85] origin-right">
              <LanguageToggle />
            </div>
            <button
              onClick={() => openCart(true)}
              className="relative w-9 h-9 flex items-center justify-center text-black hover:text-gray-500 transition-colors"
              aria-label={t('cart.open')}
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Slide-out Navigation Drawer ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className={`fixed top-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} h-full w-72 bg-white border-gray-200 z-[70] shadow-2xl flex flex-col`}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Image src="/favicon.png" alt={siteConfig.name} width={36} height={36} className="object-contain" />
                  <span
                    className="text-2xl font-extrabold uppercase tracking-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {siteConfig.name}
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-4">
                {menuLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: isRTL ? 14 : -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.055 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center py-3 px-2 text-[1.6rem] font-bold uppercase text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                      style={{ fontFamily: 'var(--font-display)' }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Drawer footer */}
              <div className="px-6 py-5 border-t border-gray-100">
                <p className="text-gray-400 text-[0.65rem] uppercase tracking-[0.2em]">{siteConfig.tagline}</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
