'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardData {
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  total_products: number;
  low_stock: number;
  recent_orders: {
    id: number;
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [{ count: totalOrders }, { count: pendingOrders }, { count: totalProducts }, { data: lowStock }, { data: recentOrders }] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('id').lt('stock', 10).gte('stock', 1),
          supabase.from('orders').select('id, order_number, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
        ]);

        const { data: revenueData } = await supabase
          .from('orders')
          .select('total')
          .in('status', ['delivered', 'shipped', 'confirmed', 'processing']);

        const totalRevenue = (revenueData || []).reduce((sum, o) => sum + Number(o.total), 0);

        setData({
          total_orders: totalOrders || 0,
          pending_orders: pendingOrders || 0,
          total_revenue: totalRevenue,
          total_products: totalProducts || 0,
          low_stock: lowStock?.length || 0,
          recent_orders: (recentOrders || []) as DashboardData['recent_orders'],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded" />)}
    </div>;
  }

  if (!data) return <p className="text-red-500">Failed to load dashboard</p>;

  const cards = [
    { label: 'Total Orders', value: data.total_orders, color: 'bg-blue-500' },
    { label: 'Pending Orders', value: data.pending_orders, color: 'bg-yellow-500' },
    { label: 'Total Revenue', value: `$${parseFloat(data.total_revenue.toString()).toFixed(2)}`, color: 'bg-green-500' },
    { label: 'Products', value: data.total_products, color: 'bg-purple-500' },
    { label: 'Low Stock Items', value: data.low_stock, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm p-6">
            <div className={`w-3 h-3 rounded-full ${card.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
        {data.recent_orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-500">Order</th>
                  <th className="pb-3 font-medium text-gray-500">Customer</th>
                  <th className="pb-3 font-medium text-gray-500">Total</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{order.order_number}</td>
                    <td className="py-3">{order.customer_name}</td>
                    <td className="py-3">${parseFloat(order.total.toString()).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded capitalize ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
