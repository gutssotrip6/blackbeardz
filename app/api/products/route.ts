// app/api/products/route.ts
// Returns the live product catalog for the client to pull fresh prices when
// the checkout opens (see CheckoutModal). Always reads from WooCommerce; never
// cached at the Next layer.

import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = await getProducts({ per_page: 100, status: 'publish' });
    return NextResponse.json(products, {
      headers: {
        // Belt and braces — also tell any CDN in front of us not to cache.
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('GET /api/products failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
