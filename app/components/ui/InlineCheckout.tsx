'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/types/woocommerce';
import { useLanguage } from '@/app/context/LanguageContext';
import { wilayasData } from '@/app/data/wilayas-data';
import { getMetaPixel } from '@/lib/meta-pixel';
import { getTikTokPixel } from '@/lib/tiktok-pixel';
import { generateEventId } from '@/lib/tracking-utils';
import { TrackingContentItem } from '@/types/tracking';

interface InlineCheckoutProps {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  disabled?: boolean;
}

export default function InlineCheckout({ product, selectedSize, selectedColor, disabled }: InlineCheckoutProps) {
  const { t, isRTL } = useLanguage();
  const inputClass = 'w-full px-4 py-3.5 bg-white border border-zinc-300 text-black text-sm rounded-none focus:outline-none focus:border-black transition-colors';
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

  // Upsell & multiple units
  const [numberOfUnits, setNumberOfUnits] = useState(1);
  const [unitAttributes, setUnitAttributes] = useState<{ size: string; color?: string }[]>([]);

  // Delivery fee function (matches CheckoutModal)
  const getDeliveryFee = (wilaya: string, method: 'bureau' | 'domicile'): number => {
    if (!wilaya) return method === 'bureau' ? 650 : 800;

    if (wilaya === 'Alger') return 500;

    if (wilaya === 'Boumerdès' || wilaya === 'Tipaza' || wilaya === 'Blida') return 650;

    return method === 'bureau' ? 650 : 800;
  };

  // Calculate fees reactively (matches CheckoutModal)
  const bureauFee = getDeliveryFee(selectedWilaya, 'bureau');
  const domicileFee = getDeliveryFee(selectedWilaya, 'domicile');

  const availableCities = selectedWilaya
    ? wilayasData.find(w => w.name === selectedWilaya)?.cities || []
    : [];

  // Initialize and sync unitAttributes with parent selections
  useEffect(() => {
    setUnitAttributes(prev => {
      const newAttrs = Array.from({ length: numberOfUnits }, (_, idx) => {
        if (idx === 0) {
          return {
            size: selectedSize || prev[0]?.size || 'Default',
            color: selectedColor || prev[0]?.color || undefined
          };
        }
        return {
          size: prev[idx]?.size || selectedSize || 'Default',
          color: prev[idx]?.color || selectedColor || undefined
        };
      });
      return newAttrs;
    });
  }, [numberOfUnits, selectedSize, selectedColor]);

  const basePrice = parseInt(product.price.replace(/\D/g, ''));

  // Calculate prices based on fixed discounts
  const getDiscountedPrice = (qty: number) => {
    if (qty === 2) return basePrice * qty - 600;
    if (qty === 3) return basePrice * qty - 900;
    return basePrice * qty;
  };

  const discountedTotalPrice = getDiscountedPrice(numberOfUnits);
  const subtotal = discountedTotalPrice;
  const deliveryFee = deliveryMethod === 'bureau' ? bureauFee : domicileFee;
  const total = subtotal + deliveryFee;

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits.slice(0, 10);
    if (formatted.length > 4) formatted = formatted.slice(0, 4) + ' ' + formatted.slice(4);
    if (formatted.length > 7) formatted = formatted.slice(0, 7) + ' ' + formatted.slice(7);
    if (formatted.length > 10) formatted = formatted.slice(0, 10) + ' ' + formatted.slice(10);
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

    if (unitAttributes.some(u => !u.size || (product.attributes.some(a => a.name.toLowerCase().includes('color')) && !u.color))) {
      setOrderError(t('error.selectAttributes'));
      return;
    }

    if (!firstName || !lastName || !phoneNumber || !selectedWilaya || !selectedCity) {
      setOrderError(t('error.fillFields'));
      return;
    }

    if (!validatePhone()) return;

    const eventId = generateEventId();
    const contents: TrackingContentItem[] = unitAttributes.map(u => ({
      id: String(product.id),
      quantity: 1,
      item_price: Math.round(discountedTotalPrice / numberOfUnits),
      title: product.name,
      category: product.categories[0]?.name
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

    try {
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
        line_items: unitAttributes.map(u => ({
          product_id: product.id,
          quantity: 1,
          price: Math.round(discountedTotalPrice / numberOfUnits).toString(),
          total: `${Math.round(discountedTotalPrice / numberOfUnits)}.00`,
          meta_data: [
            ...(u.size && u.size !== 'Default' ? [{ key: 'size', value: u.size }] : []),
            ...(u.color ? [{ key: 'color', value: u.color }] : []),
            ...(numberOfUnits > 1 ? [{ key: '_discount_applied', value: numberOfUnits === 2 ? '600DA total' : '900DA total' }] : [])
          ]
        })),
        shipping_lines: [
          {
            method_id: deliveryMethod,
            method_title: deliveryMethod === 'bureau' ? 'Au bureau' : 'À domicile',
            total: deliveryFee.toString()
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
    } catch (err: any) {
      setOrderError(err.message || t('error.orderFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-3xl mx-auto bg-white border border-zinc-300 p-5 md:p-7 ${isRTL ? 'text-right' : ''}`}>
      <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-8 uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {t('product.checkout')}
      </h2>

      {orderSubmitted ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-black mb-2">{t('product.orderConfirmed')}</h3>
          <p className="text-gray-600">{t('product.contactSoon')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* UPSALE SECTION */}
          <div className="space-y-4 mb-6">
            {[1, 2, 3].map((qty) => {
              const fullPriceQty = basePrice * qty;
              const discountedPrice = getDiscountedPrice(qty);
              const label = qty === 2 ? t('product.mostPopular') : qty === 3 ? t('product.bestOption') : '';
              const saveAmount = qty === 1 ? 0 : qty === 2 ? 600 : 900;

              return (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setNumberOfUnits(qty)}
                  className={`flex items-center justify-between p-3 border rounded-none w-full transition-colors ${
                    numberOfUnits === qty ? 'border-black bg-zinc-50' : 'border-zinc-300 hover:border-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 bg-zinc-100 overflow-hidden">
                      <Image
                        src={product.images[0]?.src || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-black font-bold">{qty} {t('product.pcs')}</span>
                      {saveAmount > 0 && <span className="text-sm font-semibold text-black underline decoration-1 underline-offset-2">{t('product.save')} {saveAmount.toLocaleString()}DA</span>}
                    </div>
                  </div>
                  <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                    {label && <p className="text-xs text-gray-700 font-bold">{label}</p>}
                    {saveAmount > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-gray-500 line-through text-sm">{fullPriceQty.toLocaleString()} DA</span>
                        <span className="text-black font-bold text-lg">{discountedPrice.toLocaleString()} DA</span>
                      </div>
                    ) : (
                      <p className="text-black font-bold text-lg">{discountedPrice.toLocaleString()} DA</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ATTRIBUTE SELECTORS */}
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
                  className="px-2 py-1 bg-white border border-zinc-300 text-black rounded-none text-sm"
                >
                  {product.attributes
                    .find((a) => a.name.toLowerCase().includes('size'))
                    ?.options.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    )) || <option value="Default">Default</option>}
                </select>
                {product.attributes.find((a) => a.name.toLowerCase().includes('color')) && (
                  <select
                    value={unit.color || ''}
                    onChange={(e) => {
                      const newAttrs = [...unitAttributes];
                      newAttrs[idx] = { ...newAttrs[idx], color: e.target.value || undefined };
                      setUnitAttributes(newAttrs);
                    }}
                    className="px-2 py-1 bg-white border border-zinc-300 text-black rounded-none text-sm"
                  >
                    <option value="">{t('product.color')}</option>
                    {product.attributes
                      .find((a) => a.name.toLowerCase().includes('color'))
                      ?.options.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* FIRST + LAST NAME */}
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder={t('form.firstName')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
              disabled={isSubmitting}
            />
            <input
              placeholder={t('form.lastName')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              disabled={isSubmitting}
            />
          </div>

          {/* PHONE */}
          <input
            placeholder={t('form.phone')}
            value={phoneNumber}
            onChange={handlePhoneChange}
            onBlur={validatePhone}
            className={`${inputClass} ${phoneError ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {phoneError && <p className="text-red-600 text-xs mt-1">{phoneError}</p>}

          {/* WILAYA */}
          <select
            value={selectedWilaya}
            onChange={(e) => { setSelectedWilaya(e.target.value); setSelectedCity(''); }}
            className={inputClass}
            disabled={isSubmitting}
          >
            <option value="">{t('form.selectWilaya')}</option>
            {wilayasData.map((w) => <option key={w.name} value={w.name}>{w.name}</option>)}
          </select>

          {/* CITY */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedWilaya || isSubmitting}
            className={inputClass}
          >
            <option value="">{selectedWilaya ? t('form.selectCity') : t('form.selectCityFirst')}</option>
            {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* DELIVERY OPTION */}
          <select
            key={`delivery-${selectedWilaya}`}
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value as 'bureau' | 'domicile')}
            className={inputClass}
            disabled={isSubmitting}
          >
            <option value="bureau">
              {isRTL 
                ? `المكتب - ${bureauFee} DA` 
                : `Au bureau de livraison - ${bureauFee} DA`}
            </option>
            <option value="domicile">
              {isRTL 
                ? `التوصيل للمنزل - ${domicileFee} DA` 
                : `À domicile - ${domicileFee} DA`}
            </option>
          </select>

          {/* ORDER SUMMARY */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-none space-y-2">
            {unitAttributes.map((u, idx) => (
              <div key={idx} className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-700">
                  {product.name} • {u.size}
                  {u.color && ` • ${u.color}`}
                </span>
                <span className="text-black font-medium">
                  {Math.round(discountedTotalPrice / numberOfUnits).toLocaleString()} DA
                </span>
              </div>
            ))}
            <div className={`flex justify-between border-t border-gray-200 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-700">{t('product.delivery')}</span>
              <span className="text-black font-bold">{deliveryFee.toLocaleString()} DA</span>
            </div>
            <div className={`flex justify-between font-bold text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-black">{t('product.total')}</span>
              <span className="text-black">{total.toLocaleString()} DA</span>
            </div>
          </div>

          {orderError && <p className="text-red-600">{orderError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 bg-black text-white font-bold uppercase tracking-[0.12em] text-sm hover:bg-zinc-800 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? t('form.processing') : t('product.confirmOrder')}
          </button>
        </form>
      )}
    </div>
  );
}
