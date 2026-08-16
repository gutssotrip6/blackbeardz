// app/api/products/route.ts
// Returns the live product catalog so the client can pull fresh prices whenever
// a checkout surface mounts (see InlineCheckout / CheckoutModal / CartContext).
// Always reads from WooCommerce; never cached at the Next layer.
//
// Optional `?ids=1,2,3` narrows the response to specific products — used by the
// checkout surfaces, which only ever need the items in front of the shopper.

import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductsByIds } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const idsParam = request.nextUrl.searchParams.get('ids');
    const ids = idsParam
      ? idsParam
          .split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(Number.isFinite)
      : null;

    const products = ids && ids.length > 0
      ? await getProductsByIds(ids)
      : await getProducts({ per_page: 100, status: 'publish' });

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
