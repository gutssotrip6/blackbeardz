'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, Suspense, lazy } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from './context/LanguageContext';
import ProductCard from './components/ui/ProductCard';
import FilterBar from './components/ui/FilterBar';
import Footer from './components/ui/Footer';
import { getProducts, getCategories } from '@/lib/woocommerce';
import type { Product } from '@/types/woocommerce';
import type { WooCategory } from '@/types/woocommerce';
import { getThemeColors, getThemeForCategory } from '@/lib/theme';

const ShippingBanner = lazy(() => import('./components/ui/ShippingBanner'));

export default function Home() {
  const { t, isRTL } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('POPULAR');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const filters = ['POPULAR', ...categories.map(cat => cat.name.toUpperCase())];

  useEffect(() => {
    setMounted(true);

    async function fetchData() {
      try {
        const [products, cats] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setAllProducts(products);
        setCategories(cats);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProducts = allProducts.filter((product, index) => {
    if (activeFilter === 'POPULAR') return index < 4;
    return product.categories.some(cat => cat.name.toUpperCase() === activeFilter);
  });

  const currentTheme = activeFilter === 'SUMMER' ? 'secondary' : 'primary';
  const colors = getThemeColors(currentTheme);

  if (!mounted) {
    return (
      <div className="relative w-full bg-white text-black min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative w-full bg-white text-black min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-xl">{t('form.processing')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full bg-white text-black min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">{t('error.orderFailed')}</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        {categories.map(cat => (
          <link key={cat.slug} rel="preload" href={`/${cat.slug}.png`} as="image" />
        ))}
      </Head>

      <div className="relative w-full min-h-screen bg-white text-black" style={colors.cssVars}>
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-to-b from-gray-100 via-white to-gray-100 z-0 pointer-events-none" />
        <div className="fixed inset-0 bg-white/50 z-10 pointer-events-none" />

        {/* Hero Section — full viewport height, category cards */}
        <div className="relative h-[100svh] md:h-screen w-full overflow-hidden z-20">
          <div className="absolute inset-0 pt-[108px] pb-10 md:pt-[165px] md:pb-[60px] flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-12 z-30">
            {categories && categories.slice(0, 2).map((cat, index) => {
              const theme = getThemeForCategory(cat.name);
              const catColors = getThemeColors(theme);

              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative flex-1 md:h-[500px] overflow-hidden cursor-pointer min-h-0"
                >
                  <Link href={`/${cat.slug}`} className="block w-full h-full relative">
                    <Image
                      src={`/${cat.slug}.png`}
                      alt={cat.name}
                      fill
                      className="object-contain transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      loading="eager"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                    <div className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} p-4 md:p-8 pointer-events-none`}>
                      <h3
                        className={`text-3xl md:text-6xl font-bold mb-2 transition-colors text-white ${catColors.hover} uppercase`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {cat.name}
                      </h3>
                    </div>
                    <div className={`absolute inset-0 border-2 ${catColors.border} ${catColors.borderHover} transition-all duration-500 pointer-events-none`} />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="absolute bottom-[10px] left-1/2 -translate-x-1/2 text-black text-4xl z-50"
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            ↓
          </motion.div>
        </div>

        {/* Feature cards — directly under the hero */}
        <Suspense fallback={null}>
          <ShippingBanner />
        </Suspense>

        {/* Popular / Filter Section */}
        <section className="relative z-20 pt-2 pb-14 md:pt-4 md:pb-20 px-6 md:px-12">
          <FilterBar
            title={t('nav.store')}
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            theme={currentTheme}
          />

          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => {
              const isSummerProduct = product.categories.some(cat => cat.name.toUpperCase() === 'SUMMER');
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  theme={isSummerProduct ? 'secondary' : 'primary'}
                />
              );
            })}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/store">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest font-medium"
              >
                {t('product.viewAll')}
              </motion.button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
