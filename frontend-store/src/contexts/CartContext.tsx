'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '@/lib/api';

interface CartProduct {
  id: number;
  name: string;
  price: number;
  slug: string;
  images: string[] | null;
  stock: number;
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: CartProduct;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  count: number;
  subtotal: number;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => void;
  mergeCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('session-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('session-id', id);
  }
  return id;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await api.get('/cart');
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId: number, quantity = 1) => {
    const payload: Record<string, unknown> = { product_id: productId, quantity };
    const token = localStorage.getItem('auth-token');
    if (!token) {
      payload.session_id = getSessionId();
    }
    const { data } = await api.post('/cart', payload);
    setItems(prev => {
      const exists = prev.find(i => i.id === data.id);
      if (exists) {
        return prev.map(i => i.id === data.id ? data : i);
      }
      return [...prev, data];
    });
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    setItems(prev => prev.map(i => i.id === itemId ? data : i));
  };

  const removeItem = async (itemId: number) => {
    await api.delete(`/cart/${itemId}`);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => setItems([]);

  const mergeCart = async () => {
    const sessionId = localStorage.getItem('session-id');
    if (!sessionId) return;
    try {
      await api.post('/cart/merge', { session_id: sessionId });
      localStorage.removeItem('session-id');
      await fetchCart();
    } catch {
      // ignore
    }
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, count, subtotal, addItem, updateQuantity, removeItem, clearCart, mergeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
