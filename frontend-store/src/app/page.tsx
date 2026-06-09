'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';

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

interface Category {
  id: number;
  name: string;
  slug: string;
  products_count: number;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: products }, { data: cats }] = await Promise.all([
          supabase
            .from('products')
            .select('*, category:categories(name, slug), tags:product_tag(tag:tags(id, name, slug))')
            .eq('is_featured', true)
            .eq('is_active', true)
            .limit(8),
          supabase
            .from('categories')
            .select('id, name, slug, products_count')
            .eq('is_active', true)
            .order('sort_order'),
        ]);
        setFeaturedProducts((products || []) as unknown as Product[]);
        setCategories((cats || []) as Category[]);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-gray-900 via-secondary to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Transform Your Body,{' '}
              <span className="text-primary">Transform Your Life</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Premium fitness gear, supplements, and apparel to fuel your journey. Free shipping on orders over $50.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/products"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Shop Now
              </Link>
              <Link
                href="/products?category=supplements"
                className="border border-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition"
              >
                Supplements
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition">
                <span className="text-primary text-xl font-bold">{cat.name.charAt(0)}</span>
              </div>
              <h3 className="mt-3 font-medium text-gray-900">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.products_count} items</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-primary hover:text-primary-dark font-medium">
              View All &rarr;
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse" />
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 text-lg mb-8">
            Shop our full collection and get free shipping on orders over $50.
          </p>
          <Link
            href="/products"
            className="bg-white text-primary px-10 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Browse All Products
          </Link>
        </div>
      </section>
    </div>
  );
}
