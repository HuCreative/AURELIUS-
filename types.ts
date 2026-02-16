
export type CategorySlug = 'shoes' | 'wallets' | 'belts' | 'sunglasses' | 'bracelets';

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: CategorySlug;
  images: string[];
  description: string;
  details: string[];
  materials: string;
  isBestseller?: boolean;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  status: 'pending' | 'published';
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  paymentMethod: 'cod' | 'card';
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}
