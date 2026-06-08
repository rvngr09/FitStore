'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  notes: string | null;
  subtotal: number;
  total: number;
  status: string;
  created_at: string;
  items: {
    id: number;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
  }[];
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
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
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
        <Link href="/account/orders" className="text-primary hover:underline mt-4 inline-block">&larr; Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/account/orders" className="text-primary hover:underline text-sm">&larr; Back to Orders</Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <span className={`text-sm px-3 py-1 rounded capitalize ${
            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Shipping Details</h3>
            <p className="text-sm text-gray-600">{order.customer_name}</p>
            <p className="text-sm text-gray-600">{order.customer_phone}</p>
            {order.customer_email && <p className="text-sm text-gray-600">{order.customer_email}</p>}
            <p className="text-sm text-gray-600 mt-2">{order.shipping_address}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
            <p className="text-sm text-gray-600">Cash on Delivery</p>
            {order.notes && (
              <>
                <h3 className="font-semibold text-gray-900 mt-4 mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
        <div className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.product_name}</p>
                <p className="text-gray-500">Qty: {item.quantity} x ${parseFloat(item.product_price.toString()).toFixed(2)}</p>
              </div>
              <p className="font-medium">${parseFloat(item.subtotal.toString()).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-200 font-bold text-lg">
          <span>Total</span>
          <span>${parseFloat(order.total.toString()).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
