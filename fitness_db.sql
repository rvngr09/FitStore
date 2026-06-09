-- ========================================
-- Fitness Store Database Schema
-- For Supabase (PostgreSQL)
-- ========================================
-- Execute in Supabase SQL Editor
-- ========================================

-- ---------------------------------------------------------
-- Users (extends Supabase auth.users)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) NOT NULL UNIQUE,
  name              VARCHAR(255) NOT NULL,
  email_verified_at TIMESTAMPTZ NULL DEFAULT NULL,
  password          VARCHAR(255) NOT NULL,
  remember_token    VARCHAR(100) NULL DEFAULT NULL,
  created_at        TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- Password Reset Tokens
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  email      VARCHAR(255) NOT NULL,
  token      VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  PRIMARY KEY (email)
);

-- ---------------------------------------------------------
-- Personal Access Tokens (Sanctum)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_access_tokens (
  id             BIGSERIAL PRIMARY KEY,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id   UUID NOT NULL,
  name           VARCHAR(255) NOT NULL,
  token          VARCHAR(64) NOT NULL UNIQUE,
  abilities      TEXT NULL DEFAULT NULL,
  last_used_at   TIMESTAMPTZ NULL DEFAULT NULL,
  expires_at     TIMESTAMPTZ NULL DEFAULT NULL,
  created_at     TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_index 
  ON public.personal_access_tokens (tokenable_type, tokenable_id);
CREATE INDEX IF NOT EXISTS personal_access_tokens_expires_at_index 
  ON public.personal_access_tokens (expires_at);

-- ---------------------------------------------------------
-- Categories
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL DEFAULT NULL,
  image       VARCHAR(255) NULL DEFAULT NULL,
  parent_id   BIGINT NULL DEFAULT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NULL DEFAULT NOW(),
  CONSTRAINT categories_parent_id_foreign 
    FOREIGN KEY (parent_id) REFERENCES public.categories (id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Tags
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  slug       VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- Products
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id             BIGSERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  slug           VARCHAR(255) NOT NULL UNIQUE,
  description    TEXT NULL DEFAULT NULL,
  price          DECIMAL(10, 2) NOT NULL,
  category_id    BIGINT NOT NULL,
  specifications JSONB NULL DEFAULT NULL,
  images         JSONB NULL DEFAULT NULL,
  stock          INT NOT NULL DEFAULT 0,
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NULL DEFAULT NOW(),
  CONSTRAINT products_category_id_foreign 
    FOREIGN KEY (category_id) REFERENCES public.categories (id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Product Tag Pivot
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_tag (
  id         BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL,
  tag_id     BIGINT NOT NULL,
  UNIQUE (product_id, tag_id),
  CONSTRAINT product_tag_product_id_foreign 
    FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE CASCADE,
  CONSTRAINT product_tag_tag_id_foreign 
    FOREIGN KEY (tag_id) REFERENCES public.tags (id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Cart Items
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255) NULL DEFAULT NULL,
  user_id    UUID NULL DEFAULT NULL,
  product_id BIGINT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL DEFAULT NOW(),
  CONSTRAINT cart_items_user_id_foreign 
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
  CONSTRAINT cart_items_product_id_foreign 
    FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS cart_items_session_id_index ON public.cart_items (session_id);

-- ---------------------------------------------------------
-- Orders
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id               BIGSERIAL PRIMARY KEY,
  order_number     VARCHAR(255) NOT NULL UNIQUE,
  user_id          UUID NULL DEFAULT NULL,
  customer_name    VARCHAR(255) NOT NULL,
  customer_phone   VARCHAR(255) NOT NULL,
  customer_email   VARCHAR(255) NULL DEFAULT NULL,
  shipping_address TEXT NOT NULL,
  notes            TEXT NULL DEFAULT NULL,
  subtotal         DECIMAL(10, 2) NOT NULL,
  total            DECIMAL(10, 2) NOT NULL,
  status           VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NULL DEFAULT NOW(),
  CONSTRAINT orders_user_id_foreign 
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL
);

-- Status constraint
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- ---------------------------------------------------------
-- Order Items
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id             BIGSERIAL PRIMARY KEY,
  order_id       BIGINT NOT NULL,
  product_id     BIGINT NULL DEFAULT NULL,
  product_name   VARCHAR(255) NOT NULL,
  product_price  DECIMAL(10, 2) NOT NULL,
  quantity       INT NOT NULL,
  subtotal       DECIMAL(10, 2) NOT NULL,
  created_at     TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NULL DEFAULT NOW(),
  CONSTRAINT order_items_order_id_foreign 
    FOREIGN KEY (order_id) REFERENCES public.orders (id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_foreign 
    FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- Permissions (spatie/laravel-permission)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  guard_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL DEFAULT NOW(),
  UNIQUE (name, guard_name)
);

-- ---------------------------------------------------------
-- Roles
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  guard_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL DEFAULT NOW(),
  UNIQUE (name, guard_name)
);

-- ---------------------------------------------------------
-- Model Has Permissions
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.model_has_permissions (
  permission_id BIGINT NOT NULL,
  model_type    VARCHAR(255) NOT NULL,
  model_id      UUID NOT NULL,
  PRIMARY KEY (permission_id, model_id, model_type),
  CONSTRAINT model_has_permissions_permission_id_foreign 
    FOREIGN KEY (permission_id) REFERENCES public.permissions (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS model_has_permissions_model_index 
  ON public.model_has_permissions (model_id, model_type);

-- ---------------------------------------------------------
-- Model Has Roles
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.model_has_roles (
  role_id    BIGINT NOT NULL,
  model_type VARCHAR(255) NOT NULL,
  model_id   UUID NOT NULL,
  PRIMARY KEY (role_id, model_id, model_type),
  CONSTRAINT model_has_roles_role_id_foreign 
    FOREIGN KEY (role_id) REFERENCES public.roles (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS model_has_roles_model_index 
  ON public.model_has_roles (model_id, model_type);

-- ---------------------------------------------------------
-- Role Has Permissions
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_has_permissions (
  permission_id BIGINT NOT NULL,
  role_id       BIGINT NOT NULL,
  PRIMARY KEY (permission_id, role_id),
  CONSTRAINT role_has_permissions_permission_id_foreign 
    FOREIGN KEY (permission_id) REFERENCES public.permissions (id) ON DELETE CASCADE,
  CONSTRAINT role_has_permissions_role_id_foreign 
    FOREIGN KEY (role_id) REFERENCES public.roles (id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Cache
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cache (
  key        VARCHAR(255) PRIMARY KEY,
  value      TEXT NOT NULL,
  expiration BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS cache_expiration_index ON public.cache (expiration);

-- ---------------------------------------------------------
-- Cache Locks
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cache_locks (
  key        VARCHAR(255) PRIMARY KEY,
  owner      VARCHAR(255) NOT NULL,
  expiration BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS cache_locks_expiration_index ON public.cache_locks (expiration);

-- ---------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id           BIGSERIAL PRIMARY KEY,
  queue        VARCHAR(255) NOT NULL,
  payload      TEXT NOT NULL,
  attempts     SMALLINT NOT NULL,
  reserved_at  INT NULL DEFAULT NULL,
  available_at INT NOT NULL,
  created_at   INT NOT NULL
);

CREATE INDEX IF NOT EXISTS jobs_queue_index ON public.jobs (queue);

-- ---------------------------------------------------------
-- Sessions
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  id            VARCHAR(255) PRIMARY KEY,
  user_id       UUID NULL DEFAULT NULL,
  ip_address    VARCHAR(45) NULL DEFAULT NULL,
  user_agent    TEXT NULL DEFAULT NULL,
  payload       TEXT NOT NULL,
  last_activity INT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_index ON public.sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_last_activity_index ON public.sessions (last_activity);

-- ---------------------------------------------------------
-- Enable Row Level Security (RLS)
-- ---------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- Create RLS Policies
-- ---------------------------------------------------------

-- Users can read their own data
CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Products are readable by everyone
CREATE POLICY products_select_all ON public.products
  FOR SELECT USING (true);

-- Categories are readable by everyone
CREATE POLICY categories_select_all ON public.categories
  FOR SELECT USING (true);

-- Users can manage their own cart
CREATE POLICY cart_items_select_own ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY cart_items_insert_own ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY cart_items_update_own ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY cart_items_delete_own ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY orders_select_own ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- ---------------------------------------------------------
-- Insert Default Data
-- ---------------------------------------------------------

-- Insert default categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Supplements', 'supplements', 1),
  ('Equipment', 'equipment', 2),
  ('Clothing', 'clothing', 3),
  ('Accessories', 'accessories', 4);

-- Insert sample products
INSERT INTO public.products (name, slug, description, price, category_id, stock, is_featured) VALUES
  ('Premium Whey Protein', 'premium-whey-protein', 'High-quality whey protein for muscle recovery', 59.99, 1, 100, TRUE),
  ('Yoga Mat', 'yoga-mat', 'Eco-friendly non-slip yoga mat', 29.99, 2, 50, TRUE),
  ('Resistance Bands Set', 'resistance-bands-set', 'Complete set of 5 resistance bands', 24.99, 2, 200, FALSE);

-- Insert sample tags
INSERT INTO public.tags (name, slug) VALUES
  ('bestseller', 'bestseller'),
  ('new', 'new'),
  ('sale', 'sale');

-- Link products to tags
INSERT INTO public.product_tag (product_id, tag_id) VALUES
  (1, 1), (1, 2), (2, 1), (3, 3);

-- ---------------------------------------------------------
-- Create default admin role
-- ---------------------------------------------------------
INSERT INTO public.roles (name, guard_name) VALUES 
  ('admin', 'web'),
  ('customer', 'web');

INSERT INTO public.permissions (name, guard_name) VALUES 
  ('view products', 'web'),
  ('edit products', 'web'),
  ('delete products', 'web'),
  ('view orders', 'web'),
  ('edit orders', 'web');

-- Assign permissions to admin role
INSERT INTO public.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'admin';

-- ---------------------------------------------------------
-- Create Functions
-- ---------------------------------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON public.categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------
-- Grant permissions
-- ---------------------------------------------------------
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ---------------------------------------------------------
-- Done!
-- ---------------------------------------------------------