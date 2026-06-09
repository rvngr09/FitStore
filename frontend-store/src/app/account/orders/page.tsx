'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Order {
  id: number;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  items: { id: number; product_name: string }[];
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const { data } = await supabase
          .from('orders')
          .select('*, items:order_items(id, product_name)')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false });
        setOrders((data || []) as unknown as Order[]);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-xl">
        <div className="flex flex-col md:flex-row gap-xl">
          <aside className="w-full md:w-64">
            <div className="bg-surface-container-lowest p-md border border-on-surface brutal-shadow animate-pulse">
              <div className="h-16 w-16 bg-surface-container rounded-full mb-4" />
              <div className="h-4 bg-surface-container w-3/4 mb-2" />
              <div className="h-3 bg-surface-container w-1/2" />
            </div>
          </aside>
          <div className="flex-1 space-y-md">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-surface-container animate-pulse border border-outline-variant" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-gutter py-xl flex flex-col md:flex-row gap-xl">
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-surface-container-lowest p-md border border-on-surface brutal-shadow sticky top-32">
          <div className="flex items-center gap-sm mb-lg">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-on-surface brutal-shadow-sm flex-shrink-0 bg-surface-container">
              <span className="material-symbols-outlined text-[32px] flex items-center justify-center w-full h-full text-secondary">person</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md uppercase tracking-tight">{user?.name || 'Athlete'}</h2>
              <p className="font-label-sm text-label-sm text-secondary uppercase">Elite Member</p>
            </div>
          </div>
          <nav className="flex flex-col gap-sm font-label-sm text-label-sm uppercase">
            <Link href="/account/orders" className="flex items-center gap-sm p-xs bg-on-surface text-on-primary brutal-shadow-sm transition-transform active:translate-y-0.5">
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Dashboard
            </Link>
            <Link href="/account/orders" className="flex items-center gap-sm p-xs text-secondary hover:bg-surface-container transition-colors duration-200">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Order History
            </Link>
            <Link href="/account/orders" className="flex items-center gap-sm p-xs text-secondary hover:bg-surface-container transition-colors duration-200">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              Wishlist
            </Link>
            <div className="h-px bg-outline-variant my-sm" />
            <Link href="/auth/login" className="flex items-center gap-sm p-xs text-secondary hover:bg-surface-container transition-colors duration-200">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </Link>
          </nav>
        </div>
      </aside>

      <div className="flex-1">
        <div className="bg-surface-container-lowest border border-outline-variant brutal-shadow p-lg mb-md">
          <h1 className="font-display-lg text-display-lg uppercase tracking-tight mb-xs text-on-surface">NO EXCUSES.</h1>
          <p className="font-body-lg text-body-lg text-secondary mb-md max-w-xl">
            Your next goal is within reach. Track your orders, monitor your progress, and gear up for the next session.
          </p>
          <Link href="/products" className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase px-md py-sm border border-on-surface brutal-shadow-sm active:translate-y-1 transition-transform inline-block">
            Resume Training Plan
          </Link>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant brutal-shadow p-md">
          <div className="flex justify-between items-end mb-md border-b border-outline-variant pb-xs">
            <h3 className="font-label-sm text-label-sm uppercase text-on-surface">Recent Orders</h3>
            {orders.length > 3 && (
              <span className="font-label-sm text-label-sm uppercase text-secondary">View All</span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-md">
              <span className="material-symbols-outlined text-[32px] text-secondary">receipt_long</span>
              <p className="font-body-lg text-body-lg text-secondary mt-4">No orders yet</p>
              <Link href="/products" className="font-label-sm text-label-sm uppercase border-b-2 border-on-surface pb-1 mt-4 inline-block">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              {orders.slice(0, 5).map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`} className="flex gap-md items-center hover:bg-surface-container p-xs transition-colors">
                  <div className="w-20 h-20 bg-surface-container-low border border-outline-variant flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px] text-secondary">fitness_center</span>
                  </div>
                  <div className="flex-grow">
                    <div className="font-label-sm text-label-sm uppercase text-secondary mb-xs">Order #{order.order_number}</div>
                    <h4 className="font-headline-md text-headline-md text-[20px] uppercase">{order.items[0]?.product_name || 'Order Items'}</h4>
                    <p className="font-body-md text-body-md text-secondary">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-label-sm text-label-sm px-2 py-1 uppercase inline-block mb-xs ${
                      order.status === 'delivered' || order.status === 'completed'
                        ? 'bg-primary-fixed text-on-primary-fixed brutal-shadow-sm'
                        : order.status === 'cancelled'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-outline-variant text-on-surface border border-outline-variant'
                    }`}>
                      {order.status}
                    </div>
                    <div className="font-headline-md text-headline-md text-on-surface">${parseFloat(order.total.toString()).toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
