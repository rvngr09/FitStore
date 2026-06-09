'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface CartProduct {
  id: number;
  name: string;
  price: number;
  slug: string;
  images: string[] | null;
  stock: number;
}

interface CartItem {
  id: number | string;
  product_id: number;
  quantity: number;
  product: CartProduct;
}

interface LocalCartItem {
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
  updateQuantity: (itemId: number | string, quantity: number) => Promise<void>;
  removeItem: (itemId: number | string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'guest-cart';

function getLocalCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function setLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!user) {
      const local = getLocalCart();
      setItems(local.map((item, i) => ({ ...item, id: `local-${i}` })));
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, product:products(id, name, price, slug, images, stock)')
        .eq('user_id', user.id);

      setItems((data || []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product as unknown as CartProduct,
      })));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const local = getLocalCart();
      if (local.length === 0) return;

      for (const item of local) {
        await supabase.from('cart_items').upsert(
          { user_id: user.id, product_id: item.product_id, quantity: item.quantity },
          { onConflict: 'user_id, product_id' }
        );
      }
      localStorage.removeItem(LOCAL_CART_KEY);
      fetchCart();
    })();
  }, [user, fetchCart]);

  const addItem = async (productId: number, quantity = 1) => {
    if (!user) {
      const local = getLocalCart();
      const existing = local.find((i) => i.product_id === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        const { data: product } = await supabase
          .from('products')
          .select('id, name, price, slug, images, stock')
          .eq('id', productId)
          .single();
        if (product) {
          local.push({ product_id: productId, quantity, product: product as CartProduct });
        }
      }
      setLocalCart(local);
      setItems(local.map((item, i) => ({ ...item, id: `local-${i}` })));
      return;
    }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity });
    }

    fetchCart();
  };

  const updateQuantity = async (itemId: number | string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    if (!user) {
      const local = getLocalCart();
      const idx = local.findIndex((_, i) => `local-${i}` === itemId);
      if (idx !== -1) {
        local[idx].quantity = quantity;
        setLocalCart(local);
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
      }
      return;
    }

    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  };

  const removeItem = async (itemId: number | string) => {
    if (!user) {
      const local = getLocalCart();
      const idx = local.findIndex((_, i) => `local-${i}` === itemId);
      if (idx !== -1) {
        local.splice(idx, 1);
        setLocalCart(local);
        setItems(prev => prev.filter(i => i.id !== itemId));
      }
      return;
    }

    await supabase.from('cart_items').delete().eq('id', itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    if (!user) {
      localStorage.removeItem(LOCAL_CART_KEY);
    }
    setItems([]);
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, count, subtotal, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
