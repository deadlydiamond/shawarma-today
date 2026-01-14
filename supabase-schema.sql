-- ============================================================================
-- LEAF & BEAN CAFÉ - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ============================================================================
-- 1. MENU CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. MENU ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  price_large DECIMAL(10,2),
  price_kids DECIMAL(10,2),
  cost_price DECIMAL(10,2), -- For profit calculation
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  is_sold_out BOOLEAN DEFAULT false,
  sold_out_until TIMESTAMPTZ, -- Auto re-enable after this time
  
  -- Special flags
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_dairy_free BOOLEAN DEFAULT false,
  
  -- Variants (stored as JSONB for flexibility)
  -- e.g. [{"name": "Oat Milk", "price_modifier": 0.50}, {"name": "Almond Milk", "price_modifier": 0.50}]
  variants JSONB DEFAULT '[]',
  
  -- Customizations available
  -- e.g. [{"name": "Extra Shot", "price": 0.60}, {"name": "Syrup", "price": 0.50}]
  customizations JSONB DEFAULT '[]',
  
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. PROMOTIONS & DISCOUNTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Type: 'percentage', 'fixed_amount', 'buy_x_get_y', 'combo'
  promo_type TEXT NOT NULL,
  
  -- Discount value (percentage or fixed amount)
  discount_value DECIMAL(10,2),
  
  -- For buy X get Y promotions
  buy_quantity INTEGER,
  get_quantity INTEGER,
  
  -- Applicability
  applies_to TEXT DEFAULT 'all', -- 'all', 'category', 'item'
  category_id UUID REFERENCES menu_categories(id),
  item_ids UUID[], -- Array of item IDs
  
  -- Conditions
  min_order_value DECIMAL(10,2),
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  
  -- Validity
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Promo code (optional)
  promo_code TEXT UNIQUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. BANNERS (Promotional, Announcements)
-- ============================================================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type: 'hero', 'announcement', 'promo', 'info'
  banner_type TEXT NOT NULL DEFAULT 'announcement',
  
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  
  -- Visual
  image_url TEXT,
  background_color TEXT,
  text_color TEXT,
  
  -- Action button
  button_text TEXT,
  button_link TEXT,
  
  -- Positioning
  position TEXT DEFAULT 'top', -- 'top', 'hero', 'menu', 'checkout'
  sort_order INTEGER DEFAULT 0,
  
  -- Validity
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. TODAY'S SPECIALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Override pricing for special
  special_price DECIMAL(10,2),
  discount_percentage INTEGER,
  
  -- Description
  special_name TEXT, -- e.g. "Monday Madness"
  special_description TEXT,
  
  -- Day of week (0 = Sunday, 1 = Monday, etc.) or NULL for specific date
  day_of_week INTEGER,
  specific_date DATE,
  
  -- Time window
  start_time TIME,
  end_time TIME,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. ORDERS TABLE (Updated)
