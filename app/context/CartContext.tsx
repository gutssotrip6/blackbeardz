'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/woocommerce';
import { getMetaPixel } from '@/lib/meta-pixel';
import { getTikTokPixel } from '@/lib/tiktok-pixel';
import { generateEventId } from '@/lib/tracking-utils';
import { getEffectiveUnitPrice } from '@/lib/pricing';
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

  // A cart in localStorage is a snapshot of the catalog from whenever the item
  // was added — it can be days old and its price long since changed in
  // WooCommerce. Re-pull the live product for every cart line so the drawer and
  // the checkout never show a price the store no longer charges.
  useEffect(() => {
    if (!isLoaded || items.length === 0) return;

    const ids = Array.from(new Set(items.map(item => item.product.id)));
    let cancelled = false;

    const refreshCartProducts = async () => {
      try {
        const response = await fetch(`/api/products?ids=${ids.join(',')}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const fresh: Product[] = await response.json();
        if (cancelled || !Array.isArray(fresh) || fresh.length === 0) return;

        const freshById = new Map(fresh.map(product => [product.id, product]));
        setItems(current => {
          let changed = false;
          const next = current.map(item => {
            const live = freshById.get(item.product.id);
            if (!live || JSON.stringify(live) === JSON.stringify(item.product)) return item;
            changed = true;
            return { ...item, product: live };
          });
          return changed ? next : current;
        });
      } catch (error) {
        console.error('Failed to refresh cart products:', error);
      }
    };

    refreshCartProducts();
    return () => { cancelled = true; };
    // Runs on mount and whenever the set of products in the cart changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, items.map(item => item.product.id).sort((a, b) => a - b).join(',')]);

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
      const price = getEffectiveUnitPrice(product);
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
  
  const totalPrice = items.reduce(
    (sum, item) => sum + getEffectiveUnitPrice(item.product) * item.quantity,
    0
  );

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