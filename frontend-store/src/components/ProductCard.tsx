'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[] | null;
  stock: number;
  is_featured: boolean;
  category: { name: string; slug: string };
  tags: { id: number; name: string; slug: string }[];
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addItem(product.id);
    } finally {
      setAdding(false);
    }
  };

  const imageUrl = product.images?.[0] || '/placeholder.png';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {product.stock < 5 && product.stock > 0 && (
            <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">Low Stock</span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Out of Stock</span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition">{product.name}</h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1 capitalize">{product.category.name}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
          <button
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
            className="bg-primary text-white px-3 py-1.5 rounded text-sm hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? '...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
