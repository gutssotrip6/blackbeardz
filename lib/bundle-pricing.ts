// Per-product fixed bundle prices (DA). Overrides the generic -600/-900 discount.
const PRODUCT_BUNDLE_OVERRIDES: Record<string, Record<1 | 2 | 3, number>> = {
  'onyx-gym-shark': { 1: 3700, 2: 6400, 3: 9000 },
};

export function getBundlePrice(slug: string | undefined, basePrice: number, qty: number): number {
  const override = slug ? PRODUCT_BUNDLE_OVERRIDES[slug] : undefined;
  if (override && (qty === 1 || qty === 2 || qty === 3)) return override[qty as 1 | 2 | 3];

  if (qty === 2) return basePrice * qty - 600;
  if (qty === 3) return basePrice * qty - 900;
  return basePrice * qty;
}
