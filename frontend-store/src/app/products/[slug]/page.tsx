'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  specifications: Record<string, string> | null;
  images: string[] | null;
  stock: number;
  is_featured: boolean;
  category: { id: number; name: string; slug: string };
  tags: { id: number; name: string; slug: string }[];
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*), tags:product_tag(tag:tags(*))')
          .eq('slug', slug)
          .single();
        if (!data) {
          setError('Product not found');
        } else {
          setProduct(data as unknown as Product);
        }
      } catch {
        setError('Product not found');
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
      await addItem(product.id, quantity);
      setQuantity(1);
    } catch {
      // error handled by cart
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-gray-200 aspect-square rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{error || 'Product not found'}</h2>
        <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
          &larr; Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        {' / '}
        <Link href="/products" className="hover:text-primary">Products</Link>
        {' / '}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary">
          {product.category.name}
        </Link>
        {' / '}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
          <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{product.category.name}</p>
          <p className="text-3xl font-bold text-primary mt-4">${Number(product.price).toFixed(2)}</p>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/products?tag=${tag.slug}`}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded hover:bg-primary hover:text-white transition"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{product.description}</p>
          </div>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between px-4 py-2 text-sm">
                    <span className="text-gray-600">{key}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || product.stock === 0}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
            >
              {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            {product.stock > 0
              ? `${product.stock} in stock`
              : 'Currently out of stock'}
          </p>

          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cash on Delivery — Pay when you receive
          </p>
        </div>
      </div>
    </div>
  );
}
