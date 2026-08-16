'use client';

import { useCallback, useEffect, useState } from 'react';
import { Product } from '@/types/woocommerce';
import { getEffectiveUnitPrice } from '@/lib/pricing';

export interface LivePrice {
  id: number;
  slug: string;
  unitPrice: number;
}

/**
 * Keeps the prices of the given products in sync with WooCommerce.
 *
 * Any price rendered from a server snapshot goes stale the moment the shopper
 * leaves the tab open, restores from bfcache, or comes back to a cart saved in
 * localStorage. This refetches on mount, and again whenever the tab regains
 * focus, so what the shopper sees at checkout is what WooCommerce currently
 * charges.
 *
 * The order route re-prices server-side regardless — this hook exists so the
 * displayed price matches the charged one, not as the enforcement mechanism.
 */
export function useLivePrices(productIds: number[]) {
  const [prices, setPrices] = useState<Map<number, LivePrice>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Stable dependency: the hook is called with a fresh array on every render.
  const idsKey = Array.from(new Set(productIds)).sort((a, b) => a - b).join(',');

  const refresh = useCallback(async () => {
    if (!idsKey) {
      setPrices(new Map());
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?ids=${idsKey}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const products: Product[] = await response.json();
      if (!Array.isArray(products)) throw new Error('Unexpected response');

      setPrices(
        new Map(
          products.map(product => [
            product.id,
            { id: product.id, slug: product.slug, unitPrice: getEffectiveUnitPrice(product) },
          ])
        )
      );
    } catch (error) {
      // Keep whatever we last knew. The order route re-prices server-side, so a
      // failed refresh can never result in the shopper being charged the stale
      // number — at worst the displayed price lags for this render.
      console.error('Failed to refresh live prices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [idsKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // A tab left open across a price change is the most common way a shopper ends
  // up looking at an old number — re-check when they come back to it.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onVisible);
    };
  }, [refresh]);

  return { prices, isLoading, refresh };
}
