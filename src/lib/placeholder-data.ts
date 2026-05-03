import type { Product } from '@/components/ProductCard';
import type { NewsEntry } from '@/components/NewsItem';

export const placeholderProducts: Product[] = [
  { id: 'p1', name: 'product.matcha', image: '/asahi/ice-3.png' },
  { id: 'p2', name: 'product.okinawa', image: '/asahi/ice-5.png' },
  { id: 'p3', name: 'product.tiramisu', image: '/asahi/product-tiramisu.png' },
  { id: 'p4', name: 'product.berry', image: '/asahi/ice-6.png' },
];

export const placeholderSeasonal: Product[] = [
  { id: 's1', name: 'product.seasonal1', image: '/asahi/product-papaya-milk.png' },
  { id: 's2', name: 'product.seasonal2', image: '/asahi/product-cinnamon-apple-crepe.png' },
  { id: 's3', name: 'product.seasonal3', image: '/asahi/product-berry-brulee-crepe.png' },
];

export const placeholderNews: NewsEntry[] = [
  { slug: 'note-001', date: '2025-04-21', title: 'news.item1' },
  { slug: 'note-002', date: '2025-04-21', title: 'news.item2' },
  { slug: 'note-003', date: '2025-03-31', title: 'news.item3' },
];
