DROP POLICY IF EXISTS "Products are manageable by authenticated" ON public.products;
CREATE POLICY "Products are manageable by authenticated"
  ON public.products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Product tags are manageable by authenticated" ON public.product_tag;
CREATE POLICY "Product tags are manageable by authenticated"
  ON public.product_tag FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Categories are manageable by authenticated" ON public.categories;
CREATE POLICY "Categories are manageable by authenticated"
  ON public.categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Tags are manageable by authenticated" ON public.tags;
CREATE POLICY "Tags are manageable by authenticated"
  ON public.tags FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
