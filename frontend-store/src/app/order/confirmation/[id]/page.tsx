'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
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

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const { data } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('id', id)
          .single();
        setOrder(data as unknown as Order);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <Link href="/" className="text-primary hover:underline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Order Placed Successfully!</h1>
        <p className="text-gray-500 mt-2">Thank you for your order, {order.customer_name}.</p>
        <p className="text-3xl font-bold text-primary mt-4">{order.order_number}</p>
        <p className="text-sm text-gray-500 mt-1">Order Number</p>

        <p className="text-sm text-gray-500 mt-4">
          Status: <span className="capitalize font-medium text-gray-900">{order.status}</span>
        </p>
        <p className="text-sm text-gray-500">
          Total: <span className="font-bold text-gray-900">${parseFloat(order.total.toString()).toFixed(2)}</span>
        </p>
        <p className="text-sm text-gray-500">
          Payment: <span className="font-medium text-gray-900">Cash on Delivery</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
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

      <div className="text-center mt-8">
        <Link href="/products" className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition inline-block">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
