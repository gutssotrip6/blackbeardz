'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import FilterBar from '../components/ui/FilterBar';
import ProductCard from '../components/ui/ProductCard';
import Footer from '../components/ui/Footer';
import { getProducts, getCategories } from '@/lib/woocommerce';
import type { Product } from '@/types/woocommerce';
import type { WooCategory } from '@/types/woocommerce';
import { getThemeColors } from '@/lib/theme';

export default function StorePage() {
  const { t, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 10000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');

  const productsPerPage = 12;

  useEffect(() => {
    async function fetchData() {
      try {
        const [products, cats] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setAllProducts(products);
        setCategories(cats);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('error.orderFailed'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [t]);

  const filters = ['ALL', ...categories.map(cat => cat.name.toUpperCase())];
  const currentTheme = activeFilter === 'SUMMER' ? 'secondary' : 'primary';
  const colors = getThemeColors(currentTheme);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (activeFilter !== 'ALL') {
      result = result.filter(product =>
        product.categories.some(cat => cat.name.toUpperCase() === activeFilter)
      );
    }

    result = result.filter(product => {
      const price = parseInt(product.price.replace(/\D/g, '')) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categories.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
        break;
      case 'price-high':
        result.sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, activeFilter, priceRange, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className={`${colors.text} text-xl`}>{t('form.processing')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
          >
            {t('form.close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-white text-black overflow-hidden" style={colors.cssVars}>
      {/* Content — padded to clear the fixed marquee (32px) + nav (56px) = 88px */}
      <div className="relative z-20 pt-[90px]">

        {/* Page Header */}
        <div className="pt-10 pb-6 px-6 md:px-12 max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-6xl font-extrabold text-black uppercase tracking-tight mb-1 ${isRTL ? 'text-right' : ''}`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('nav.store')}
          </motion.h1>
          <p className={`text-zinc-500 text-sm mb-8 ${isRTL ? 'text-right' : ''}`}>
            {filteredProducts.length} {t('store.showing').toLowerCase()}
          </p>

          {/* Search + Sort */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <svg className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('store.search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-zinc-100 border border-transparent rounded-none text-black text-sm placeholder-zinc-500 focus:outline-none focus:bg-white focus:border-black transition-colors`}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3.5 bg-white border border-zinc-300 rounded-none text-black text-sm uppercase tracking-wide font-semibold focus:outline-none focus:border-black transition-colors cursor-pointer"
            >
              <option value="popular">{t('store.sort.popular')}</option>
              <option value="price-low">{t('store.sort.priceLow')}</option>
              <option value="price-high">{t('store.sort.priceHigh')}</option>
              <option value="newest">{t('store.sort.newest')}</option>
            </select>
          </div>

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              setActiveFilter(filter);
              setCurrentPage(1);
            }}
            theme={currentTheme}
          />

        </div>

        {/* Product Grid */}
        <section className="px-6 md:px-12 pb-12">
          <div className="max-w-7xl mx-auto">
            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {currentProducts.map((product, index) => {
                  const isSummerProduct = product.categories.some(
                    cat => cat.name.toUpperCase() === 'SUMMER'
                  );
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
            ) : (
              <div className="text-center py-24">
                <p className="text-zinc-400 text-lg uppercase tracking-wide mb-4">{t('store.noProducts')}</p>
                <button
                  onClick={() => {
                    setActiveFilter('ALL');
                    setPriceRange([1, 10000]);
                    setSearchQuery('');
                  }}
                  className="inline-block px-8 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                >
                  {t('store.clearFilters')}
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex justify-center items-center gap-2 mt-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 border border-zinc-300 text-black text-sm font-semibold uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:border-black transition-colors"
                >
                  {t('nav.previous')}
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 border text-sm font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-zinc-300 hover:border-black'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 border border-zinc-300 text-black text-sm font-semibold uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:border-black transition-colors"
                >
                  {t('nav.next')}
                </button>
              </div>
            )}

            <p className={`text-center text-gray-500 text-sm mt-4 ${isRTL ? 'text-right' : ''}`}>
              {t('store.showing')} {currentProducts.length} / {filteredProducts.length}
            </p>
          </div>
        </section>

        <Footer theme={currentTheme} />
      </div>
    </div>
  );
}
