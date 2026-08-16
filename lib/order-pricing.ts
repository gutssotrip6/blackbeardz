// lib/order-pricing.ts
//
// Server-side authoritative pricing for orders.
//
// This is the guarantee that a price edit in WooCommerce can never be undercut
// by a stale client: whatever `price`/`total` the browser sent is discarded and
// recomputed from live catalog data. It covers every case the client cannot —
// a tab left open across a price change, a cart restored from localStorage
// weeks later, a bfcache restore, a cached HTML response, or a hand-crafted
// request.

import { Product } from '@/types/woocommerce';
import { getBundlePrice, getEffectiveUnitPrice, splitBundleTotal } from '@/lib/pricing';

export interface IncomingLineItem {
  product_id: number;
  quantity?: number;
  price?: string;
  total?: string;
  meta_data?: { key: string; value: string }[];
  [key: string]: unknown;
}

export interface RepriceResult {
  lineItems: IncomingLineItem[];
  warning: string | null;
}

/**
 * Recomputes every line item's price from live product data.
 *
 * Line items are grouped by product so the bundle discount applies to the
 * shopper's real total quantity — the checkout sends N separate qty-1 lines for
 * a bundle, and pricing each in isolation would miss the discount entirely.
 *
 * If the live catalog can't be reached, the client's values are kept rather
 * than dropping the order — this is a COD store, and a lost order costs more
 * than a rare stale one. Those orders carry a note so they can be spotted.
 *
 * @param fetchProducts injected so this is testable without a live store
 */
export async function repriceLineItems(
  lineItems: IncomingLineItem[],
  fetchProducts: (ids: number[]) => Promise<Product[]>
): Promise<RepriceResult> {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return { lineItems: lineItems || [], warning: null };
  }

  let liveProducts: Product[];
  try {
    liveProducts = await fetchProducts(lineItems.map(item => Number(item.product_id)));
  } catch (error) {
    console.error('Repricing failed — could not reach WooCommerce:', error);
    return {
      lineItems,
      warning: 'Prix non revalidés (catalogue injoignable) — à vérifier manuellement.',
    };
  }

  const productsById = new Map(liveProducts.map(product => [product.id, product]));

  // Total quantity per product decides which bundle tier applies.
  const quantityByProduct = new Map<number, number>();
  for (const item of lineItems) {
    const id = Number(item.product_id);
    quantityByProduct.set(id, (quantityByProduct.get(id) || 0) + (Number(item.quantity) || 1));
  }

  // Authoritative per-unit prices, split so they sum exactly to the bundle
  // total (rounding each unit independently would drift off the shown total).
  const unitPricesByProduct = new Map<number, number[]>();
  for (const [productId, totalQty] of quantityByProduct) {
    const product = productsById.get(productId);
    if (!product) continue;

    const bundleTotal = getBundlePrice(product.slug, getEffectiveUnitPrice(product), totalQty);
    unitPricesByProduct.set(productId, splitBundleTotal(bundleTotal, totalQty));
  }

  const missing: number[] = [];

  const repriced = lineItems.map(item => {
    const id = Number(item.product_id);
    const quantity = Number(item.quantity) || 1;
    const remainingUnits = unitPricesByProduct.get(id);

    if (!remainingUnits) {
      // Product no longer in the catalog (unpublished, deleted, or bad id).
      if (!missing.includes(id)) missing.push(id);
      return item;
    }

    // Take this line's share off the front of the split.
    const units = remainingUnits.splice(0, quantity);
    const lineTotal = units.reduce((sum, unit) => sum + unit, 0);
    const unitPrice = quantity > 0 ? lineTotal / quantity : 0;

    return {
      ...item,
      price: String(unitPrice),
      subtotal: lineTotal.toFixed(2),
      total: lineTotal.toFixed(2),
    };
  });

  return {
    lineItems: repriced,
    warning: missing.length
      ? `Prix non revalidés pour le(s) produit(s) ${missing.join(', ')} — introuvable(s) dans le catalogue.`
      : null,
  };
}
