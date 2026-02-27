-- =============================================
-- MENUT & RESEPTIT - Tietokantarakenne
-- Aja tämä Supabase SQL Editorissa
-- =============================================

-- 1. Reseptit (yksittäiset annokset)
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'muu' CHECK (category IN (
    'alkuruoka', 'pääruoka', 'jälkiruoka', 'salaatti',
    'keitto', 'välipala', 'cocktailpala', 'leipä',
    'juoma', 'muu'
  )),
  tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  ingredients TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  modified_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Menut (menukokonaisuudet)
CREATE TABLE IF NOT EXISTS menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  menu_type TEXT DEFAULT 'muu' CHECK (menu_type IN (
    '3-ruokalajin illallinen', 'buffet', 'cocktailpalat',
    'lounas', 'aamupala', 'snacks', 'muu'
  )),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  modified_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Menu-resepti yhteys (mitkä reseptit kuuluvat menuun)
CREATE TABLE IF NOT EXISTS menu_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  course_order INT DEFAULT 0,
  course_label TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  UNIQUE(menu_id, recipe_id)
);

-- 4. Tapahtuma-resepti yhteys (yksittäisiä annoksia tapahtumiin)
CREATE TABLE IF NOT EXISTS event_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  servings INT DEFAULT 0,
  notes TEXT DEFAULT '',
  UNIQUE(event_id, recipe_id)
);

-- RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_recipes ENABLE ROW LEVEL SECURITY;

-- Policies (authenticated users can do everything)
CREATE POLICY "recipes_all" ON recipes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "menus_all" ON menus FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "menu_recipes_all" ON menu_recipes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "event_recipes_all" ON event_recipes FOR ALL TO authenticated USING (true) WITH CHECK (true);
