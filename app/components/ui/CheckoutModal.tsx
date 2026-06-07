'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { wilayasData } from '@/app/data/wilayas-data';
import { getMetaPixel } from '@/lib/meta-pixel';
import { getTikTokPixel } from '@/lib/tiktok-pixel';
import { generateEventId, extractPriceValue } from '@/lib/tracking-utils';
import { TrackingContentItem } from '@/types/tracking';
import { getThemeColors } from '@/lib/theme';

// Simple cache for prices
const priceCache = new Map<number, number>();

interface ProductFromAPI {
  id: number;
  price: string;
  sale_price?: string;
}

export default function CheckoutModal() {
  const { items, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();
  const { t, isRTL } = useLanguage();
  const colors = getThemeColors('primary');

  const singleProduct = items.length === 1 ? items[0] : null;

  // Fresh prices state
  const [freshPrices, setFreshPrices] = useState<Map<number, number>>(new Map());
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('0');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'bureau' | 'domicile'>('bureau');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Upsell & multiple units. Default to the 2-pc bundle to lift AOV.
  const [numberOfUnits, setNumberOfUnits] = useState(2);
  const [unitAttributes, setUnitAttributes] = useState<{ size: string; color?: string }[]>([]);

  // Delivery fee function
  const getDeliveryFee = (wilaya: string, method: 'bureau' | 'domicile'): number => {
    if (!wilaya) return method === 'bureau' ? 650 : 800;

    if (wilaya === 'Alger') return 500;

    if (wilaya === 'Boumerdès' || wilaya === 'Tipaza' || wilaya === 'Blida') return 650;

    return method === 'bureau' ? 650 : 800;
  };

  // Calculate fees reactively
  const bureauFee = getDeliveryFee(selectedWilaya, 'bureau');
  const domicileFee = getDeliveryFee(selectedWilaya, 'domicile');

  const availableCities = selectedWilaya
    ? wilayasData.find(w => w.name === selectedWilaya)?.cities || []
    : [];

  // Fetch fresh prices when modal opens
  useEffect(() => {
    if (!isCheckoutOpen || items.length === 0) return;

    const fetchFreshPrices = async () => {
      setIsLoadingPrices(true);
      const newPrices = new Map<number, number>();

      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const allProducts: ProductFromAPI[] = await response.json();
        
        items.forEach(item => {
          const freshProduct = allProducts.find(p => p.id === item.product.id);
          
          if (freshProduct) {
            const priceString = freshProduct.sale_price || freshProduct.price;
            const numericPrice = parseInt(priceString.replace(/\D/g, ''));
            newPrices.set(item.product.id, numericPrice);
            priceCache.set(item.product.id, numericPrice);
          } else {
            const fallbackPrice = parseInt(item.product.price.replace(/\D/g, ''));
            newPrices.set(item.product.id, fallbackPrice);
          }
        });
      } catch (err) {
        items.forEach(item => {
          const fallbackPrice = parseInt(item.product.price.replace(/\D/g, ''));
          newPrices.set(item.product.id, fallbackPrice);
        });
      }

      setFreshPrices(newPrices);
      setIsLoadingPrices(false);
    };

    fetchFreshPrices();
  }, [isCheckoutOpen, items]);

  const getCurrentPrice = useCallback((productId: number, fallbackPrice: string): number => {
    const freshPrice = freshPrices.get(productId);
    if (freshPrice !== undefined) return freshPrice;
    return parseInt(fallbackPrice.replace(/\D/g, ''));
  }, [freshPrices]);

  useEffect(() => {
    if (singleProduct) {
      const initial = Array.from({ length: numberOfUnits }, () => ({
        size: singleProduct.size || 'Default',
        color: singleProduct.color || undefined
      }));
      setUnitAttributes(initial);
    }
  }, [singleProduct, numberOfUnits]);

  const basePrice = singleProduct 
    ? getCurrentPrice(singleProduct.product.id, singleProduct.product.price)
    : 0;

  const getDiscountedPrice = (qty: number) => {
    if (qty === 2) return basePrice * qty - 600;
    if (qty === 3) return basePrice * qty - 900;
    return basePrice * qty;
  };

  const discountedTotalPrice = singleProduct ? getDiscountedPrice(numberOfUnits) : 0;

  const subtotal = singleProduct 
    ? discountedTotalPrice 
    : items.reduce((sum, item) => {
        const itemPrice = getCurrentPrice(item.product.id, item.product.price);
        return sum + itemPrice * item.quantity;
      }, 0);

  const deliveryFee = deliveryMethod === 'bureau' ? bureauFee : domicileFee;
  const total = subtotal + deliveryFee;

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhoneNumber('0');
    setSelectedWilaya('');
    setSelectedCity('');
    setDeliveryMethod('bureau');
    setOrderError(null);
    setPhoneError(null);
    setNumberOfUnits(2);
    setFreshPrices(new Map());
    if (singleProduct) {
      setUnitAttributes([{ size: singleProduct.size || 'Default', color: singleProduct.color || undefined }]);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits.slice(0, 10);
    if (formatted.length > 4) formatted = formatted.slice(0, 4) + ' ' + formatted.slice(4);
    if (formatted.length > 7) formatted = formatted.slice(0, 7) + ' ' + formatted.slice(7);
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '');
    
    if (digits.length === 0) {
      setPhoneNumber('0');
    } else if (digits.length <= 10) {
      const newDigits = digits.startsWith('0') ? digits : '0' + digits.slice(0, 9);
      setPhoneNumber(formatPhoneNumber(newDigits));
    }
    
    if (digits.length >= 10) setPhoneError(null);
  };

  const validatePhone = () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError(t('form.phoneDigits'));
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!firstName || !lastName || !phoneNumber || !selectedWilaya || !selectedCity) {
      setOrderError(t('error.fillFields'));
      return;
    }

    if (!validatePhone()) return;

    if (items.length === 0) {
      setOrderError(t('error.emptyCart'));
      return;
    }

    if (singleProduct && unitAttributes.some(u => !u.size || (singleProduct.product.attributes.some(a => a.name.toLowerCase().includes('color')) && !u.color))) {
      setOrderError(t('error.selectAttributes'));
      return;
    }

    // Track InitiateCheckout event with both Meta and TikTok pixels
    const eventId = generateEventId();
    const contents: TrackingContentItem[] = singleProduct
      ? unitAttributes.map(u => ({
          id: String(singleProduct.product.id),
          quantity: 1,
          item_price: Math.round(discountedTotalPrice / numberOfUnits),
          title: singleProduct.product.name,
          category: singleProduct.product.categories[0]?.name
        }))
      : items.map(item => ({
          id: String(item.product.id),
          quantity: item.quantity,
          item_price: getCurrentPrice(item.product.id, item.product.price),
          title: item.product.name,
          category: item.product.categories[0]?.name
        }));

    try {
      const metaPixel = getMetaPixel();
      metaPixel.initiateCheckout(contents, subtotal, 'DZD', eventId);
      
      const tiktokPixel = getTikTokPixel();
      tiktokPixel.initiateCheckout(contents, subtotal, 'DZD', eventId);
    } catch (error) {
      console.error('Failed to track InitiateCheckout event:', error);
    }

    setIsSubmitting(true);

    const finalDeliveryFee = getDeliveryFee(selectedWilaya, deliveryMethod);

    try {
      const lineItems = singleProduct
        ? unitAttributes.map(u => ({
            product_id: singleProduct.product.id,
            quantity: 1,
            price: Math.round(discountedTotalPrice / numberOfUnits).toString(),
            total: `${Math.round(discountedTotalPrice / numberOfUnits)}.00`,
            meta_data: [
              ...(u.size && u.size !== 'Default' ? [{ key: 'size', value: u.size }] : []),
              ...(u.color ? [{ key: 'color', value: u.color }] : []),
              ...(numberOfUnits > 1 ? [{ key: '_discount_applied', value: numberOfUnits === 2 ? '600DA total' : '900DA total' }] : [])
            ]
          }))
        : items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: getCurrentPrice(item.product.id, item.product.price).toString(),
            total: `${getCurrentPrice(item.product.id, item.product.price) * item.quantity}.00`,
            meta_data: [
              ...(item.size && item.size !== 'Default' ? [{ key: 'size', value: item.size }] : []),
              ...(item.color ? [{ key: 'color', value: item.color }] : [])
            ]
          }));

      const orderData = {
        billing: {
          first_name: firstName,
          last_name: lastName,
          address_1: selectedCity,
          city: selectedCity,
          state: selectedWilaya,
          postcode: '',
          country: 'DZ',
          email: `${phoneNumber.replace(/\D/g, '')}@dripdrop.local`,
          phone: phoneNumber.replace(/\D/g, '')
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          address_1: selectedCity,
          city: selectedCity,
          state: selectedWilaya,
          postcode: '',
          country: 'DZ'
        },
        customer_id: 0,
        line_items: lineItems,
        shipping_lines: [
          {
            method_id: deliveryMethod,
            method_title: deliveryMethod === 'bureau' ? 'Au bureau' : 'À domicile',
            total: finalDeliveryFee.toString()
          }
        ],
        status: 'processing'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.message || 'Order failed');

      // Track Purchase browser-side using the order ID as event ID.
      // This matches the server-side Conversions API event ID for deduplication.
      try {
        const purchaseEventId = String(result.order?.id ?? generateEventId());
        const purchaseValue = result.order?.total ? parseFloat(result.order.total) : subtotal;

        const metaPixelPurchase = getMetaPixel();
        metaPixelPurchase.purchase(contents, purchaseValue, 'DZD', purchaseEventId);

        const tiktokPixelPurchase = getTikTokPixel();
        tiktokPixelPurchase.purchase(contents, purchaseValue, 'DZD', purchaseEventId);
      } catch (trackErr) {
        console.error('Failed to track Purchase event:', trackErr);
      }

      setOrderSubmitted(true);
      clearCart();
    } catch (err: any) {
      setOrderError(err.message || t('error.orderFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReady = !isLoadingPrices;

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !orderSubmitted && !isSubmitting && setIsCheckoutOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-[110] p-4"
          >
            <div className={`bg-white border border-zinc-300 w-full max-w-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative ${isRTL ? 'text-right' : ''}`}>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className={`absolute top-4 text-black text-xl font-bold ${isRTL ? 'left-4' : 'right-4'}`}
                disabled={isSubmitting}
              >
                ×
              </button>

              {!isReady ? (
                <div className="text-center py-8">
                  <div className={`w-12 h-12 border-4 ${colors.border} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
                  <p className="text-gray-400">Loading...</p>
                </div>
              ) : orderSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">{t('product.orderConfirmed')}</h3>
                  <p className="text-gray-600 mb-6">{t('product.contactSoon')}</p>
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setOrderSubmitted(false);
                      resetForm();
                    }}
                    className="w-full py-3 bg-black text-white font-bold uppercase hover:bg-gray-800"
                  >
                    {t('form.close')}
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-black uppercase tracking-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                    {t('product.completeOrder')}
                  </h3>

                  {singleProduct && (
                    <div className="space-y-3 mb-6">
                      {[1, 2, 3].map((qty) => {
                        const fullPriceQty = basePrice * qty;
                        const discountedPrice = getDiscountedPrice(qty);
                        const saveAmount = qty === 1 ? 0 : qty === 2 ? 600 : 900;
                        const perPiece = Math.round(discountedPrice / qty);
                        const isSelected = numberOfUnits === qty;
                        const isPopular = qty === 2;
                        const isBest = qty === 3;
                        const badge = isPopular
                          ? { text: `🔥 ${t('product.mostPopular')}`, className: 'bg-amber-400 text-black' }
                          : isBest
                          ? { text: `💎 ${t('product.bestOption')}`, className: 'bg-black text-amber-300' }
                          : null;

                        return (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => setNumberOfUnits(qty)}
                            className={`relative flex items-center justify-between w-full text-left p-3 ${badge ? 'pt-5' : ''} border-2 rounded-none transition-all ${
                              isSelected
                                ? 'border-black bg-white shadow-[0_2px_0_0_#000]'
                                : 'border-zinc-300 bg-white hover:border-black'
                            }`}
                          >
                            {badge && (
                              <span
                                className={`absolute -top-2.5 ${isRTL ? 'right-3' : 'left-3'} px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider ${badge.className}`}
                              >
                                {badge.text}
                              </span>
                            )}

                            <div className={`flex items-center gap-3 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected ? 'border-black bg-black' : 'border-zinc-300 bg-white'
                                }`}
                              >
                                {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                              </span>

                              <div className="relative w-14 h-14 bg-zinc-100 overflow-hidden flex-shrink-0">
                                <Image
                                  src={singleProduct.product.images[0]?.src || '/placeholder.png'}
                                  alt={singleProduct.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className={`flex flex-col justify-center leading-tight min-w-0 ${isRTL ? 'items-end' : ''}`}>
                                <span
                                  className="text-black font-extrabold text-base uppercase tracking-tight"
                                  style={{ fontFamily: 'var(--font-display)' }}
                                >
                                  {qty} {t('product.pcs')}
                                </span>
                                {qty > 1 && (
                                  <span className="text-xs text-zinc-500 tabular-nums">
                                    {perPiece.toLocaleString()} DA / {t('product.pcs').slice(0, 2)}
                                  </span>
                                )}
                                {saveAmount > 0 && (
                                  <span className="inline-flex w-fit mt-1 px-1.5 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                    ✓ {t('product.save')} {saveAmount.toLocaleString()} DA
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={`flex flex-col justify-center flex-shrink-0 ${isRTL ? 'text-left items-start' : 'text-right items-end'}`}>
                              {saveAmount > 0 && (
                                <span className="text-zinc-400 line-through text-xs tabular-nums">
                                  {fullPriceQty.toLocaleString()} DA
                                </span>
                              )}
                              <span
                                className="text-black font-extrabold text-xl tabular-nums leading-none"
                                style={{ fontFamily: 'var(--font-display)' }}
                              >
                                {discountedPrice.toLocaleString()} DA
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {singleProduct && (
                    <div className="space-y-4 mb-6">
                      {unitAttributes.map((unit, idx) => (
                        <div key={idx} className={`flex gap-3 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-gray-600 w-8">{idx + 1}.</span>
                          <select
                            value={unit.size}
                            onChange={(e) => {
                              const newAttrs = [...unitAttributes];
                              newAttrs[idx] = { ...newAttrs[idx], size: e.target.value };
                              setUnitAttributes(newAttrs);
                            }}
                            className="px-2 py-1 bg-white border border-zinc-300 text-black text-sm rounded-none"
                          >
                            {singleProduct.product.attributes
                              .find((a) => a.name.toLowerCase().includes('size'))
                              ?.options.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                          </select>
                          {singleProduct.product.attributes.find((a) => a.name.toLowerCase().includes('color')) && (
                            <select
                              value={unit.color}
                              onChange={(e) => {
                                const newAttrs = [...unitAttributes];
                                newAttrs[idx] = { ...newAttrs[idx], color: e.target.value };
                                setUnitAttributes(newAttrs);
                              }}
                              className="px-2 py-1 bg-white border border-zinc-300 text-black text-sm rounded-none"
                            >
                              <option value="">Select Color</option>
                              {singleProduct.product.attributes
                                .find((a) => a.name.toLowerCase().includes('color'))
                                ?.options.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {orderError && <p className="text-red-400 mb-4">{orderError}</p>}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        placeholder={t('form.firstName')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-zinc-300 text-black text-sm rounded-none focus:outline-none focus:border-black transition-colors"
                        disabled={isSubmitting}
                      />
                      <input
                        placeholder={t('form.lastName')}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-zinc-300 text-black text-sm rounded-none focus:outline-none focus:border-black transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>

                    <input
                      placeholder={t('form.phone')}
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      onBlur={validatePhone}
                      className={`w-full px-4 py-3.5 bg-white border text-black text-sm rounded-none focus:outline-none focus:border-black transition-colors ${phoneError ? 'border-red-500' : 'border-zinc-300'}`}
                      disabled={isSubmitting}
                    />
                    {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}

                    <select
                      value={selectedWilaya}
                      onChange={(e) => {
                        setSelectedWilaya(e.target.value);
                        setSelectedCity('');
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded"
                      disabled={isSubmitting}
                    >
                      <option value="">{t('form.selectWilaya')}</option>
                      {wilayasData.map((w) => (
                        <option key={w.name} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={!selectedWilaya || isSubmitting}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded"
                    >
                      <option value="">{selectedWilaya ? t('form.selectCity') : t('form.selectCityFirst')}</option>
                      {availableCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      key={`delivery-${selectedWilaya}`}
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value as 'bureau' | 'domicile')}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded"
                      disabled={isSubmitting}
                    >
                      <option key={`bureau-${bureauFee}`} value="bureau">
                        {isRTL 
                          ? `المكتب - ${bureauFee} DA` 
                          : `Au bureau de livraison - ${bureauFee} DA`}
                      </option>
                      <option key={`domicile-${domicileFee}`} value="domicile">
                        {isRTL 
                          ? `التوصيل للمنزل - ${domicileFee} DA` 
                          : `À domicile - ${domicileFee} DA`}
                      </option>
                    </select>

                    <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-none space-y-2">
                      {singleProduct
                        ? unitAttributes.map((u, idx) => (
                            <div key={idx} className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span className="text-gray-700">
                                {singleProduct.product.name} • {u.size}
                                {u.color && ` • ${u.color}`}
                              </span>
                              <span className="text-black font-medium">
                                {Math.round(discountedTotalPrice / numberOfUnits).toLocaleString()} DA
                              </span>
                            </div>
                          ))
                        : items.map((item, idx) => {
                            const itemPrice = getCurrentPrice(item.product.id, item.product.price);
                            return (
                              <div key={idx} className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-gray-700">{item.product.name} × {item.quantity}</span>
                                <span className="text-black font-medium">
                                  {(itemPrice * item.quantity).toLocaleString()} DA
                                </span>
                              </div>
                            );
                          })}
                      <div className={`flex justify-between border-t border-gray-200 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-gray-700">{t('product.delivery')}</span>
                        <span className="text-black font-bold">{deliveryFee.toLocaleString()} DA</span>
                      </div>
                      <div className={`flex justify-between font-bold text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-black">{t('product.total')}</span>
                        <span className="text-black">{total.toLocaleString()} DA</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isLoadingPrices}
                      className="w-full py-4 bg-black text-white font-bold uppercase tracking-[0.12em] text-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? t('form.processing') : t('product.confirmOrder')}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
