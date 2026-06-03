'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { siteConfig } from '@/config/site';

type Locale = 'en' | 'ar';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.store': 'Store',
    'nav.popular': 'Popular',
    
    // Categories
    'category.winter': 'Winter',
    'category.summer': 'Summer',
    'category.shirts': 'Shirts',
    'category.pants': 'Pants',
    
    // Filters
    'filter.all': 'All',
    
    // Product
    'product.size': 'Size',
    'product.color': 'Color',
    'product.addToCart': 'Add to Cart',
    'product.checkout': 'Checkout',
    'product.delivery': 'Delivery',
    'product.total': 'Total',
    'product.confirmOrder': 'Confirm Order',
    'product.mostPopular': 'Most popular',
    'product.bestOption': 'Best option',
    'product.save': 'Save',
    'product.pcs': 'pcs',
    'product.completeOrder': 'Complete Your Order',
    'product.orderConfirmed': 'Order Confirmed!',
    'product.contactSoon': 'We will contact you shortly to confirm your order.',
    'product.viewAll': 'View All Products',
    'product.sale': 'SALE',
    
    // Form
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.phone': 'Phone Number',
    'form.wilaya': 'Wilaya',
    'form.city': 'City',
    'form.selectWilaya': 'Select Wilaya',
    'form.selectCity': 'Select City',
    'form.selectCityFirst': 'Select Wilaya first',
    'form.bureau': 'Au bureau de livraison - 650 DA',
    'form.domicile': 'À domicile - 800 DA',
    'form.processing': 'Processing...',
    'form.close': 'Close',
    'form.phoneRequired': 'Phone number is required',
    'form.phoneDigits': 'Phone number must be at least 8 digits',
    
    // Pagination/Navigation
    'nav.previous': 'Previous',
    'nav.next': 'Next',
    
    // Footer
    'footer.tagline': 'GYM SHOP',
    'footer.collections': 'Collections',
    'footer.shipping': 'Shipping',
    'footer.about': 'About',
    'footer.faq': 'FAQ',
    'footer.contact': 'Contact',
    'footer.copyright': `© 2026 ${siteConfig.name}. Made in Algeria.`,
    
    // Hero
    'hero.marquee': 'ELEVATE YOUR WORKOUT • PREMIUM GYM APPAREL • 24H SHIPPING • NEW COLLECTION AVAILABLE • TRAIN LIKE A BEAST •',
    
    // Store
    'store.search': 'Search products...',
    'store.sort.popular': 'Popular',
    'store.sort.priceLow': 'Price: Low to High',
    'store.sort.priceHigh': 'Price: High to Low',
    'store.sort.newest': 'Newest',
    'store.price': 'Price',
    'store.noProducts': 'No products found.',
    'store.clearFilters': 'Clear all filters',
    'store.showing': 'Showing',
    
    // Cart
    'cart.open': 'Open cart',
    'cart.title': 'Cart',
    'cart.empty': 'Your cart is empty',
    'cart.checkout': 'Checkout',
    'cart.continue': 'Continue Shopping',
    'cart.remove': 'Remove',
    'cart.subtotal': 'Subtotal',
    'cart.deliveryFee': 'Delivery Fee',
    'cart.total': 'Total',
    
    // Errors
    'error.fillFields': 'Please fill all required fields',
    'error.emptyCart': 'Your cart is empty',
    'error.selectAttributes': 'Please select size and color for all units',
    'error.orderFailed': 'Failed to submit order.'
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.store': 'المتجر',
    'nav.popular': 'الأكثر شهرة',
    
    // Categories
    'category.winter': 'شتاء',
    'category.summer': 'صيف',
    'category.shirts': 'قمصان',
    'category.pants': 'سراويل',
    
    // Filters
    'filter.all': 'الكل',
    
    // Product
    'product.size': 'المقاس',
    'product.color': 'اللون',
    'product.addToCart': 'أضف إلى السلة',
    'product.checkout': 'إتمام الشراء',
    'product.delivery': 'التوصيل',
    'product.total': 'المجموع',
    'product.confirmOrder': 'تأكيد الطلب',
    'product.mostPopular': 'الأكثر شهرة',
    'product.bestOption': 'الأفضل قيمة',
    'product.save': 'وفر',
    'product.pcs': 'قطع',
    'product.completeOrder': 'إتمام طلبك',
    'product.orderConfirmed': 'تم تأكيد الطلب!',
    'product.contactSoon': 'سنتصل بك قريباً لتأكيد طلبك.',
    'product.viewAll': 'عرض جميع المنتجات',
    'product.sale': 'تخفيض',
    
    // Form
    'form.firstName': 'الاسم',
    'form.lastName': 'اللقب',
    'form.phone': 'رقم الهاتف',
    'form.wilaya': 'الولاية',
    'form.city': 'البلدية',
    'form.selectWilaya': 'اختر الولاية',
    'form.selectCity': 'اختر البلدية',
    'form.selectCityFirst': 'اختر الولاية أولاً',
    'form.bureau': 'مكتب التوصيل - 650 دج',
    'form.domicile': 'توصيل للمنزل - 800 دج',
    'form.processing': 'جاري المعالجة...',
    'form.close': 'إغلاق',
    'form.phoneRequired': 'رقم الهاتف مطلوب',
    'form.phoneDigits': 'رقم الهاتف يجب أن يكون 8 أرقام على الأقل',
    
    // Pagination/Navigation
    'nav.previous': 'السابق',
    'nav.next': 'التالي',
    
    // Footer
    'footer.tagline': 'متجرك الجزائري المفضل',
    'footer.collections': 'المجموعات',
    'footer.shipping': 'الشحن',
    'footer.about': 'من نحن',
    'footer.faq': 'الأسئلة الشائعة',
    'footer.contact': 'اتصل بنا',
    'footer.copyright': `© 2026 ${siteConfig.name}. صنع في الجزائر.`,
    
    // Hero
    'hero.marquee': 'ارتقِ بتدريبك • ملابس رياضية مميزة • توصيل مجاني خلال 24 ساعة • كوليكشن جديد متاح •',
    
    // Store
    'store.search': 'البحث عن منتجات...',
    'store.sort.popular': 'الأكثر شهرة',
    'store.sort.priceLow': 'السعر: من الأقل للأعلى',
    'store.sort.priceHigh': 'السعر: من الأعلى للأقل',
    'store.sort.newest': 'الأحدث',
    'store.price': 'السعر',
    'store.noProducts': 'لم يتم العثور على منتجات.',
    'store.clearFilters': 'مسح جميع الفلاتر',
    'store.showing': 'عرض',
    
    // Cart
    'cart.open': 'فتح السلة',
    'cart.title': 'السلة',
    'cart.empty': 'سلة التسوق فارغة',
    'cart.checkout': 'إتمام الشراء',
    'cart.continue': 'مواصلة التسوق',
    'cart.remove': 'إزالة',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.deliveryFee': 'رسوم التوصيل',
    'cart.total': 'المجموع',
    
    // Errors
    'error.fillFields': 'يرجى ملء جميع الحقول المطلوبة',
    'error.emptyCart': 'سلة التسوق فارغة',
    'error.selectAttributes': 'يرجى اختيار المقاس واللون لجميع القطع',
    'error.orderFailed': 'فشل في إرسال الطلب.'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLocaleState(saved);
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  const t = (key: string): string => {
    return translations[locale][key as keyof typeof translations.en] || key;
  };

  const isRTL = locale === 'ar';

  // Always render the Provider - never return early!
  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
