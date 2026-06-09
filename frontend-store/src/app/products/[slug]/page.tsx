'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[] | null;
  stock: number;
  specifications: Record<string, string> | null;
  is_featured: boolean;
  category: { name: string; slug: string } | null;
  tags: { id: number; name: string; slug: string }[];
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(name, slug), tags:product_tag(tag:tags(id, name, slug))')
          .eq('slug', slug)
          .single();
        setProduct((data || null) as unknown as Product);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await addItem(product.id);
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
          <div className="md:col-span-7 aspect-square bg-surface-container animate-pulse border border-outline-variant" />
          <div className="md:col-span-5 space-y-4">
            <div className="h-12 bg-surface-container animate-pulse" />
            <div className="h-8 bg-surface-container animate-pulse w-1/3" />
            <div className="h-24 bg-surface-container animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-xl text-center">
        <span className="material-symbols-outlined text-[48px] text-secondary">search_off</span>
        <p className="font-body-lg text-body-lg text-secondary mt-4">Product not found</p>
        <Link href="/products" className="font-label-sm text-label-sm uppercase border-b-2 border-on-surface pb-1 mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const specs = product.specifications;
  const specEntries = specs && typeof specs === 'object' ? Object.entries(specs) : [];

  return (
    <div className="max-w-container-max mx-auto px-gutter py-xl">
      <div className="flex items-center gap-xs font-label-sm text-label-sm text-secondary mb-lg">
        <Link href="/" className="hover:text-on-surface">HOME</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/products" className="hover:text-on-surface">{(product.category?.name ?? 'Products').toUpperCase()}</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-bold">{product.name.toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-xl mb-xl">
        <div className="md:col-span-7 flex flex-col gap-sm">
          <div className="w-full bg-surface-container aspect-square relative border border-outline-variant p-md flex items-center justify-center">
            <div className="w-full h-full bg-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[80px] text-on-surface-variant">fitness_center</span>
            </div>
            {product.stock < 5 && product.stock > 0 && (
              <div className="absolute top-sm left-sm bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-xs py-base border border-on-surface uppercase">
                Low Stock
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col">
          <div className="mb-sm">
            <h1 className="font-headline-xl text-headline-xl md:font-display-lg md:text-display-lg uppercase text-on-surface mb-base leading-none">
              {product.name}
            </h1>
            <div className="flex items-center gap-xs font-label-sm text-label-sm text-secondary">
              <div className="flex text-primary">
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                ))}
                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star_half</span>
              </div>
              <span>4.8 (240 REVIEWS)</span>
            </div>
          </div>

          <div className="font-headline-xl text-headline-xl text-on-surface mb-md">
            ${Number(product.price).toFixed(2)}
          </div>

          <p className="font-body-lg text-body-lg text-secondary mb-lg">
            {product.description}
          </p>

          {specEntries.length > 0 && (
            <div className="mb-lg border border-outline-variant">
              <ul className="divide-y divide-outline-variant">
                {specEntries.slice(0, 4).map(([key, value]) => (
                  <li key={key} className="py-sm px-sm flex justify-between items-center">
                    <span className="font-label-sm text-label-sm text-secondary">{key.toUpperCase()}</span>
                    <span className="font-label-sm text-label-sm text-on-surface">{String(value).toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-sm mb-lg">
            <span className="font-label-sm text-label-sm uppercase text-secondary">Qty:</span>
            <div className="flex border-2 border-on-surface">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-2 font-headline-md hover:bg-surface-container transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 font-headline-md text-on-surface border-x-2 border-on-surface">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                className="px-3 py-2 font-headline-md hover:bg-surface-container transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-auto pt-lg border-t border-outline-variant">
            <button
              onClick={handleAdd}
              disabled={adding || product.stock === 0}
              className="w-full bg-primary-container text-on-primary-container font-headline-md text-headline-md uppercase py-md border-2 border-on-surface hover:bg-primary-fixed transition-colors brutal-shadow active:translate-y-1 active:shadow-none mb-sm flex justify-center items-center gap-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {product.stock === 0 ? 'Sold Out' : adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <p className="font-label-sm text-label-sm text-secondary text-center">Ships within 24 hours. Free standard shipping.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
