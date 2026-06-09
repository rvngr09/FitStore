'use client';

import { useEffect, useState, useCallback, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

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
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    search: '',
    sort: 'created_at',
    direction: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const q = searchParams.get('search') || '';
    setFilters(prev => ({ ...prev, category: cat, tag, search: q }));
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const PER_PAGE = 12;
      let query = supabase
        .from('products')
        .select('*, category:categories(name, slug), tags:product_tag(tag:tags(id, name, slug))', { count: 'exact' })
        .eq('is_active', true)
        .order(filters.sort === 'name' ? 'name' : filters.sort, { ascending: filters.direction === 'asc' })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      if (filters.category) {
        query = query.eq('category.slug', filters.category);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, count } = await query;
      setProducts((data || []) as unknown as Product[]);
      setTotal(count || 0);
      setLastPage(Math.ceil((count || 0) / PER_PAGE));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    async function loadFilters() {
      const [{ data: cats }] = await Promise.all([
        supabase.from('categories').select('id, name, slug').eq('is_active', true).order('sort_order'),
      ]);
      setCategories((cats || []) as Category[]);
    }
    loadFilters();
  }, []);

  const toggleCategory = (slug: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === slug ? '' : slug,
    }));
    setPage(1);
  };

  const updateSort = (sort: string) => {
    if (sort === 'price-asc') {
      setFilters(prev => ({ ...prev, sort: 'price', direction: 'asc' }));
    } else if (sort === 'price-desc') {
      setFilters(prev => ({ ...prev, sort: 'price', direction: 'desc' }));
    } else if (sort === 'name') {
      setFilters(prev => ({ ...prev, sort: 'name', direction: 'asc' }));
    } else {
      setFilters(prev => ({ ...prev, sort: 'created_at', direction: 'desc' }));
    }
    setPage(1);
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-xl">
      <header className="mb-xl text-center md:text-left">
        <h1 className="font-display-lg text-display-lg hidden md:block uppercase text-on-surface">ELITE EQUIPMENT</h1>
        <h1 className="font-display-lg-mobile text-display-lg-mobile block md:hidden uppercase text-on-surface">ELITE GEAR</h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl mt-xs">Precision-engineered tools designed to push your limits and maximize performance output. Select your arsenal.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-xl">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 bg-surface-container-low p-sm border border-outline-variant brutal-shadow">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md border-b-2 border-on-surface pb-xs uppercase">Filters</h2>

            <div className="mb-lg">
              <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-xs">Category</h3>
              <ul className="space-y-xs">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <label className="flex items-center space-x-xs cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.category === cat.slug}
                        onChange={() => toggleCategory(cat.slug)}
                        className="form-checkbox text-primary border-outline-variant rounded-none bg-surface focus:ring-primary focus:ring-offset-0 focus:border-primary h-5 w-5"
                      />
                      <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">{cat.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => { setFilters({ category: '', tag: '', search: '', sort: 'created_at', direction: 'desc' }); setPage(1); }}
              className="w-full bg-on-surface text-on-primary font-label-sm text-label-sm uppercase py-sm px-md hover:bg-surface-variant hover:text-on-surface border-2 border-on-surface transition-all duration-200"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        <section className="flex-1">
          <div className="flex justify-between items-end border-b border-outline-variant pb-xs mb-md">
            <span className="font-label-sm text-label-sm text-secondary uppercase">{total} Results</span>
            <div className="flex items-center space-x-xs">
              <span className="font-label-sm text-label-sm text-secondary uppercase">Sort By:</span>
              <select
                onChange={(e) => updateSort(e.target.value)}
                className="bg-transparent border-none font-label-sm text-label-sm text-on-surface uppercase focus:ring-0 cursor-pointer pl-0 py-0 pr-6"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface-container aspect-square animate-pulse border border-outline-variant" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-xl">
              <span className="material-symbols-outlined text-[48px] text-secondary">search_off</span>
              <p className="font-body-lg text-body-lg text-secondary mt-4">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {lastPage > 1 && (
            <div className="mt-xl flex justify-center items-center space-x-sm">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-xs text-secondary hover:text-on-surface border border-transparent hover:border-on-surface transition-all disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1).slice(0, 5).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 flex items-center justify-center font-headline-md text-headline-md border transition-all ${
                    p === page
                      ? 'bg-on-surface text-on-primary border-on-surface'
                      : 'text-on-surface hover:bg-surface-variant border-transparent hover:border-outline-variant'
                  }`}
                >
                  {p}
                </button>
              ))}
              {lastPage > 5 && <span className="text-secondary">...</span>}
              <button
                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="p-xs text-secondary hover:text-on-surface border border-transparent hover:border-on-surface transition-all disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-container-max mx-auto px-gutter py-xl"><div className="bg-surface-container aspect-square animate-pulse" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
