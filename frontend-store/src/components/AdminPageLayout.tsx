'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/adminpage' },
  { label: 'Products', href: '/adminpage/products' },
  { label: 'Categories', href: '/adminpage/categories' },
  { label: 'Orders', href: '/adminpage/orders' },
];

const LOGIN_PATH = '/adminpage/login';

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const isLoginPage = pathname === LOGIN_PATH;

  useEffect(() => {
    if (isLoginPage) return;
    if (!loading && (!user || !isAdmin)) {
      router.replace(LOGIN_PATH);
    }
  }, [user, loading, isAdmin, router, isLoginPage]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.replace('/adminpage/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse space-y-4 w-96">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200">
          <Link href="/adminpage" className="text-xl font-bold text-gray-900">Admin Panel</Link>
          <p className="text-xs text-gray-500 mt-1">Store Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/adminpage'
              ? pathname === '/adminpage'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-2 truncate">{user.email}</div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
