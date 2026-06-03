// types/woocommerce.ts
// TYPES ONLY - No API code here

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  categories: WooCategory[];
  images: WooImage[];
  attributes: WooAttribute[];
  type: 'simple' | 'variable' | 'grouped' | 'external';
  sku?: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image?: {
    id: number;
    src: string;
    alt: string;
  } | null;
}

export interface WooImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooAttribute {
  id: number;
  name: string;
  slug?: string; // Added optional slug
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  sale_price: string | null;
  description: string;
  short_description: string;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  images: {
    id: number;
    src: string;
    alt: string;
  }[];
  attributes: {
    name: string;
    options: string[];
    slug?: string; // Added optional slug
  }[];
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number;
}

export interface CartItem {
  product: Product;
  size: string;
  color?: string;
  quantity: number;
}

export interface OrderData {
  billing: {
    first_name: string;
    last_name: string;
    email?: string;
    phone: string;
    address_1?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  shipping?: {
    first_name: string;
    last_name: string;
    address_1?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  line_items: {
    product_id: number;
    quantity: number;
    variation_id?: number;
    meta_data?: { key: string; value: string }[];
  }[];
  shipping_lines?: {
    method_id: string;
    method_title: string;
    total: string;
  }[];
  customer_note?: string;
  status?: 'pending' | 'processing' | 'on-hold';
}