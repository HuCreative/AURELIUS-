
import { Product, FAQItem } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'oxford-brogue-onyx',
    name: 'Onyx Oxford Brogues',
    price: 349,
    category: 'shoes',
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'The pinnacle of formal footwear. Handcrafted from premium Italian calfskin with traditional brogue detailing.',
    details: ['Full-grain leather upper', 'Blake-stitched construction', 'Soft leather lining', 'Hand-finished wax coat'],
    materials: '100% Italian Calfskin Leather',
    isBestseller: true,
    sizes: ['40', '41', '42', '43', '44', '45']
  },
  {
    id: '2',
    slug: 'minimalist-bifold-wallet',
    name: 'Vanguard Bifold Wallet',
    price: 120,
    category: 'wallets',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Slim, functional, and timeless. Designed for the modern man who values minimalism without compromising capacity.',
    details: ['RFID blocking technology', '6 card slots', 'Bill compartment', 'Premium vegetable-tanned leather'],
    materials: 'Vegetable-tanned full-grain leather',
    isBestseller: true,
    colors: [{ name: 'Saddle Brown', hex: '#8B4513' }, { name: 'Midnight Black', hex: '#000000' }]
  },
  {
    id: '3',
    slug: 'heritage-leather-belt',
    name: 'Heritage Stitch Belt',
    price: 85,
    category: 'belts',
    images: [
      'https://images.unsplash.com/photo-1614165939020-f71f3c44bead?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'A versatile essential. Hand-stitched with heavy-duty thread and finished with a solid brass buckle.',
    details: ['35mm width', 'Solid brass buckle', 'Reinforced stitching', 'Beveled edges'],
    materials: 'English Bridle Leather',
    sizes: ['30', '32', '34', '36', '38', '40']
  },
  {
    id: '4',
    slug: 'navigator-shades-gold',
    name: 'Gold Coast Navigator',
    price: 195,
    category: 'sunglasses',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Bold yet classic. These navigators offer superior clarity and a weighted feel that screams luxury.',
    details: ['18k Gold plated frame', 'Polarized lenses', 'UV400 Protection', 'Adjustable nose pads'],
    materials: 'High-grade stainless steel & gold plating',
    isBestseller: true
  },
  {
    id: '5',
    slug: 'obsidian-bead-bracelet',
    name: 'Obsidian & Gold Cuff',
    price: 65,
    category: 'bracelets',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Elevate your wrist game. Natural obsidian stones paired with hand-cast 14k gold-filled accents.',
    details: ['Genuine Obsidian stones', '14k Gold-filled hardware', 'Elasticated fit', 'Signature logo charm'],
    materials: 'Obsidian Stone & 14k Gold Fill'
  }
];

export const FAQS: FAQItem[] = [
  {
    category: 'Orders & Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and Apple Pay. For domestic orders, Cash on Delivery (COD) is also available.'
  },
  {
    category: 'Shipping & Delivery',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery in select urban areas.'
  },
  {
    category: 'Returns & Exchanges',
    question: 'What is your return policy?',
    answer: 'We offer a 14-day hassle-free return policy for all unworn items in their original packaging. Returns are free for store credit.'
  },
  {
    category: 'Product Care',
    question: 'How should I care for my leather shoes?',
    answer: 'We recommend using a cedar shoe tree after every wear and applying a quality leather conditioner every 3-4 months.'
  }
];
