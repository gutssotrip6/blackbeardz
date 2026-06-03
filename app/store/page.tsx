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
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-3 ${colors.badge} text-black font-bold uppercase`}
          >
            {t('form.close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-white text-black overflow-hidden" style={colors.cssVars}>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-100 via-white to-gray-100 z-0" />
      <div className="fixed inset-0 bg-white/60 z-10" />

      {/* Content — padded to clear the fixed marquee (32px) + nav (56px) = 88px */}
      <div className="relative z-20 pt-[90px]">

        {/* Page Header */}
        <div className="pt-8 pb-8 px-6 md:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-5xl md:text-7xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r ${colors.titleGradient} uppercase mb-8`}
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            {t('nav.store')}
          </motion.h1>

          {/* Search + Sort */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t('store.search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-none text-black placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-none text-black focus:outline-none focus:border-black transition-colors cursor-pointer"
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

          {/* Price Slider */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={`${colors.text} text-sm uppercase tracking-widest`}>{t('store.price')}:</span>
              <div className="flex-1 relative h-2 bg-gray-200 rounded-full">
                <input
                  type="range"
                  min="1"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => {
                    setPriceRange([1, parseInt(e.target.value)]);
                    setCurrentPage(1);
                  }}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute h-full bg-black rounded-full"
                  style={{ width: `${((priceRange[1] - 1) / 9999) * 100}%` }}
                />
              </div>
              <span className="text-black text-sm min-w-[120px] text-right">
                1 - {priceRange[1].toLocaleString()} DA
              </span>
            </div>
          </div>
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
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">{t('store.noProducts')}</p>
                <button
                  onClick={() => {
                    setActiveFilter('ALL');
                    setPriceRange([1, 10000]);
                    setSearchQuery('');
                  }}
                  className={`mt-4 ${colors.text} ${colors.hover} underline`}
                >
                  {t('store.clearFilters')}
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex justify-center items-center gap-2 mt-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border ${colors.border} ${colors.text} disabled:opacity-50 disabled:cursor-not-allowed ${colors.borderHover} transition-colors`}
                >
                  {t('nav.previous')}
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 border transition-colors ${
                        currentPage === page
                          ? `${colors.badge} text-black ${colors.border}`
                          : `${colors.border} ${colors.text} ${colors.borderHover}`
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border ${colors.border} ${colors.text} disabled:opacity-50 disabled:cursor-not-allowed ${colors.borderHover} transition-colors`}
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
