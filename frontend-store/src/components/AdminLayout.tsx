'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2 ml-auto">
          <Link href="/admin" className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 transition">Dashboard</Link>
          <Link href="/admin/products" className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 transition">Products</Link>
          <Link href="/admin/categories" className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 transition">Categories</Link>
          <Link href="/admin/orders" className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 transition">Orders</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
