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
  category: { name: string; slug: string } | null;
  tags: { id: number; name: string; slug: string }[];
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem(product.id);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="bg-surface-container-lowest border border-outline-variant p-sm flex flex-col relative group brutal-shadow-hover transition-all duration-300">
      {product.stock < 5 && product.stock > 0 && (
        <div className="absolute top-sm left-sm bg-primary text-on-primary font-label-sm text-[10px] px-2 py-1 uppercase tracking-widest z-10">Low Stock</div>
      )}
      {product.stock === 0 && (
        <div className="absolute top-sm left-sm bg-on-surface text-on-primary font-label-sm text-[10px] px-2 py-1 uppercase tracking-widest z-10">Out of Stock</div>
      )}
      <div className="aspect-square bg-surface-container-low mb-sm overflow-hidden flex items-center justify-center border border-surface-variant relative">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant">fitness_center</span>
          </div>
        )}
        <div className="absolute inset-0 bg-on-surface/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
            className="bg-primary text-on-surface font-headline-md text-headline-md px-md py-xs uppercase tracking-tight transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            {adding ? '...' : 'Quick Add'}
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <h3 className="font-headline-md text-headline-md text-on-surface leading-tight mb-xs uppercase truncate">{product.name}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-md line-clamp-2">{product.category?.name ?? 'General'}</p>
        <div className="mt-auto flex justify-between items-end pt-sm border-t border-surface-variant">
          <span className="font-headline-md text-headline-md text-on-surface">${Number(product.price).toFixed(2)}</span>
          <button
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
            className="text-primary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px' }}>add_circle</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
