// app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import ProductClient from '../../components/product/ProductClient';
import { getProductBySlug, getProducts } from '@/lib/woocommerce';

// Generate static pages for all products at build time (optional but recommended)
export async function generateStaticParams() {
  try {
    const products = await getProducts({ per_page: 100 });
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

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
