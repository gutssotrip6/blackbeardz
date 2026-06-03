// lib/transform.ts
import { WooProduct, Product } from '@/types/woocommerce';

export function transformProduct(wcProduct: WooProduct): Product {
  const formatPrice = (price: string) => {
    const num = parseFloat(price) || 0;
    return `${Math.round(num).toLocaleString()} DA`;
  };

  return {
    id: wcProduct.id,
    name: wcProduct.name,
    slug: wcProduct.slug,
    price: formatPrice(wcProduct.regular_price || wcProduct.price),
    sale_price: wcProduct.on_sale && wcProduct.sale_price
      ? formatPrice(wcProduct.sale_price)
      : null,
    description: wcProduct.description || '',
    short_description: wcProduct.short_description || '',
    categories: wcProduct.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug
    })),
    images: wcProduct.images.length > 0
      ? wcProduct.images.map(img => ({
          id: img.id,
          src: img.src,
          alt: img.alt || wcProduct.name
        }))
      : [{ id: 0, src: '/placeholder.png', alt: wcProduct.name }],
    attributes: wcProduct.attributes.map(attr => ({
      name: attr.name,
      options: attr.options
    })),
    stock_status: wcProduct.stock_status,
    stock_quantity: wcProduct.stock_quantity || 0
  };
}

export function transformProducts(wcProducts: WooProduct[]): Product[] {
  return wcProducts.map(transformProduct);
}