-- ============================================================================
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  table_number TEXT NOT NULL,
  special_instructions TEXT DEFAULT '',
  
  items JSONB NOT NULL,
  
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Promotion applied
  promotion_id UUID REFERENCES promotions(id),
  promo_code_used TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled')),
  
  -- Payment tracking
  payment_method TEXT, -- 'cash', 'card', 'mobile'
  payment_received_at TIMESTAMPTZ,
  payment_received_by TEXT, -- Staff name
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. CAFE SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cafe_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO cafe_settings (key, value) VALUES
  ('business_hours', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}'),
  ('accepting_orders', 'true'),
  ('estimated_wait_base', '5'),
  ('estimated_wait_per_order', '3'),
  ('table_count', '20'),
  ('tax_rate', '0'),
  ('currency', '"£"'),
  ('cafe_name', '"Leaf & Bean Café"'),
  ('cafe_address', '"123 Morningside Road, Edinburgh"'),
  ('cafe_phone', '"+44 7887 910900"')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 8. STAFF TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- In production, use proper hashing
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'waiter', 'kitchen')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default staff (passwords should be hashed in production)
INSERT INTO staff (username, password_hash, name, role) VALUES
  ('admin', 'leafbean2024', 'Admin', 'manager'),
  ('manager', 'manager2024', 'Manager', 'manager'),
  ('waiter', 'waiter2024', 'Waiter', 'waiter'),
  ('kitchen', 'kitchen2024', 'Kitchen Staff', 'kitchen')
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_specials_day ON daily_specials(day_of_week);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Policies (allowing all for now - restrict in production)
CREATE POLICY "Allow all on menu_categories" ON menu_categories FOR ALL USING (true);
CREATE POLICY "Allow all on menu_items" ON menu_items FOR ALL USING (true);
CREATE POLICY "Allow all on promotions" ON promotions FOR ALL USING (true);
CREATE POLICY "Allow all on banners" ON banners FOR ALL USING (true);
CREATE POLICY "Allow all on daily_specials" ON daily_specials FOR ALL USING (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all on cafe_settings" ON cafe_settings FOR ALL USING (true);
CREATE POLICY "Allow all on staff" ON staff FOR ALL USING (true);

-- ============================================================================
-- REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE banners;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_specials;

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

CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - CATEGORIES
-- ============================================================================
INSERT INTO menu_categories (name, slug, description, icon, sort_order) VALUES
  ('Coffee & Drinks', 'coffee', 'Our own coffee blend roasted locally with the finest Arabica beans', 'Coffee', 1),
  ('Breakfast', 'breakfast', 'Start your day right with our fresh breakfast options', 'Utensils', 2),
  ('Sandwiches & Ciabatta', 'sandwiches', 'Served with salad & crisps. Available as ciabatta, sandwich, toastie, wrap or quesadilla', 'Sandwich', 3),
  ('Tea & Specialty Drinks', 'tea', 'Hot and refreshing beverages', 'CupSoda', 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - MENU ITEMS (Coffee)
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, price_large, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Espresso', 'espresso', 'Rich and bold single shot of our premium coffee blend', 3.30, 3.70, 
  'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=75', true, false, id, 1
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, price_large, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Americano', 'americano', 'Espresso with hot water for a smooth, full-bodied cup', 3.70, 4.20, 
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=75', true, false, id, 2
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Long Black', 'long-black', 'Double espresso with hot water for a stronger flavour', 3.70, 
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=75', true, id, 3
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, price_large, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Latte', 'latte', 'Smooth espresso with steamed milk and a light foam layer', 3.90, 4.30, 
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=75', true, true, id, 4
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, price_large, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Cappuccino', 'cappuccino', 'Espresso with steamed milk and a layer of velvety foam', 4.10, 4.40, 
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=75', true, true, id, 5
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Flat White', 'flat-white', 'Double espresso with microfoam for a creamy texture', 4.10, 
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=75', true, true, id, 6
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, price_large, image_url, is_active, category_id, sort_order) 
SELECT 
  'Macchiato', 'macchiato', 'Espresso with a dollop of foamed milk', 3.70, 4.10, 
  'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=75', true, id, 7
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, price_large, image_url, is_active, category_id, sort_order) 
SELECT 
  'Cortado', 'cortado', 'Espresso cut with a small amount of warm milk', 3.70, 4.10, 
  'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=75', true, id, 8
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Dirty Chai Latte', 'dirty-chai-latte', 'Chai tea with a shot of espresso', 4.80, 
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=75', true, id, 9
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, price_large, image_url, is_active, category_id, sort_order) 
SELECT 
  'Milk Chocolate Mocha', 'milk-chocolate-mocha', 'Espresso with milk chocolate and steamed milk', 4.50, 4.95, 
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=75', true, id, 10
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, price_large, image_url, is_active, category_id, sort_order) 
SELECT 
  'Dark Chocolate Mocha', 'dark-chocolate-mocha', 'Espresso with dark chocolate and steamed milk', 4.50, 4.95, 
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=75', true, id, 11
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Chai Latte', 'chai-latte', 'Spiced tea with steamed milk', 4.40, 
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=75', true, id, 12
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_new, category_id, sort_order) 
SELECT 
  'Matcha Latte', 'matcha-latte', 'Japanese green tea powder with steamed milk', 4.95, 
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=75', true, true, id, 13
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Vanilla Matcha', 'vanilla-matcha', 'Matcha latte with vanilla syrup', 5.30, 
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=75', true, id, 14
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, price_kids, image_url, is_active, category_id, sort_order) 
SELECT 
  'Hot Chocolate', 'hot-chocolate', 'Rich milk chocolate or dark chocolate (vegan)', 4.60, 4.05, 
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=75', true, id, 15
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Babycino', 'babycino', 'Frothed milk for little ones', 1.90, 
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=75', true, id, 16
FROM menu_categories WHERE slug = 'coffee'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - MENU ITEMS (Breakfast)
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Toast with Scrambled or Fried Egg', 'toast-with-egg', 'From our local French bakery, served with scrambled or fried egg', 7.10, 
  'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=75', true, id, 1
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Toast with Raspberry Jam & Butter', 'toast-jam-butter', 'From our local French bakery', 5.30, 
  'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=75', true, id, 2
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Breakfast Roll with Egg', 'breakfast-roll-egg', 'Fresh morning roll from our local French bakery with scrambled or fried egg', 5.60, 
  'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=75', true, id, 3
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Breakfast Roll with Lorne Sausage', 'breakfast-roll-sausage', 'Fresh morning roll with local butchers Lorne sausage', 5.60, 
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=75', true, true, id, 4
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Breakfast Roll with Danish Back Bacon', 'breakfast-roll-bacon', 'Fresh morning roll with Danish back bacon', 5.60, 
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=75', true, id, 5
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Pancakes with Maple Syrup or Honey', 'pancakes-maple', 'Stack of fluffy pancakes served with maple syrup or honey', 6.80, 
  'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=75', true, id, 6
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Pancakes with Bacon & Maple Syrup', 'pancakes-bacon-maple', 'Pancakes with Danish back bacon and maple syrup', 8.50, 
  'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=75', true, true, id, 7
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Pancakes with Nutella & Marshmallows', 'pancakes-nutella', 'Pancakes topped with Nutella and marshmallows', 6.80, 
  'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=75', true, id, 8
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_vegan, category_id, sort_order) 
SELECT 
  'Smashed Avocado on Bloomer', 'smashed-avocado', 'Avocado on French bloomer', 8.30, 
  'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=75', true, true, id, 9
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Avocado with Bacon on Bloomer', 'avocado-bacon', 'Avocado with Danish back bacon on French bloomer', 9.40, 
  'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=75', true, true, id, 10
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Avocado with Egg on Bloomer', 'avocado-egg', 'Avocado with fried or scrambled egg on French bloomer', 9.40, 
  'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=75', true, id, 11
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Avocado with Bacon & Egg on Bloomer', 'avocado-bacon-egg', 'Avocado with Danish back bacon and fried or scrambled egg on French bloomer', 10.60, 
  'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=75', true, id, 12
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_vegetarian, category_id, sort_order) 
SELECT 
  'Avocado with Feta & Chilli Flakes', 'avocado-feta-chilli', 'Avocado with Feta cheese and chilli flakes on French bloomer', 9.60, 
  'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=75', true, true, id, 13
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Fresh Soup of the Day', 'soup-of-day', 'Fresh soup served with fresh French bloomer - please ask staff for todays soup', 6.50, 
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=75', true, id, 14
FROM menu_categories WHERE slug = 'breakfast'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - MENU ITEMS (Sandwiches)
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_vegetarian, category_id, sort_order) 
SELECT 
  'Tomato, Pesto & Mozzarella', 'tomato-pesto-mozzarella', 'Fresh tomato, pesto and mozzarella', 9.80, 
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=75', true, true, id, 1
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Tuna Melt', 'tuna-melt', 'Tuna with melted cheese', 9.80, 
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=75', true, true, id, 2
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Tuna & Sweetcorn', 'tuna-sweetcorn', 'Tuna and sweetcorn', 9.80, 
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=75', true, id, 3
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Ham & Cheese', 'ham-cheese', 'Ham and cheese', 9.80, 
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=75', true, id, 4
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_vegetarian, category_id, sort_order) 
SELECT 
  'Feta, Tomato & Oregano', 'feta-tomato-oregano', 'Feta cheese, tomato and oregano', 9.80, 
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=75', true, true, id, 5
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Mexican Chicken & Mozzarella', 'mexican-chicken', 'Spiced Mexican chicken with mozzarella', 9.80, 
  'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=75', true, true, id, 6
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Chicken Tikka & Mozzarella', 'chicken-tikka', 'Spiced chicken tikka with mozzarella', 9.80, 
  'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=75', true, id, 7
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Pastrami, Parma Ham & Cheddar', 'pastrami-parma-cheddar', 'Pastrami, parma ham, cheddar cheese, tomato and chilli jam', 9.95, 
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=75', true, id, 8
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_vegetarian, category_id, sort_order) 
SELECT 
  'Fresh Basil, Tomato & Cheddar', 'basil-tomato-cheddar', 'Fresh basil, tomato, chilli jam and cheddar cheese', 9.80, 
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=75', true, true, id, 9
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, is_vegan, category_id, sort_order) 
SELECT 
  'Sun Blushed Tomato & Hummus', 'sun-dried-tomato-hummus', 'Sun blushed tomato, fresh basil, hummus and pesto', 9.80, 
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=75', true, true, id, 10
FROM menu_categories WHERE slug = 'sandwiches'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - MENU ITEMS (Tea & Specialty)
-- ============================================================================
INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Scottish Breakfast Tea', 'scottish-breakfast-tea', 'Traditional Scottish breakfast blend', 3.80, 
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=75', true, id, 1
FROM menu_categories WHERE slug = 'tea'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Earl Grey', 'earl-grey', 'Classic bergamot-scented black tea', 3.80, 
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=75', true, id, 2
FROM menu_categories WHERE slug = 'tea'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Green Tea', 'green-tea', 'Light and refreshing green tea', 3.80, 
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=75', true, id, 3
FROM menu_categories WHERE slug = 'tea'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Peppermint Tea', 'peppermint-tea', 'Soothing and refreshing herbal tea', 3.80, 
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=75', true, id, 4
FROM menu_categories WHERE slug = 'tea'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, price_large, image_url, is_active, is_popular, category_id, sort_order) 
SELECT 
  'Frappuccino', 'frappuccino', 'Iced blended coffee - Caramel, Vanilla, Salted Caramel, Chocolate, or Strawberries & Cream', 4.50, 5.10, 
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=75', true, true, id, 5
FROM menu_categories WHERE slug = 'tea'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Milkshake', 'milkshake', 'Creamy milkshake - Vanilla, Strawberry, or Chocolate', 5.20, 
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=75', true, id, 6
FROM menu_categories WHERE slug = 'tea'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name, slug, description, price, image_url, is_active, category_id, sort_order) 
SELECT 
  'Smoothie', 'smoothie', 'Fresh fruit smoothies - Broccoli & Mango or Passion Fruit & Mango', 5.50, 
  'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=75', true, id, 7
FROM menu_categories WHERE slug = 'tea'
ON CONFLICT (slug) DO NOTHING;
