-- Fix foreign key constraints to reference auth.users instead of public.users
-- Run if you previously applied the old schema with BIGINT user_id references

-- Drop old triggers first
DROP TRIGGER IF EXISTS set_updated_at ON public.cart_items;
DROP TRIGGER IF EXISTS set_updated_at ON public.orders;

-- Drop old RLS policies that depend on columns
DROP POLICY IF EXISTS "Users manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;

-- Recreate cart_items with correct user_id type
ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_id_foreign;

ALTER TABLE public.cart_items
  ALTER COLUMN user_id TYPE UUID USING (gen_random_uuid());

ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_user_id_foreign
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Recreate orders with correct user_id type
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_user_id_foreign;

ALTER TABLE public.orders
  ALTER COLUMN user_id TYPE UUID USING (gen_random_uuid());

ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_foreign
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Re-apply RLS policies
CREATE POLICY "Users manage own cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_id AND auth.uid() = user_id
  ));

CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_id AND auth.uid() = user_id
  ));

-- Drop the old public.users table if it exists (not needed with Supabase Auth)
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop old user_profiles table if it exists and recreate
DROP TABLE IF EXISTS public.user_profiles CASCADE;

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

-- Auto-create profile on signup
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

-- Re-apply updated_at triggers
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
