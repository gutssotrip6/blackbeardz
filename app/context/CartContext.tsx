'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/woocommerce';
import { getMetaPixel } from '@/lib/meta-pixel';
import { getTikTokPixel } from '@/lib/tiktok-pixel';
import { generateEventId, extractPriceValue } from '@/lib/tracking-utils';
import { TrackingContentItem } from '@/types/tracking';
import { siteConfig } from '@/config/site';

export interface CartItem {
  product: Product;
  size: string;
  color?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color?: string) => void;
  removeItem: (productId: number, size: string, color?: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalItems: number;
  totalPrice: number;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`${siteConfig.name.toLowerCase()}-cart`);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`${siteConfig.name.toLowerCase()}-cart`, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (product: Product, size: string, color?: string) => {
    setItems(current => {
      const existing = current.find(
        item => item.product.id === product.id && 
                item.size === size && 
                item.color === color
      );

      if (existing) {
        return current.map(item =>
          item.product.id === product.id && 
          item.size === size && 
          item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const newItem = { product, size, color, quantity: 1 };
      
      // Track AddToCart event with both Meta and TikTok pixels
      const eventId = generateEventId();
      const price = extractPriceValue(product.price);
      const contentItem: TrackingContentItem = {
        id: String(product.id),
        quantity: 1,
        item_price: price,
        title: product.name,
        category: product.categories[0]?.name
      };

      try {
        const metaPixel = getMetaPixel();
        metaPixel.addToCart([contentItem], price, 'DZD', eventId);
        
        const tiktokPixel = getTikTokPixel();
        tiktokPixel.addToCart([contentItem], price, 'DZD', eventId);
      } catch (error) {
        console.error('Failed to track AddToCart event:', error);
      }

      return [...current, newItem];
    });
  };

  const removeItem = (productId: number, size: string, color?: string) => {
    setItems(current =>
      current.filter(
        item => !(item.product.id === productId && 
                  item.size === size && 
                  item.color === color)
      )
    );
  };

  const updateQuantity = (productId: number, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }

    setItems(current =>
      current.map(item =>
        item.product.id === productId && 
        item.size === size && 
        item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce((sum, item) => {
    const price = parseInt(item.product.price.replace(/\D/g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        totalItems,
        totalPrice,
        isCheckoutOpen,
        setIsCheckoutOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}