-- ========================================
-- Fitness Store — Supabase Schema Migration
-- ========================================
-- PostgreSQL 15+
-- Run via: supabase migration up
-- ========================================

-- ---------------------------------------------------------
-- Users (extends Supabase auth.users)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id                BIGSERIAL PRIMARY KEY,
  uuid              UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  email_verified_at TIMESTAMPTZ,
  password          TEXT NOT NULL,
  remember_token    TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = uuid::text);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = uuid::text);

-- ---------------------------------------------------------
-- Categories
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image       TEXT,
  parent_id   BIGINT REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Categories are manageable by authenticated" ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Tags
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON public.tags(slug);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags are publicly readable" ON public.tags FOR SELECT USING (TRUE);
CREATE POLICY "Tags are manageable by authenticated" ON public.tags FOR ALL USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Products
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL,
  category_id    BIGINT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  specifications JSONB,
  images         JSONB,
  stock          INTEGER NOT NULL DEFAULT 0,
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = TRUE;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (TRUE);
CREATE POLICY "Products are manageable by authenticated" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Product <-> Tag (pivot)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_tag (
  id         BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id     BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE (product_id, tag_id)
);

CREATE INDEX idx_product_tag_product_id ON public.product_tag(product_id);
CREATE INDEX idx_product_tag_tag_id ON public.product_tag(tag_id);
ALTER TABLE public.product_tag ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product tags are publicly readable" ON public.product_tag FOR SELECT USING (TRUE);
CREATE POLICY "Product tags are manageable by authenticated" ON public.product_tag FOR ALL USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Cart Items
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         BIGSERIAL PRIMARY KEY,
  session_id TEXT,
  user_id    BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cart_items_session ON public.cart_items(session_id);
CREATE INDEX idx_cart_items_user ON public.cart_items(user_id);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid()::text = (SELECT uuid FROM public.users WHERE id = user_id));

-- ---------------------------------------------------------
-- Orders
-- ---------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id               BIGSERIAL PRIMARY KEY,
  order_number     TEXT NOT NULL UNIQUE,
  user_id          BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT,
  shipping_address TEXT NOT NULL,
  notes            TEXT,
  subtotal         DECIMAL(10,2) NOT NULL,
  total            DECIMAL(10,2) NOT NULL,
  status           public.order_status NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (
  auth.uid()::text = (SELECT uuid FROM public.users WHERE id = user_id)
);
CREATE POLICY "Authenticated can insert orders" ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Order Items
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id             BIGSERIAL PRIMARY KEY,
  order_id       BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id     BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name   TEXT NOT NULL,
  product_price  DECIMAL(10,2) NOT NULL,
  quantity       INTEGER NOT NULL,
  subtotal       DECIMAL(10,2) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND auth.uid()::text = (SELECT uuid FROM public.users WHERE id = user_id))
);
CREATE POLICY "Authenticated can insert order items" ON public.order_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['users', 'categories', 'tags', 'products', 'cart_items', 'orders', 'order_items'])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;
