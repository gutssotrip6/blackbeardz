// app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import ProductClient from '../../components/product/ProductClient';
import { getProductBySlug, getProducts } from '@/lib/woocommerce';

// Always render per-request so price/stock changes in WooCommerce appear
// immediately, without a redeploy. Combined with cache: 'no-store' in
// wooFetch, every page hit fetches fresh data from the WooCommerce API.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found | Blackbear ',
    };
  }

  return {
    title: `${product.name} | Blackbear`,
    description: product.short_description?.replace(/<[^>]*>/g, '').slice(0, 160) || 
                 product.description?.replace(/<[^>]*>/g, '').slice(0, 160) || 
                 'Shop the best products at Blackbear',
  };
}

// Server Component - fetches data before sending to browser
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  // Return proper 404 if product not found
  if (!product) {
    notFound();
  }

  // Fetch related products
  let popularProducts: typeof product[] = [];
  try {
    const allProducts = await getProducts();
    popularProducts = allProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch popular products:', error);
    // Continue without popular products if fetch fails
  }

  return (
    <ProductClient
      product={product}
      popularProducts={popularProducts}
    />
  );
}
