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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="bg-white rounded-lg shadow-sm p-6 block hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{order.order_number}</p>
                  <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${parseFloat(order.total.toString()).toFixed(2)}</p>
                  <span className={`inline-block text-xs px-2 py-1 rounded mt-1 capitalize ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
