-- ========================================
-- Seed Data — Fitness Store
-- ========================================
-- Run via: supabase db reset
-- ========================================

-- ---------------------------------------------------------
-- Categories
-- ---------------------------------------------------------
INSERT INTO public.categories (name, slug, description, sort_order, is_active) VALUES
  ('Cardio Equipment',    'cardio-equipment',    'Treadmills, exercise bikes, ellipticals & more',        1, TRUE),
  ('Strength Training',   'strength-training',   'Dumbbells, barbells, kettlebells & weight benches',     2, TRUE),
  ('Yoga & Pilates',      'yoga-pilates',        'Mats, blocks, straps & accessories',                   3, TRUE),
  ('Supplements',         'supplements',         'Protein powders, vitamins & recovery',                 4, TRUE),
  ('Apparel',             'apparel',             'Activewear for men and women',                          5, TRUE),
  ('Accessories',         'accessories',         'Gloves, belts, water bottles & gym bags',              6, TRUE);

-- ---------------------------------------------------------
-- Tags
-- ---------------------------------------------------------
INSERT INTO public.tags (name, slug) VALUES
  ('Best Seller', 'best-seller'),
  ('New Arrival', 'new-arrival'),
  ('Sale',        'sale'),
  ('Premium',     'premium'),
  ('Eco Friendly','eco-friendly');

-- ---------------------------------------------------------
-- Products
-- ---------------------------------------------------------
INSERT INTO public.products (name, slug, description, price, category_id, stock, is_featured, is_active) VALUES
  ('Pro Treadmill X1',    'pro-treadmill-x1',    'Commercial-grade treadmill with 22" touchscreen and incline up to 15%.',  2499.99, 1, 10, TRUE, TRUE),
  ('Air Bike Elite',      'air-bike-elite',      'Fan resistance air bike, full-body workout, LCD monitor.',                899.99,  1, 15, TRUE, TRUE),
  ('Adjustable Dumbbell Set 50lb', 'adjustable-dumbbell-set-50lb', 'Space-saving adjustable dumbbells, 5–50 lb per hand.',  399.99,  2, 20, TRUE, TRUE),
  ('Olympic Barbell 7ft', 'olympic-barbell-7ft', '7ft olympic barbell, 20kg, 190,000 PSI tensile strength.',              249.99,  2, 25, FALSE, TRUE),
  ('Premium Yoga Mat 6mm','premium-yoga-mat-6mm', 'Non-slip TPE yoga mat, 6mm thick, comes with carrying strap.',           49.99,   3, 50, TRUE, TRUE),
  ('Whey Isolate 5lb',    'whey-isolate-5lb',    'Grass-fed whey protein isolate, 25g protein per serving, chocolate.',    79.99,   4, 30, FALSE, TRUE),
  ('Men''s Compression Tee','mens-compression-tee','Moisture-wicking compression shirt, 4-way stretch.',                  34.99,   5, 40, FALSE, TRUE),
  ('Gym Water Bottle 1L', 'gym-water-bottle-1l', 'BPA-free Tritan water bottle, time marker, leak-proof cap.',             19.99,   6, 100, FALSE, TRUE);

-- ---------------------------------------------------------
-- Product-Tag relationships
-- ---------------------------------------------------------
INSERT INTO public.product_tag (product_id, tag_id) VALUES
  (1, 1), (1, 4),
  (2, 1),
  (3, 1), (3, 4),
  (5, 5),
  (6, 2);
