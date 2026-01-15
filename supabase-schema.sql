-- ============================================================================
-- TODAY SHAWARMA - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ============================================================================
-- 1. ORDERS TABLE (Main table for POS)
-- ============================================================================
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT DEFAULT 'Walk-in',
  session_id TEXT,
  table_number TEXT DEFAULT 'counter',
  pickup_time TEXT,
  special_instructions TEXT DEFAULT '',
  
  items JSONB NOT NULL DEFAULT '[]',
  
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Status: preparing (in kitchen), ready (done cooking), completed (picked up), cancelled
  status TEXT NOT NULL DEFAULT 'preparing' CHECK (status IN ('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled')),
  
  -- Payment tracking (stored in special_instructions as "PAID" or "UNPAID")
  payment_method TEXT, -- 'cash', 'card'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. MENU CATEGORIES
-- ============================================================================
DROP TABLE IF EXISTS menu_categories CASCADE;
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. MENU ITEMS
-- ============================================================================
DROP TABLE IF EXISTS menu_items CASCADE;
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  
  price DECIMAL(10,2) NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  is_sold_out BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. RESTAURANT SETTINGS
-- ============================================================================
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS cafe_settings CASCADE;
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings for Today Shawarma
INSERT INTO settings (key, value) VALUES
  ('accepting_orders', 'true'),
  ('table_count', '10'),
  ('tax_rate', '0'),
  ('currency', '"£"'),
  ('restaurant_name', '"Today Shawarma"'),
  ('restaurant_address', '"203 Dalry Road, Edinburgh"'),
  ('restaurant_phone', '"+44 131 XXX XXXX"')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================================
-- 5. STAFF TABLE (Simplified)
-- ============================================================================
DROP TABLE IF EXISTS staff CASCADE;
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO staff (username, password_hash, name, role) VALUES
  ('admin', 'admin123', 'Admin', 'admin')
ON CONFLICT (username) DO UPDATE SET password_hash = 'admin123';

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Policies (allowing all for simplicity - restrict in production)
DROP POLICY IF EXISTS "Allow all on orders" ON orders;
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on menu_categories" ON menu_categories;
CREATE POLICY "Allow all on menu_categories" ON menu_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on menu_items" ON menu_items;
CREATE POLICY "Allow all on menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on settings" ON settings;
CREATE POLICY "Allow all on settings" ON settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on staff" ON staff;
CREATE POLICY "Allow all on staff" ON staff FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- REALTIME - Enable for orders and settings
-- ============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE orders;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE settings;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  ALTER PUBLICATION supabase_realtime ADD TABLE settings;
END $$;

