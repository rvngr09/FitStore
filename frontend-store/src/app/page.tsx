'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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

  const handleQuickAdd = async (productId: number) => {
    const { useCart } = await import('@/contexts/CartContext');
    // Quick add handled via product cards
  };

  return (
    <div>
      <section className="relative w-full overflow-hidden bg-on-surface text-surface-container-lowest py-xl md:py-32 px-gutter">
        <div className="max-w-container-max mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-7 flex flex-col gap-sm relative">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary-container opacity-20 rounded-full blur-2xl"></div>
            <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-widest block mb-4">Elite Human Performance</span>
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg uppercase leading-none tracking-tight">
              BUILT FOR <br className="hidden md:block" /> <span className="text-primary-fixed">RESULTS.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-surface-variant max-w-xl mt-4 md:mt-8">
              Precision-engineered equipment, high-performance apparel, and scientifically backed nutrition designed to push you beyond your perceived limits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-12">
              <Link
                href="/products"
                className="bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase px-8 py-4 brutal-shadow active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 border-2 border-transparent"
              >
                Shop Equipment
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/products"
                className="bg-transparent border-2 border-surface-container-lowest text-surface-container-lowest font-label-sm text-label-sm uppercase px-8 py-4 hover:bg-surface-container-lowest hover:text-on-surface transition-colors flex items-center justify-center gap-2"
              >
                Explore Training
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative mt-12 lg:mt-0 h-[400px] md:h-[600px] w-full">
            <div className="absolute inset-0 bg-primary-container brutal-shadow-lg translate-x-4 translate-y-4"></div>
            <div className="absolute inset-0 border-4 border-on-surface bg-surface overflow-hidden">
              <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-[80px] text-on-surface-variant">fitness_center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-xl px-gutter max-w-container-max mx-auto bg-surface">
        <div className="flex flex-col md:flex-row justify-between items-end mb-md">
          <div>
            <h2 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl uppercase">Engineered Arsenal</h2>
            <p className="font-body-lg text-body-lg text-secondary mt-2">Everything required to dominate your discipline.</p>
          </div>
          <Link href="/products" className="font-label-sm text-label-sm uppercase border-b-2 border-on-surface pb-1 hover:text-primary transition-colors hidden md:block">
            View All Arsenal
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-sm auto-rows-[300px] md:auto-rows-[400px]">
          {categories.slice(0, 3).map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={
                idx === 0
                  ? 'md:col-span-8 relative group cursor-pointer border-2 border-on-surface brutal-shadow bg-surface-container-lowest overflow-hidden'
                  : idx === 1
                  ? 'md:col-span-4 relative group cursor-pointer border-2 border-on-surface brutal-shadow bg-surface-container-lowest overflow-hidden'
                  : 'md:col-span-12 relative group cursor-pointer border-2 border-on-surface brutal-shadow bg-surface-container-lowest overflow-hidden h-[250px] md:h-[300px]'
              }
            >
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 to-transparent z-10"></div>
              <div className="absolute bottom-0 left-0 p-md z-20 flex flex-col gap-2">
                <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2 py-1 uppercase w-fit">
                  Category {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl text-surface-container-lowest uppercase leading-none">
                  {cat.name}
                </h3>
              </div>
              <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-[60px] text-on-surface-variant opacity-40">fitness_center</span>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/products" className="font-label-sm text-label-sm uppercase border-b-2 border-on-surface pb-1 hover:text-primary transition-colors block md:hidden mt-8 text-center">
          View All Arsenal
        </Link>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-xl px-gutter max-w-container-max mx-auto bg-surface">
          <div className="flex flex-col md:flex-row justify-between items-end mb-md">
            <div>
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl uppercase">Featured Gear</h2>
              <p className="font-body-lg text-body-lg text-secondary mt-2">Top picks from our performance roster.</p>
            </div>
            <Link href="/products" className="font-label-sm text-label-sm uppercase border-b-2 border-on-surface pb-1 hover:text-primary transition-colors hidden md:block">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface-container aspect-square animate-pulse border border-outline-variant" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCardItem key={product.id} product={product} />
              ))}
            </div>
          )}
          <Link href="/products" className="font-label-sm text-label-sm uppercase border-b-2 border-on-surface pb-1 hover:text-primary transition-colors block md:hidden mt-8 text-center">
            View All
          </Link>
        </section>
      )}

      <section className="py-xl px-gutter bg-primary-container text-on-primary-container">
        <div className="max-w-container-max mx-auto text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[48px] mb-4">bolt</span>
          <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg uppercase tracking-tight max-w-3xl leading-none">
            STOP TRAINING. <br /> START EXECUTING.
          </h2>
          <p className="font-body-lg text-body-lg mt-6 max-w-2xl font-bold">
            Join the P+X Elite roster. Get exclusive access to limited gear drops, advanced training protocols, and clinical nutrition breakdowns.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-lg" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="flex-grow flex flex-col gap-1 text-left">
              <label className="font-label-sm text-label-sm uppercase" htmlFor="email">Comms Link (Email)</label>
              <input
                className="w-full bg-surface-container-lowest border-2 border-on-primary-container px-4 py-3 font-body-md focus:outline-none focus:border-on-surface focus:ring-0 text-on-surface"
                id="email"
                placeholder="ENTER ADDRESS"
                required
                type="email"
              />
            </div>
            <button className="bg-on-surface text-surface-container-lowest font-label-sm text-label-sm uppercase px-8 py-3 h-[52px] mt-auto hover:bg-inverse-surface transition-colors brutal-shadow" type="submit">
              Enlist
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function ProductCardItem({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="bg-surface-container-lowest border border-outline-variant p-sm flex flex-col group brutal-shadow-hover transition-all duration-300">
      <div className="aspect-square bg-surface-container-low mb-sm overflow-hidden flex items-center justify-center border border-surface-variant relative">
        <div className="w-full h-full bg-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant">fitness_center</span>
        </div>
        {product.stock < 5 && product.stock > 0 && (
          <div className="absolute top-sm left-sm bg-on-surface text-on-primary font-label-sm text-[10px] px-2 py-1 uppercase tracking-widest z-10">Low Stock</div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-sm left-sm bg-on-surface text-on-primary font-label-sm text-[10px] px-2 py-1 uppercase tracking-widest z-10">Sold Out</div>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <h3 className="font-headline-md text-headline-md text-on-surface leading-tight mb-xs uppercase truncate">{product.name}</h3>
        <p className="font-body-md text-body-md text-secondary mb-md line-clamp-2">{product.category?.name ?? 'General'}</p>
        <div className="mt-auto flex justify-between items-end pt-sm border-t border-surface-variant">
          <span className="font-headline-md text-headline-md text-on-surface">${Number(product.price).toFixed(2)}</span>
          <span className="material-symbols-outlined text-primary hover:text-on-surface transition-colors" style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px' }}>add_circle</span>
        </div>
      </div>
    </Link>
  );
}
