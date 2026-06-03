'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Product } from '@/types/woocommerce';
import { getThemeColors, Theme } from '@/lib/theme';

interface ProductCardProps {
  product: Product;
  index?: number;
  theme?: Theme;
}

export default function ProductCard({ product, index = 0, theme = 'primary' }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t } = useLanguage();
  
  const mainImage = product.images[0];
  const isOnSale = product.sale_price !== null;
  const colors = getThemeColors(theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`group relative bg-white border border-gray-300 ${colors.borderHover} transition-all duration-500 overflow-hidden`}
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image Container with backdrop blur */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className={`w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin`} />
            </div>
          )}
          <Image 
            src={mainImage?.src || '/placeholder.png'} 
            alt={mainImage?.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading={index < 4 ? "eager" : "lazy"}
            quality={75}
            onLoad={() => setImageLoaded(true)}
          />
          
          {isOnSale && (
            <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-2 py-1 rounded z-10">
              {t('product.sale')}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 bg-white">
          <h3 
            className="text-xl font-bold text-black mb-2 group-hover:text-gray-600 transition-colors uppercase line-clamp-2"
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <p className="text-black font-medium">
              {isOnSale ? product.sale_price : product.price}
            </p>
            {isOnSale && (
              <p className="text-gray-500 line-through text-sm">{product.price}</p>
            )}
          </div>

          <p className="text-gray-600 text-xs mt-2 uppercase tracking-wider truncate">
            {product.attributes[0]?.options.slice(0, 3).join(' / ') || product.categories.map(c => c.name).slice(0, 2).join(' / ')}
          </p>
        </div>

        {/* Hover Border Overlay */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-black transition-all duration-500 pointer-events-none" />
      </Link>
    </motion.div>
  );
}