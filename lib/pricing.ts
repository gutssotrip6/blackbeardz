// lib/pricing.ts
//
// SINGLE SOURCE OF TRUTH FOR PRICE MATH.
//
// Every price shown to a shopper and every price written onto an order must
// come from here. The rule is simple and non-negotiable:
//
//   the only authority on what a product costs is WooCommerce
//
// Never hardcode an absolute price in this file (or anywhere else). A hardcoded
// price silently overrides the WooCommerce value, so the product page shows the
// new price while the checkout keeps charging the old one. Bundle deals are
// expressed as DISCOUNTS off the live price, never as fixed totals, precisely so
// a price edit in WP admin flows through to every surface at once.

import { Product } from '@/types/woocommerce';

/**
 * Turns any price representation into whole dinars.
 *
 * Handles both shapes that exist in this codebase:
 *   - raw WooCommerce values: "3700", "3700.00"
 *   - display values built by transformProduct: "3,700 DA", "3 700 DA"
 */
export function parsePriceValue(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : 0;

  const raw = value.trim();
  if (!raw) return 0;

  // Raw WooCommerce numbers are plain — no thousands separators, optional decimals.
  if (/^\d+(\.\d+)?$/.test(raw)) return Math.round(parseFloat(raw));

  // Display strings: strip currency, spaces and thousands separators.
  const digits = raw.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

type PricedProduct = Pick<Product, 'price'> & { sale_price?: string | null };

/**
 * The price a shopper actually pays for ONE unit, in whole dinars.
 *
 * A product on sale is charged at its sale price — the product page has always
 * displayed `sale_price || price`, so the checkout must agree or the shopper is
 * quoted one number and billed another.
 */
export function getEffectiveUnitPrice(product: PricedProduct): number {
  const sale = parsePriceValue(product.sale_price ?? null);
  if (sale > 0) return sale;
  return parsePriceValue(product.price);
}

// ---------------------------------------------------------------------------
// Bundle pricing
// ---------------------------------------------------------------------------

/** Default multi-unit savings, in DA off the bundle total. */
const DEFAULT_BUNDLE_DISCOUNTS: Record<number, number> = {
  2: 600,
  3: 900,
};

/**
 * Per-product bundle savings, in DA off the bundle total.
 *
 * DISCOUNTS ONLY — never absolute totals. The base unit price always comes from
 * WooCommerce, so editing the price in WP admin immediately moves every bundle
 * tier with it while keeping the advertised saving intact.
 */
const PRODUCT_BUNDLE_DISCOUNTS: Record<string, Record<number, number>> = {
  // Was previously a fixed table {1: 3700, 2: 6400, 3: 9000} against a 3700 DA
  // base — i.e. save 1000 DA on 2 pcs, 2100 DA on 3 pcs. Kept as savings so the
  // deal survives a price change instead of freezing the price.
  'onyx-gym-shark': { 2: 1000, 3: 2100 },
};

/** How many DA the shopper saves by taking `qty` units. */
export function getBundleDiscount(slug: string | undefined, qty: number): number {
  const table = (slug && PRODUCT_BUNDLE_DISCOUNTS[slug]) || DEFAULT_BUNDLE_DISCOUNTS;
  return table[qty] ?? 0;
}

/** Total price for `qty` units of a product, bundle savings applied. */
export function getBundlePrice(slug: string | undefined, basePrice: number, qty: number): number {
  const gross = basePrice * qty;
  return Math.max(0, gross - getBundleDiscount(slug, qty));
}

/**
 * Splits a bundle total across `qty` units so the parts always sum back to the
 * total exactly. Rounding each unit independently loses or gains dinars, which
 * makes the WooCommerce order total disagree with the total the shopper saw.
 */
export function splitBundleTotal(total: number, qty: number): number[] {
  if (qty <= 0) return [];
  const base = Math.floor(total / qty);
  const remainder = total - base * qty;
  return Array.from({ length: qty }, (_, i) => (i < remainder ? base + 1 : base));
}
