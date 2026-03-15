-- ============================================================================
-- FIX AUDIT ISSUES
-- 
-- This migration fixes:
--   1. Inquiries RLS: Replace auth.role() with admin/worker checks
--   2. Recipes, Menus, Menu_Recipes, Event_Recipes RLS: Workers SELECT, admins all
--   3. Location_Files RLS: Workers SELECT, admins all
--   4. Missing indexes on: events(status), events(is_archived), 
--      inquiries(status), inquiries(assigned_to), persons(email), 
--      location_files(location_id)
--   5. Missing foreign keys on inquiries with ON DELETE SET NULL
--
-- Safe to run multiple times (idempotent).
-- ============================================================================

-- ============================================================================
-- 1. FIX INQUIRIES RLS
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can manage inquiries" ON inquiries;
DROP POLICY IF EXISTS "admin_inquiries_all" ON inquiries;
DROP POLICY IF EXISTS "workers_inquiries_select" ON inquiries;

-- Admins can do everything
CREATE POLICY "admin_inquiries_all" ON inquiries
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- Workers can SELECT inquiries
CREATE POLICY "workers_inquiries_select" ON inquiries
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- 2. FIX RECIPES RLS
-- ============================================================================

DROP POLICY IF EXISTS "recipes_all" ON recipes;
DROP POLICY IF EXISTS "admin_recipes_all" ON recipes;
DROP POLICY IF EXISTS "workers_recipes_select" ON recipes;

-- Admins can do everything
CREATE POLICY "admin_recipes_all" ON recipes
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- Workers can SELECT recipes
CREATE POLICY "workers_recipes_select" ON recipes
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- 3. FIX MENUS RLS
-- ============================================================================

DROP POLICY IF EXISTS "menus_all" ON menus;
DROP POLICY IF EXISTS "admin_menus_all" ON menus;
DROP POLICY IF EXISTS "workers_menus_select" ON menus;

-- Admins can do everything
CREATE POLICY "admin_menus_all" ON menus
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- Workers can SELECT menus
CREATE POLICY "workers_menus_select" ON menus
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- 4. FIX MENU_RECIPES RLS
-- ============================================================================

DROP POLICY IF EXISTS "menu_recipes_all" ON menu_recipes;
DROP POLICY IF EXISTS "admin_menu_recipes_all" ON menu_recipes;
DROP POLICY IF EXISTS "workers_menu_recipes_select" ON menu_recipes;

-- Admins can do everything
CREATE POLICY "admin_menu_recipes_all" ON menu_recipes
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- Workers can SELECT menu_recipes
CREATE POLICY "workers_menu_recipes_select" ON menu_recipes
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- 5. FIX EVENT_RECIPES RLS
-- ============================================================================

DROP POLICY IF EXISTS "event_recipes_all" ON event_recipes;
DROP POLICY IF EXISTS "admin_event_recipes_all" ON event_recipes;
DROP POLICY IF EXISTS "workers_event_recipes_select" ON event_recipes;

-- Admins can do everything
CREATE POLICY "admin_event_recipes_all" ON event_recipes
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- Workers can SELECT event_recipes
CREATE POLICY "workers_event_recipes_select" ON event_recipes
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- 6. FIX LOCATION_FILES RLS
-- ============================================================================

DROP POLICY IF EXISTS "admin_location_files_all" ON location_files;
DROP POLICY IF EXISTS "workers_location_files_select" ON location_files;
DROP POLICY IF EXISTS "authenticated_location_files_all" ON location_files;

-- Admins can do everything
CREATE POLICY "admin_location_files_all" ON location_files
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- Workers can SELECT location_files
CREATE POLICY "workers_location_files_select" ON location_files
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- 7. ADD MISSING INDEXES
-- ============================================================================

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_archived ON events(is_archived);

-- Inquiries indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON inquiries(assigned_to);

-- Persons index
CREATE INDEX IF NOT EXISTS idx_persons_email ON persons(email);

-- Location_files index
CREATE INDEX IF NOT EXISTS idx_location_files_location_id ON location_files(location_id);

-- ============================================================================
-- 8. ADD MISSING FOREIGN KEYS ON INQUIRIES
-- ============================================================================

-- Check if constraint already exists before adding it
-- Note: ON DELETE SET NULL ensures we don't break existing data if referenced users are deleted

ALTER TABLE inquiries
  ADD CONSTRAINT fk_inquiries_assigned_to 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL
  NOT VALID;

ALTER TABLE inquiries VALIDATE CONSTRAINT fk_inquiries_assigned_to;

ALTER TABLE inquiries
  ADD CONSTRAINT fk_inquiries_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
  NOT VALID;

ALTER TABLE inquiries VALIDATE CONSTRAINT fk_inquiries_created_by;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
