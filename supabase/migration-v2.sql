-- ============================================================================
-- Typedwn Migration v2 — Align DB schema with frontend field names
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================================

-- ============================================================================
-- 1. EVENTS TABLE — Add missing columns
-- ============================================================================

-- Time fields (frontend uses start_time, end_time, end_date as text)
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time VARCHAR(20);
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time VARCHAR(20);
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date DATE;

-- Rename pax → guest_count to match frontend
ALTER TABLE events RENAME COLUMN pax TO guest_count;

-- Frontend uses camelCase for prices — add matching columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS "foodPrice" VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS "drinksPrice" VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS "techPrice" VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS "programPrice" VARCHAR(50);

-- Frontend extra text fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS "attentionNotes" TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS "clientName" VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS "menuLink" VARCHAR(500);
ALTER TABLE events ADD COLUMN IF NOT EXISTS "orderLink" VARCHAR(500);
ALTER TABLE events ADD COLUMN IF NOT EXISTS "orderNotes" TEXT;

-- Materials stored as JSONB array (frontend uses complex objects)
ALTER TABLE events ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;

-- Menu/Order attachments as JSONB
ALTER TABLE events ADD COLUMN IF NOT EXISTS "menuAttachments" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS "orderAttachments" JSONB DEFAULT '[]'::jsonb;

-- Workers assigned (stored as person ID array on the event for quick access)
ALTER TABLE events ADD COLUMN IF NOT EXISTS workers JSONB DEFAULT '[]'::jsonb;

-- Notes list (legacy inline notes)
ALTER TABLE events ADD COLUMN IF NOT EXISTS "notesList" JSONB DEFAULT '[]'::jsonb;

-- Location name for quick display (denormalized)
ALTER TABLE events ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);

-- Modified by
ALTER TABLE events ADD COLUMN IF NOT EXISTS modified_by UUID;

-- ============================================================================
-- 2. PERSONS TABLE — Align field names
-- ============================================================================

-- Frontend uses 'role' instead of 'job'
ALTER TABLE persons RENAME COLUMN job TO role;

-- Frontend uses 'type' instead of 'profile'
ALTER TABLE persons RENAME COLUMN profile TO type;
-- Update check constraint for type
ALTER TABLE persons DROP CONSTRAINT IF EXISTS persons_profile_check;
ALTER TABLE persons ADD CONSTRAINT persons_type_check
  CHECK (type IS NULL OR type IN ('NEW CONTACT', 'PROSPECT', 'CUSTOMER', 'REGULAR', 'Asiakas', 'Yhteistyökumppani', 'Toimittaja'));

-- Frontend uses 'notes' on persons
ALTER TABLE persons ADD COLUMN IF NOT EXISTS notes TEXT;

-- Frontend uses 'phone' (already exists in schema)
-- Frontend uses 'modified_at' (already exists)

-- ============================================================================
-- 3. LOCATIONS TABLE — Add missing columns
-- ============================================================================

-- Rename logo_url → logo_path
ALTER TABLE locations RENAME COLUMN logo_url TO logo_path;

-- Contact info
ALTER TABLE locations ADD COLUMN IF NOT EXISTS "contactPerson" VARCHAR(255);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS "contactEmail" VARCHAR(255);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS "contactPhone" VARCHAR(50);

-- Drive link
ALTER TABLE locations ADD COLUMN IF NOT EXISTS "driveLink" VARCHAR(500);

-- Equipment fields
ALTER TABLE locations ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS "techSpecs" TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS "kitchenEquipment" TEXT;

-- Notes
ALTER TABLE locations ADD COLUMN IF NOT EXISTS notes TEXT;

-- Modified by
ALTER TABLE locations ADD COLUMN IF NOT EXISTS modified_by UUID;

-- ============================================================================
-- 4. NOTES TABLE — Add author column
-- ============================================================================

ALTER TABLE notes ADD COLUMN IF NOT EXISTS author VARCHAR(255);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS mentioned_person_id UUID REFERENCES persons(id) ON DELETE SET NULL;

-- ============================================================================
-- 5. EVENT_ASSIGNMENTS — Fix worker_id reference
-- ============================================================================

-- Frontend uses worker_id but schema has user_id
-- We'll add worker_id as an alias approach: rename user_id to worker_id
-- Actually safer: keep user_id but also allow queries on it
-- The frontend code needs fixing instead (see migration note below)

-- ============================================================================
-- 6. EVENT_TASKS TABLE — Add missing columns
-- ============================================================================

-- Ensure assigned_to can reference persons (not just users)
-- In demo mode, tasks use person IDs for assigned_to
ALTER TABLE event_tasks ALTER COLUMN assigned_to DROP NOT NULL;
ALTER TABLE event_tasks DROP CONSTRAINT IF EXISTS event_tasks_assigned_to_fkey;

-- ============================================================================
-- 7. LOCATION_FILES — Add extra columns used by frontend
-- ============================================================================

ALTER TABLE location_files ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE location_files ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE location_files ADD COLUMN IF NOT EXISTS "driveLink" VARCHAR(500);
ALTER TABLE location_files ADD COLUMN IF NOT EXISTS "fileName" VARCHAR(255);
ALTER TABLE location_files ADD COLUMN IF NOT EXISTS "fileData" TEXT;
ALTER TABLE location_files ADD COLUMN IF NOT EXISTS "fileSize" BIGINT;
ALTER TABLE location_files ADD COLUMN IF NOT EXISTS is_logo BOOLEAN DEFAULT false;

-- ============================================================================
-- 8. TEMPORARILY OPEN RLS FOR INITIAL SETUP
-- ============================================================================

-- Allow all authenticated users to do everything (tighten later)
-- This avoids the chicken-and-egg problem with the users table

-- Events
DROP POLICY IF EXISTS "authenticated_events_all" ON events;
CREATE POLICY "authenticated_events_all" ON events
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Persons
DROP POLICY IF EXISTS "authenticated_persons_all" ON persons;
CREATE POLICY "authenticated_persons_all" ON persons
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Locations
DROP POLICY IF EXISTS "authenticated_locations_all" ON locations;
CREATE POLICY "authenticated_locations_all" ON locations
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Notes
DROP POLICY IF EXISTS "authenticated_notes_all" ON notes;
CREATE POLICY "authenticated_notes_all" ON notes
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Event tasks
DROP POLICY IF EXISTS "authenticated_tasks_all" ON event_tasks;
CREATE POLICY "authenticated_tasks_all" ON event_tasks
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Event assignments
DROP POLICY IF EXISTS "authenticated_assignments_all" ON event_assignments;
CREATE POLICY "authenticated_assignments_all" ON event_assignments
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Location files
DROP POLICY IF EXISTS "authenticated_location_files_all" ON location_files;
CREATE POLICY "authenticated_location_files_all" ON location_files
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Activity log
DROP POLICY IF EXISTS "authenticated_activity_log_all" ON activity_log;
CREATE POLICY "authenticated_activity_log_all" ON activity_log
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users: allow all authenticated to read, allow insert/update for self
DROP POLICY IF EXISTS "authenticated_users_read" ON users;
CREATE POLICY "authenticated_users_read" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_users_insert_self" ON users;
CREATE POLICY "authenticated_users_insert_self" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "authenticated_users_update_self" ON users;
CREATE POLICY "authenticated_users_update_self" ON users
  FOR UPDATE USING (id = auth.uid());
