// components/product/ProductClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/woocommerce';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import ProductCard from '../ui/ProductCard';
import Footer from '../ui/Footer';
import InlineCheckout from '../ui/InlineCheckout';
import { getMetaPixel } from '@/lib/meta-pixel';
import { getTikTokPixel } from '@/lib/tiktok-pixel';
import { generateEventId, extractPriceValue } from '@/lib/tracking-utils';

interface ProductClientProps {
  product: Product;
  popularProducts: Product[];
}

// REMOVED toWebp function - let next/image handle format optimization

export default function ProductClient({ product, popularProducts }: ProductClientProps) {
  const { t, isRTL } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false); // ADDED for loading state

  const { addItem } = useCart();

  // Track ViewContent event when product page loads
  useEffect(() => {
    const eventId = generateEventId();
    const price = extractPriceValue(product.sale_price || product.price);
    
    try {
      const metaPixel = getMetaPixel();
      metaPixel.viewContent(String(product.id), product.name, price, 'DZD', eventId);
      
      const tiktokPixel = getTikTokPixel();
      tiktokPixel.viewContent(String(product.id), product.name, price, 'DZD', eventId);
    } catch (error) {
      console.error('Failed to track ViewContent event:', error);
    }
  }, [product]);

  const sizeAttribute = product.attributes.find(
    (a) =>
      a.name.toLowerCase() === 'size' ||
      (a as any).slug === 'size' ||
      a.name.toLowerCase().includes('size')
  );
  const sizes = sizeAttribute?.options || [];

  const colorAttribute = product.attributes.find(
    (a) =>
      a.name.toLowerCase() === 'color' ||
      (a as any).slug === 'color' ||
      a.name.toLowerCase().includes('color')
  );
  const colors = colorAttribute?.options || [];

  const canCheckout =
    (sizes.length === 0 || selectedSize !== null) &&
    (colors.length === 0 || selectedColor !== null);

  const handleAddToCart = () => {
    if (!canCheckout) return;
    addItem(product, selectedSize || 'Default', selectedColor || undefined);
  };

  // Smooth-scroll the shopper straight to the order form (zero-friction CTA)
  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const mainImage = product.images[selectedImage];

  // Helper to get image URL with fallback
  const getImageUrl = (url: string | undefined) => url || '/placeholder.png';

  return (
    <div className="relative min-h-screen bg-white text-black">

      <div className="relative z-10 pt-[88px] md:pt-[100px] pb-28 md:pb-12">

        {/* BREADCRUMB */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 mb-3 md:mb-5">
          <div className={`text-[0.7rem] md:text-xs uppercase tracking-wider text-zinc-400 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/" className="hover:text-black transition-colors">{t('nav.home')}</Link>
            <span className="mx-2 text-zinc-300">/</span>
            <Link href="/store" className="hover:text-black transition-colors">{t('nav.store')}</Link>
            <span className="mx-2 text-zinc-300">/</span>
            <span className="text-black truncate max-w-[140px] md:max-w-none">{product.name}</span>
          </div>
        </div>

        {/* PRODUCT CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 md:px-0 grid grid-cols-2 gap-x-4 gap-y-5 md:gap-x-12 md:gap-y-2 items-start">

          {/* LEFT SIDE - IMAGES (sticky on desktop) */}
          <div className={`self-start md:sticky md:top-[100px] md:row-start-1 md:row-span-2 ${isRTL ? 'md:col-start-2' : 'md:col-start-1'}`}>
            {/* MAIN IMAGE */}
            <div className="relative w-full aspect-square bg-zinc-100 overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
                  <div className="w-8 h-8 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
                </div>
              )}
              <Image
                src={getImageUrl(mainImage?.src)}
                alt={mainImage?.alt || product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                quality={85}
                onLoad={() => setImageLoaded(true)}
              />
              {product.sale_price && (
                <span className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-black text-white text-[0.65rem] font-bold px-2.5 py-1 uppercase tracking-widest z-10`}>
                  {t('product.sale')}
                </span>
              )}
            </div>

            {/* THUMBNAILS — horizontal scroll on mobile, row on desktop */}
            {product.images.length > 1 && (
              <div className={`flex gap-2 mt-2 md:mt-3 overflow-x-auto no-scrollbar ${isRTL ? 'flex-row-reverse' : ''}`}>
                {product.images.map((img, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    onClick={() => {
                      setImageLoaded(false);
                      setSelectedImage(idx);
                    }}
                    className={`relative w-16 md:w-20 aspect-square flex-shrink-0 border-2 transition ${
                      selectedImage === idx
                        ? 'border-black'
                        : 'border-transparent hover:border-zinc-300'
                    }`}
                  >
                    <Image
                      src={getImageUrl(img.src)}
                      alt={img.alt || ''}
                      fill
                      sizes="80px"
                      className="object-cover"
                      quality={60}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE - INFO */}
          <div className={`flex flex-col md:row-start-1 ${isRTL ? 'md:col-start-1 text-right items-end' : 'md:col-start-2'}`}>

            {/* NAME */}
            <h1
              className="text-xl md:text-5xl font-extrabold uppercase tracking-tight mb-2 md:mb-3 leading-tight md:leading-[0.95]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {product.name}
            </h1>

            {/* PRICE */}
            <div className={`flex items-center flex-wrap gap-2 md:gap-3 mb-4 md:mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-lg md:text-3xl text-black font-bold">
                {product.sale_price || product.price}
              </span>
              {product.sale_price && (
                <>
                  <span className="text-zinc-400 line-through text-sm md:text-lg">
                    {product.price}
                  </span>
                  <span className="bg-black text-white text-[0.65rem] font-bold px-2 py-1 uppercase tracking-widest">
                    {t('product.sale')}
                  </span>
                </>
              )}
            </div>

            {/* DESCRIPTION */}
            <div
              className="text-zinc-600 text-xs md:text-sm leading-relaxed mb-4 md:mb-6"
              dangerouslySetInnerHTML={{
                __html: product.description.replace(/<img[^>]*>/g, '')
              }}
            />

            {/* COLOR SELECT */}
            {colors.length > 0 && (
              <div className="mb-5 w-full">
                <p className="text-xs font-bold text-black mb-2 uppercase tracking-[0.15em]">{t('product.color')}</p>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2.5 border uppercase text-xs font-semibold tracking-wide transition-colors ${
                        selectedColor === c
                          ? 'border-black bg-black text-white'
                          : 'border-zinc-300 text-black hover:border-black'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SIZE SELECT */}
            {sizes.length > 0 && (
              <div className="w-full mb-5">
                <p className="text-xs font-bold text-black mb-2 uppercase tracking-[0.15em]">{t('product.size')}</p>
                <div className={`flex gap-2 flex-wrap ${isRTL ? 'justify-end' : ''}`}>
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[3rem] h-12 px-3 border text-sm font-semibold transition-colors ${
                        selectedSize === s
                          ? 'border-black bg-black text-white'
                          : 'border-zinc-300 text-black hover:border-black'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ORDER FORM — full width on mobile (below image+text), right column on desktop */}
          <div
            id="order-form"
            className={`col-span-2 md:col-span-1 md:row-start-2 mt-2 md:mt-0 scroll-mt-[96px] ${isRTL ? 'md:col-start-1' : 'md:col-start-2'}`}
          >
            <InlineCheckout
              product={product}
              selectedSize={selectedSize || undefined}
              selectedColor={selectedColor || undefined}
              disabled={!canCheckout}
            />
          </div>
        </div>

        {/* POPULAR PRODUCTS */}
        {popularProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-12 mt-16">
            <h2
              className={`text-3xl md:text-4xl font-extrabold text-black mb-8 uppercase tracking-tight ${isRTL ? 'text-right' : ''}`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('nav.popular')}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {popularProducts && popularProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((p, idx) => (
                  <ProductCard key={p.id} product={p} index={idx} />
                ))}
            </div>
          </div>
        )}

      </div>

      {/* STICKY MOBILE ORDER BAR — jumps straight to the order form */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex flex-col leading-tight ${isRTL ? 'items-end' : ''}`}>
          <span className="text-[0.6rem] text-zinc-500 uppercase tracking-wider">{product.sale_price ? t('product.sale') : t('product.total')}</span>
          <span className="text-lg font-bold text-black whitespace-nowrap">{product.sale_price || product.price}</span>
        </div>
        <button
          onClick={scrollToOrder}
          className="flex-1 py-3.5 font-bold uppercase tracking-[0.1em] text-sm bg-black text-white active:bg-zinc-800 transition-colors"
        >
          {t('product.confirmOrder')}
        </button>
      </div>

      <Footer theme="primary" />

    </div>
  );
}
