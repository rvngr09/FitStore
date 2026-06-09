'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    search: searchParams.get('search') || '',
    sort: 'created_at',
    direction: 'desc',
  });

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
      const [{ data: cats }, { data: tgs }] = await Promise.all([
        supabase.from('categories').select('id, name, slug').eq('is_active', true).order('sort_order'),
        supabase.from('tags').select('id, name, slug').order('name'),
      ]);
      setCategories((cats || []) as Category[]);
      setTags((tgs || []) as Tag[]);
    }
    loadFilters();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.tag, filters.search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
              <select
                value={filters.tag}
                onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>{tag.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${filters.sort}-${filters.direction}`}
                onChange={(e) => {
                  const [sort, direction] = e.target.value.split('-');
                  setFilters((f) => ({ ...f, sort, direction }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="created_at-desc">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>
            <button
              onClick={() => setFilters({ category: '', tag: '', search: '', sort: 'created_at', direction: 'desc' })}
              className="w-full text-sm text-gray-500 hover:text-primary transition"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{total} product(s)</p>
              <ProductGrid products={products} />
              {lastPage > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded ${
                        p === page
                          ? 'bg-primary text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg aspect-square" />
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
