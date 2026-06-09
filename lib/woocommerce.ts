// lib/woocommerce.ts
import { WooProduct, WooCategory, Product, OrderData } from '@/types/woocommerce';

function formatPrice(price: string): string {
  const num = parseFloat(price) || 0;
  return `${Math.round(num).toLocaleString()} DA`;
}

export function transformProduct(wcProduct: WooProduct): Product {
  return {
    id: wcProduct.id,
    name: wcProduct.name,
    slug: wcProduct.slug,
    price: formatPrice(wcProduct.regular_price || wcProduct.price),
    sale_price: wcProduct.on_sale && wcProduct.sale_price ? formatPrice(wcProduct.sale_price) : null,
    description: wcProduct.description || '',
    short_description: wcProduct.short_description || '',
    categories: wcProduct.categories.map(cat => ({ id: cat.id, name: cat.name, slug: cat.slug })),
    images: wcProduct.images.length > 0 ? wcProduct.images.map(img => ({ id: img.id, src: img.src, alt: img.alt || wcProduct.name })) : [{ id: 0, src: '/placeholder.png', alt: wcProduct.name }],
    attributes: wcProduct.attributes.map(attr => ({ name: attr.name, options: attr.options, slug: (attr as any).slug || attr.name.toLowerCase().replace(/\s+/g, '-') })),
    stock_status: wcProduct.stock_status,
    stock_quantity: wcProduct.stock_quantity || 0
  };
}

export function transformProducts(wcProducts: WooProduct[]): Product[] {
  return wcProducts.map(transformProduct);
}

const API_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const CONSUMER_KEY = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET;

async function wooFetch(endpoint: string, params: Record<string, string> = {}, timeoutMs = 10000): Promise<any> {
  const queryParams = new URLSearchParams({
    consumer_key: CONSUMER_KEY || '',
    consumer_secret: CONSUMER_SECRET || '',
    ...params
  });
  
  const url = `${API_URL}/wp-json/wc/v3/${endpoint}?${queryParams.toString()}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      // Always pull live prices/stock from WooCommerce. Without this, Next.js
      // server-side caches the response indefinitely (default fetch cache),
      // so price/stock edits in WP admin wouldn't show until the next deploy.
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function getProducts(params?: any): Promise<Product[]> {
  try {
    const queryParams: Record<string, string> = {
      per_page: String(params?.per_page || 100),
      status: params?.status || 'publish'
    };
    if (params?.category) queryParams.category = String(params.category);
    if (params?.search) queryParams.search = params.search;
    
    const data = await wooFetch('products', queryParams, 15000);
    return transformProducts(data);
  } catch (error) {
    console.error('getProducts error:', error);
    return []; // Return empty so page doesn't hang
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await wooFetch('products', { slug }, 10000);
    return data[0] ? transformProduct(data[0]) : null;
  } catch (error) {
    console.error('getProductBySlug error:', error);
    return null;
  }
}

export async function createOrder(orderData: OrderData): Promise<any> {
  const queryParams = new URLSearchParams({
    consumer_key: CONSUMER_KEY || '',
    consumer_secret: CONSUMER_SECRET || ''
  });

  const url = `${API_URL}/wp-json/wc/v3/orders?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...orderData, status: 'pending', payment_method: 'cod', payment_method_title: 'Paiement à la livraison' })
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function getCategories(): Promise<WooCategory[]> {
  try {
    const queryParams: Record<string, string> = {
      per_page: '100',
      hide_empty: 'true'
    };
    const data = await wooFetch('products/categories', queryParams, 10000);
    return data;
  } catch (error) {
    console.error('getCategories error:', error);
    return [];
  }
}