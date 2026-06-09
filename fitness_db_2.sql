-- ========================================
-- Fix: User references for Supabase Auth
-- ========================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- Fixes FK constraints to use auth.users instead of public.users
-- ========================================

-- Drop all policies that depend on user_id columns first
DROP POLICY IF EXISTS "Users manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete_own" ON public.cart_items;

DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;

DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;

-- Drop old FK constraints
ALTER TABLE IF EXISTS public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_id_foreign;

ALTER TABLE IF EXISTS public.orders
  DROP CONSTRAINT IF EXISTS orders_user_id_foreign;

-- Drop old public.users table (not needed — Supabase uses auth.users)
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate cart_items column as UUID referencing auth.users
ALTER TABLE IF EXISTS public.cart_items
  ALTER COLUMN user_id DROP DEFAULT;

ALTER TABLE IF EXISTS public.cart_items
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

ALTER TABLE IF EXISTS public.cart_items
  ADD CONSTRAINT cart_items_user_id_foreign
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Recreate orders column as UUID referencing auth.users
ALTER TABLE IF EXISTS public.orders
  ALTER COLUMN user_id DROP DEFAULT;

ALTER TABLE IF EXISTS public.orders
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

ALTER TABLE IF EXISTS public.orders
  ADD CONSTRAINT orders_user_id_foreign
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Re-apply RLS policies for cart_items
DROP POLICY IF EXISTS "Users manage own cart" ON public.cart_items;

CREATE POLICY "Users manage own cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id);

-- Re-apply RLS policies for orders
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;

CREATE POLICY "Users view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create user_profiles table (links auth.users to app-level roles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer'
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
