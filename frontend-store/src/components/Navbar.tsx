'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="w-full top-0 sticky bg-surface border-b-2 border-on-surface z-50">
      <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-20">
        <Link href="/" className="font-display-lg uppercase tracking-tight text-on-surface hidden md:block text-[40px] leading-none">
          PERFORMANCE+X
        </Link>
        <Link href="/" className="font-display-lg-mobile uppercase tracking-tight text-on-surface block md:hidden text-[32px] leading-none">
          P+X
        </Link>

        <nav className="hidden md:flex gap-md h-full items-center font-label-sm text-label-sm uppercase">
          <Link href="/products" className="text-secondary hover:text-on-surface hover:bg-surface-container transition-colors duration-200 px-4 py-2">
            Equipment
          </Link>
          <Link href="/products?category=apparel" className="text-secondary hover:text-on-surface hover:bg-surface-container transition-colors duration-200 px-4 py-2">
            Apparel
          </Link>
          <Link href="/products?category=nutrition" className="text-secondary hover:text-on-surface hover:bg-surface-container transition-colors duration-200 px-4 py-2">
            Nutrition
          </Link>
        </nav>

        <div className="flex items-center gap-sm">
          <Link href="/cart" className="text-primary hover:bg-surface-container p-2 active:translate-y-0.5 transition-transform relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary font-label-sm text-[10px] w-4 h-4 flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-sm">
              <Link href="/account/orders" className="text-primary hover:bg-surface-container p-2 active:translate-y-0.5 transition-transform">
                <span className="material-symbols-outlined">person</span>
              </Link>
            </div>
          ) : (
            <Link href="/auth/login" className="text-primary hover:bg-surface-container p-2 active:translate-y-0.5 transition-transform">
              <span className="material-symbols-outlined">person</span>
            </Link>
          )}
          <button className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
