'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Product } from '@/types/woocommerce';
import { Theme } from '@/lib/theme';

interface ProductCardProps {
  product: Product;
  index?: number;
  theme?: Theme;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t } = useLanguage();

  const mainImage = product.images[0];
  const isOnSale = product.sale_price !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative bg-white transition-all duration-500"
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
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
            <div className="absolute top-3 left-3 bg-black text-white text-[0.65rem] font-bold px-2.5 py-1 uppercase tracking-widest z-10">
              {t('product.sale')}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pt-3 pb-4 bg-white">
          <h3
            className="text-[1.05rem] font-bold text-black mb-1 group-hover:underline decoration-2 underline-offset-2 transition-all line-clamp-1 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {product.name}
          </h3>

          <p className="text-gray-500 text-[0.7rem] mb-1.5 uppercase tracking-[0.15em] truncate">
            {product.attributes[0]?.options.slice(0, 3).join(' / ') || product.categories.map(c => c.name).slice(0, 2).join(' / ')}
          </p>

          <div className="flex items-center gap-2">
            <p className="text-black font-bold">
              {isOnSale ? product.sale_price : product.price}
            </p>
            {isOnSale && (
              <p className="text-gray-400 line-through text-sm">{product.price}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}