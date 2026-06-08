'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-secondary text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            FitStore
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="hover:text-primary transition">Products</Link>
            {user ? (
              <>
                <Link href="/account/orders" className="hover:text-primary transition">My Orders</Link>
                {isAdmin && (
                  <Link href="/admin" className="text-accent hover:text-yellow-400 transition">Admin</Link>
                )}
                <button onClick={logout} className="hover:text-red-400 transition">Logout</button>
                <span className="text-gray-400 text-sm">{user.name}</span>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-primary transition">Login</Link>
                <Link href="/auth/register" className="hover:text-primary transition">Register</Link>
              </>
            )}
            <Link href="/cart" className="relative hover:text-primary transition">
              Cart
              {count > 0 && (
                <span className="absolute -top-2 -right-4 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <Link href="/products" className="py-1 hover:text-primary" onClick={() => setMenuOpen(false)}>Products</Link>
            {user ? (
              <>
                <Link href="/account/orders" className="py-1 hover:text-primary" onClick={() => setMenuOpen(false)}>My Orders</Link>
                {isAdmin && <Link href="/admin" className="py-1 text-accent" onClick={() => setMenuOpen(false)}>Admin</Link>}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left py-1 hover:text-red-400">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="py-1 hover:text-primary" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/auth/register" className="py-1 hover:text-primary" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
            <Link href="/cart" className="py-1 hover:text-primary" onClick={() => setMenuOpen(false)}>
              Cart ({count})
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
