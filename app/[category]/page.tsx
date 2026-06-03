'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ui/ProductCard';
import Footer from '../components/ui/Footer';
import { getProducts, getCategories } from '@/lib/woocommerce';
import type { Product } from '@/types/woocommerce';
import type { WooCategory } from '@/types/woocommerce';
import { getThemeColors, getThemeForCategory, Theme } from '@/lib/theme';

export default function CategoryPage() {
  const { t } = useLanguage();
  const params = useParams();
  const categorySlug = params.category as string;

  const [activeFilter] = useState('ALL');
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  // Find category config
  const categoryConfig = categories.find(cat => cat.slug === categorySlug);
  const categoryName = categoryConfig?.name || categorySlug;
  const theme: Theme = getThemeForCategory(categoryName);
  const colors = getThemeColors(theme);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allProducts, cats] = await Promise.all([
          getProducts(),
          getCategories()
        ]);

        const filtered = allProducts.filter(p =>
          p.categories.some(c => c.slug === categorySlug || c.name.toLowerCase() === categorySlug.toLowerCase())
        );

        if (filtered.length === 0) {
          setNotFoundError(true);
        }

        setCategoryProducts(filtered);
        setCategories(cats);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    }

    if (categorySlug) {
      fetchData();
    }
  }, [categorySlug]);

  const filteredProducts = categoryProducts.filter(product => {
    if (activeFilter === 'ALL') return true;
    return product.categories.some(cat =>
      cat.name.toUpperCase() === activeFilter
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className={`${colors.text} text-xl`}>{t('form.processing')}</div>
      </div>
    );
  }

  if (notFoundError) {
    return notFound();
  }

  return (
    <div className="relative w-full min-h-screen bg-white text-black overflow-hidden" style={colors.cssVars}>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-100 via-white to-gray-100 z-0" />
      <div className="fixed inset-0 bg-white/60 z-10" />

      {/* Content — padded to clear the fixed header (marquee + nav) */}
      <div className="relative z-20 pt-[90px]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-5xl md:text-7xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r ${colors.titleGradient} uppercase mb-8`}
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            {categoryName}
          </motion.h1>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  theme={theme}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">{t('store.noProducts')}</p>
            </div>
          )}
        </div>

        <Footer theme={theme} />
      </div>
    </div>
  );
}
