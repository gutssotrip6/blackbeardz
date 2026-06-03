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

  const mainImage = product.images[selectedImage];

  // Helper to get image URL with fallback
  const getImageUrl = (url: string | undefined) => url || '/placeholder.png';

  return (
    <div className="relative min-h-screen bg-white text-black">

      {/* BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="fixed inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/background.webm" type="video/webm" />
      </video>

      <div className="relative z-10 pt-[100px] pb-12 px-6 md:px-12">

        {/* BREADCRUMB */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className={`text-sm text-gray-600 flex ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/" className="hover:text-black text-gray-600">{t('nav.home')}</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/store" className="hover:text-black text-gray-600">{t('nav.store')}</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-black">{product.name}</span>
          </div>
        </div>

        {/* PRODUCT CONTAINER */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">

          {/* LEFT SIDE - IMAGES */}
          <div className={isRTL ? 'md:order-2' : ''}>
            {/* MAIN IMAGE */}
            <div className="relative w-full aspect-square bg-gray-100 border border-gray-300 overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-8 h-8 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                </div>
              )}
              <Image
                src={getImageUrl(mainImage?.src)}
                alt={mainImage?.alt || product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw" // FIXED: better responsive sizes
                className={`object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                quality={85}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* THUMBNAILS */}
            {product.images.length > 1 && (
              <div className="w-full mt-3">
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={`thumb-${idx}`}
                      onClick={() => {
                        setImageLoaded(false);
                        setSelectedImage(idx);
                      }}
                      className={`relative aspect-square border transition ${
                        selectedImage === idx
                          ? 'border-black'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Image
                        src={getImageUrl(img.src)}
                        alt={img.alt || ''}
                        fill
                        sizes="(max-width: 768px) 25vw, 120px" // FIXED: responsive sizes
                        className="object-cover"
                        quality={60} // Lower quality for thumbnails
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - INFO */}
          <div className={`flex flex-col ${isRTL ? 'md:order-1 text-right items-end' : ''}`}>

            {/* NAME */}
            <h1
              className="text-4xl font-bold uppercase mb-2"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="flex items-center gap-3 text-2xl mb-3">
              <span className="text-black font-bold">
                {product.sale_price || product.price}
              </span>

              {product.sale_price && (
                <span className="text-gray-500 line-through text-lg">
                  {product.price}
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            <div
              className="text-gray-700 mb-4"
              dangerouslySetInnerHTML={{
                __html: product.description.replace(/<img[^>]*>/g, '')
              }}
            />

            {/* COLOR SELECT */}
            {colors.length > 0 && (
              <div className="mb-1 w-full">
                <p className="text-sm text-gray-600 mb-1 uppercase">{t('product.color')}</p>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 border uppercase text-sm ${
                        selectedColor === c
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-black hover:border-gray-500'
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
              <div className="w-full">
                <p className="text-sm text-gray-600 mb-1 uppercase">{t('product.size')}</p>
                <div className={`flex gap-2 flex-wrap ${isRTL ? 'justify-end' : ''}`}>
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 border ${
                        selectedSize === s
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-black hover:border-gray-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* INLINE CHECKOUT */}
            <div className="-mt-4 w-full">
              <InlineCheckout
                product={product}
                selectedSize={selectedSize || undefined}
                selectedColor={selectedColor || undefined}
                disabled={!canCheckout}
              />
            </div>

            {/* ADD TO CART */}
            <div className={`flex justify-center mt-2 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={handleAddToCart}
                disabled={!canCheckout}
                className={`px-12 py-4 border font-bold uppercase transition-colors ${
                  !canCheckout
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                    : 'border-black bg-black text-white hover:bg-gray-800'
                }`}
              >
                {t('product.addToCart')}
              </button>
            </div>

          </div>
        </div>

        {/* POPULAR PRODUCTS */}
        {popularProducts.length > 0 && (
          <div className="max-w-7xl mx-auto mt-16">
            <h2
              className={`text-3xl font-bold text-black mb-8 uppercase ${isRTL ? 'text-right' : ''}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {t('nav.popular')}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      <Footer theme="primary" />

    </div>
  );
}