-- ============================================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_categories_updated_at ON menu_categories;
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - MENU CATEGORIES FOR TODAY SHAWARMA
-- ============================================================================
INSERT INTO menu_categories (name, slug, description, icon, sort_order) VALUES
  ('Shawarma & Wraps', 'shawarma', 'Authentic shawarma sandwiches and wraps', 'Utensils', 1),
  ('Pizzas', 'pizza', 'Fresh 10" pizzas', 'Pizza', 2),
  ('Fatayer', 'fatayer', 'Traditional Middle Eastern pastries', 'Cookie', 3),
  ('Grill & Kebabs', 'grill', 'Grilled meats and platters', 'Flame', 4),
  ('Meals', 'meals', 'Full meals with chips and salad', 'UtensilsCrossed', 5),
  ('Extras', 'extras', 'Sides and extras', 'Plus', 6),
  ('Drinks', 'drinks', 'Refreshing beverages', 'Cup', 7)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- SEED DATA - SHAWARMA & WRAPS
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, is_active, is_popular, category_id, sort_order) 
SELECT 'Lamb Shawarma Sandwich', 'lamb-shawarma-sandwich', NULL, 4.99, true, true, id, 1
FROM menu_categories WHERE slug = 'shawarma'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, is_popular, category_id, sort_order) 
SELECT 'Chicken Shawarma Sandwich', 'chicken-shawarma-sandwich', NULL, 4.50, true, true, id, 2
FROM menu_categories WHERE slug = 'shawarma'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Lamb Shawarma Wrap', 'lamb-shawarma-wrap', NULL, 4.99, true, id, 3
FROM menu_categories WHERE slug = 'shawarma'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Chicken Shawarma Wrap', 'chicken-shawarma-wrap', NULL, 4.50, true, id, 4
FROM menu_categories WHERE slug = 'shawarma'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Falafel Wrap', 'falafel-wrap', NULL, 4.99, true, id, 5
FROM menu_categories WHERE slug = 'shawarma'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - PIZZAS
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Margherita', 'margherita-pizza', 'Cheese & tomato', 4.99, true, id, 1
FROM menu_categories WHERE slug = 'pizza'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Chicken Pizza', 'chicken-pizza', 'Chicken, mushroom & sweetcorn', 5.99, true, id, 2
FROM menu_categories WHERE slug = 'pizza'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Lamb Pizza', 'lamb-pizza', 'Lamb, green chilli & onions', 6.99, true, id, 3
FROM menu_categories WHERE slug = 'pizza'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Meat Feast', 'meat-feast-pizza', 'Chicken, lamb & pepperoni', 6.99, true, id, 4
FROM menu_categories WHERE slug = 'pizza'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Veggie Pizza', 'veggie-pizza', 'Mushrooms, onions, sweetcorn & green peppers', 5.50, true, id, 5
FROM menu_categories WHERE slug = 'pizza'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Mighty Meaty', 'mighty-meaty-pizza', 'Chicken, lamb, donner, spicy beef', 6.99, true, id, 6
FROM menu_categories WHERE slug = 'pizza'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Garlic Bread with Cheese', 'garlic-bread-cheese', NULL, 3.99, true, id, 7
FROM menu_categories WHERE slug = 'pizza'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - FATAYER
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Chicken Fatayer', 'chicken-fatayer', NULL, 4.99, true, id, 1
FROM menu_categories WHERE slug = 'fatayer'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Lamb Fatayer', 'lamb-fatayer', NULL, 5.99, true, id, 2
FROM menu_categories WHERE slug = 'fatayer'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Mix Fatayer', 'mix-fatayer', NULL, 5.50, true, id, 3
FROM menu_categories WHERE slug = 'fatayer'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Veggie Fatayer', 'veggie-fatayer', NULL, 4.99, true, id, 4
FROM menu_categories WHERE slug = 'fatayer'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Cheese Fatayer', 'cheese-fatayer', NULL, 3.99, true, id, 5
FROM menu_categories WHERE slug = 'fatayer'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - GRILL & KEBABS
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Mix Platter', 'mix-platter', '2 Chicken Tikka, 2 Lamb Tikka, 4 Kebabs, 5 Lamb Chops, 6 Chicken Wings, Rice & Salad', 60.00, true, id, 1
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Mix Kebab Full', 'mix-kebab-full', '2 Kebabs, Chicken Tikka, Lamb Tikka, 2 Naan & Salad', 17.00, true, id, 2
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Mix Kebab Half', 'mix-kebab-half', 'Lamb Kebab, Chicken Tikka, Lamb Tikka & Salad', 14.00, true, id, 3
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Lamb Chops (5) with Salad & Naan', 'lamb-chops-naan', 'Served with Salad & Naan', 13.00, true, id, 4
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Lamb Chops (5) with Rice & Soup', 'lamb-chops-rice', 'Served with Rice & Soup', 16.00, true, id, 5
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Lamb Kebab (2) with Salad & Naan', 'lamb-kebab-naan', 'Served with Salad & Naan', 11.00, true, id, 6
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Lamb Tikka (2) with Salad & Naan', 'lamb-tikka-naan', 'Served with Salad & Naan', 13.00, true, id, 7
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Chicken Tikka (2) with Salad & Naan', 'chicken-tikka-naan', 'Served with Salad & Naan', 10.00, true, id, 8
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Chicken Wings (10) with Salad & Naan', 'chicken-wings-naan', 'Served with Salad & Naan', 9.00, true, id, 9
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Dolma (Saturday Only)', 'dolma', 'Available on Saturday Only', 12.00, true, id, 10
FROM menu_categories WHERE slug = 'grill'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - MEALS
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, is_active, is_popular, category_id, sort_order) 
SELECT 'Lamb Shawarma Meal', 'lamb-shawarma-meal', 'With Chips & Salad', 7.99, true, true, id, 1
FROM menu_categories WHERE slug = 'meals'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, is_popular, category_id, sort_order) 
SELECT 'Chicken Shawarma Meal', 'chicken-shawarma-meal', 'With Chips & Salad', 6.99, true, true, id, 2
FROM menu_categories WHERE slug = 'meals'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Falafel Meal (6 pcs)', 'falafel-meal', 'With naan & salad', 5.99, true, id, 3
FROM menu_categories WHERE slug = 'meals'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - EXTRAS
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Chips', 'chips', NULL, 2.50, true, id, 1
FROM menu_categories WHERE slug = 'extras'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Fresh Salad', 'fresh-salad', NULL, 2.50, true, id, 2
FROM menu_categories WHERE slug = 'extras'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Falafel', 'falafel', NULL, 3.99, true, id, 3
FROM menu_categories WHERE slug = 'extras'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Hummus', 'hummus', NULL, 3.00, true, id, 4
FROM menu_categories WHERE slug = 'extras'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Tub of Sauce', 'tub-of-sauce', NULL, 0.50, true, id, 5
FROM menu_categories WHERE slug = 'extras'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Extra Toppings (Meat)', 'extra-toppings-meat', NULL, 0.70, true, id, 6
FROM menu_categories WHERE slug = 'extras'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Extra Toppings (Veg)', 'extra-toppings-veg', NULL, 0.70, true, id, 7
FROM menu_categories WHERE slug = 'extras'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Extra Cheese', 'extra-cheese', NULL, 1.00, true, id, 8
FROM menu_categories WHERE slug = 'extras'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - DRINKS
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Can of Drink', 'can-of-drink', NULL, 1.00, true, id, 1
FROM menu_categories WHERE slug = 'drinks'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Bottle', 'bottle-drink', NULL, 1.50, true, id, 2
FROM menu_categories WHERE slug = 'drinks'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, is_active, category_id, sort_order) 
SELECT 'Ayran', 'ayran', NULL, 1.00, true, id, 3
FROM menu_categories WHERE slug = 'drinks'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- DONE! Schema is ready for Today Shawarma
-- ============================================================================
