-- Typedwn Event Management App - Supabase Database Schema
-- Created: 2026-02-06

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security on all tables
ALTER DATABASE postgres SET "app.enable_rls" = 'true';

-- ============================================================================
-- 1. USERS TABLE (extends auth.users)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'worker', 'temporary')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  modified_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. PERSONS TABLE (contacts/clients - admin only)
-- ============================================================================

CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(255),
  job VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  website VARCHAR(255),
  profile VARCHAR(50) DEFAULT 'NEW CONTACT' CHECK (profile IN ('NEW CONTACT', 'PROSPECT', 'CUSTOMER', 'REGULAR')),
  next_action TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  modified_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE persons ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. LOCATIONS TABLE
-- ============================================================================

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100),
  capacity INTEGER,
  address VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now(),
  modified_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. EVENTS TABLE
-- ============================================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  event_time VARCHAR(20),
  venue_time VARCHAR(20),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  pax INTEGER,
  company VARCHAR(255),
  booker VARCHAR(255),
  client_name VARCHAR(255),
  contact_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'PRELIMINARY' CHECK (status IN ('PRELIMINARY', 'WORKING ON IT', 'NOT CONFIRMED', 'CONFIRMED', 'DONE')),
  food VARCHAR(255),
  drinks VARCHAR(255),
  tech VARCHAR(255),
  program VARCHAR(255),
  food_price INTEGER,
  drinks_price INTEGER,
  tech_price INTEGER,
  program_price INTEGER,
  notes TEXT,
  feedback TEXT,
  language VARCHAR(20),
  goal TEXT,
  attention_notes TEXT,
  erv TEXT,
  schedule TEXT,
  menu TEXT,
  decorations TEXT,
  logistics TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  modified_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. EVENT_ASSIGNMENTS (many-to-many workers ↔ events)
-- ============================================================================

CREATE TABLE event_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'staff',
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. NOTES TABLE
-- ============================================================================

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  content TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. LOCATION_FILES TABLE
-- ============================================================================

CREATE TABLE location_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE location_files ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. EVENT_FILES TABLE
-- ============================================================================

CREATE TABLE event_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE event_files ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. ACTIVITY_LOG TABLE
-- ============================================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_event_assignments_event_id ON event_assignments(event_id);
CREATE INDEX idx_event_assignments_user_id ON event_assignments(user_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_location_id ON events(location_id);
CREATE INDEX idx_notes_event_id ON notes(event_id);
CREATE INDEX idx_notes_person_id ON notes(person_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- USERS TABLE POLICIES
-- Admins can access all users
CREATE POLICY admin_users_all ON users
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Users can view their own profile
CREATE POLICY users_view_own ON users
  FOR SELECT
  USING (id = auth.uid());

-- Admins can insert new users
CREATE POLICY admin_users_insert ON users
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- PERSONS TABLE POLICIES (admin only)
-- Admins can do everything
CREATE POLICY admin_persons_all ON persons
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- LOCATIONS TABLE POLICIES
-- Admins can do everything
CREATE POLICY admin_locations_all ON locations
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Workers can select all locations
CREATE POLICY workers_locations_select ON locations
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'worker', 'temporary')
    AND (SELECT is_active FROM users WHERE id = auth.uid()) = true
  );

-- EVENTS TABLE POLICIES
-- Admins can do everything
CREATE POLICY admin_events_all ON events
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Workers can select events they're assigned to
CREATE POLICY workers_events_select ON events
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'worker', 'temporary')
    AND (SELECT is_active FROM users WHERE id = auth.uid()) = true
    AND EXISTS (
      SELECT 1 FROM event_assignments
      WHERE event_assignments.event_id = events.id
      AND event_assignments.user_id = auth.uid()
    )
  );

-- EVENT_ASSIGNMENTS TABLE POLICIES
-- Admins can do everything
CREATE POLICY admin_event_assignments_all ON event_assignments
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Workers can view their own assignments
CREATE POLICY workers_event_assignments_select ON event_assignments
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- NOTES TABLE POLICIES
-- Admins can do everything
CREATE POLICY admin_notes_all ON notes
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Workers can insert notes for their assigned events
CREATE POLICY workers_notes_insert ON notes
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'worker', 'temporary')
    AND (SELECT is_active FROM users WHERE id = auth.uid()) = true
    AND (
      event_id IS NULL
      OR EXISTS (
        SELECT 1 FROM event_assignments
        WHERE event_assignments.event_id = event_id
        AND event_assignments.user_id = auth.uid()
      )
    )
  );

-- Workers can select their own notes or notes from their assigned events
CREATE POLICY workers_notes_select ON notes
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'worker', 'temporary')
    AND (SELECT is_active FROM users WHERE id = auth.uid()) = true
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM event_assignments
        WHERE event_assignments.event_id = notes.event_id
        AND event_assignments.user_id = auth.uid()
      )
    )
  );

-- LOCATION_FILES TABLE POLICIES
-- Admins can do everything
CREATE POLICY admin_location_files_all ON location_files
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Workers can select location files
CREATE POLICY workers_location_files_select ON location_files
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'worker', 'temporary')
    AND (SELECT is_active FROM users WHERE id = auth.uid()) = true
  );

-- EVENT_FILES TABLE POLICIES
-- Admins can do everything
CREATE POLICY admin_event_files_all ON event_files
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Workers can select and insert files for their assigned events
CREATE POLICY workers_event_files_select ON event_files
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'worker', 'temporary')
    AND (SELECT is_active FROM users WHERE id = auth.uid()) = true
    AND EXISTS (
      SELECT 1 FROM event_assignments
      WHERE event_assignments.event_id = event_id
      AND event_assignments.user_id = auth.uid()
    )
  );

CREATE POLICY workers_event_files_insert ON event_files
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'worker', 'temporary')
    AND (SELECT is_active FROM users WHERE id = auth.uid()) = true
    AND EXISTS (
      SELECT 1 FROM event_assignments
      WHERE event_assignments.event_id = event_id
      AND event_assignments.user_id = auth.uid()
    )
  );

-- ACTIVITY_LOG TABLE POLICIES
-- Admins can select all activity logs
CREATE POLICY admin_activity_log_select ON activity_log
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Workers can select their own activity logs
CREATE POLICY workers_activity_log_select ON activity_log
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- ============================================================================
-- EVENT TASKS TABLE
-- ============================================================================

CREATE TABLE event_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  due_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE event_tasks ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with tasks
CREATE POLICY "admins_full_access_tasks" ON event_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- Workers can view tasks for their assigned events
CREATE POLICY "workers_view_assigned_tasks" ON event_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_assignments ea
      JOIN users u ON u.id = auth.uid()
      WHERE ea.event_id = event_tasks.event_id
      AND ea.user_id = auth.uid()
      AND u.is_active = true
      AND (u.role != 'temporary' OR u.expires_at > now())
    )
  );

-- Workers can create tasks for their assigned events
CREATE POLICY "workers_create_tasks" ON event_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_assignments ea
      JOIN users u ON u.id = auth.uid()
      WHERE ea.event_id = event_tasks.event_id
      AND ea.user_id = auth.uid()
      AND u.is_active = true
    )
  );

-- Workers can update task status for their assigned events
CREATE POLICY "workers_update_tasks" ON event_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM event_assignments ea
      WHERE ea.event_id = event_tasks.event_id
      AND ea.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_event_tasks_event_id ON event_tasks(event_id);
CREATE INDEX idx_event_tasks_assigned_to ON event_tasks(assigned_to);
CREATE INDEX idx_event_tasks_status ON event_tasks(status);

-- ============================================================================
-- SEED DATA - LOCATIONS
-- ============================================================================

INSERT INTO locations (name, type, capacity, address, description) VALUES
(
  'BLACK BOX 360',
  'Event Space',
  120,
  'Helsinki, Finland',
  'Modernistinen tapahtumatila joka sopii erilaisille tapahtumille. Varusteltu viimeisen tekniikan mukaan.'
),
(
  'KELLOHALLI',
  'Event Hall',
  200,
  'Helsinki, Finland',
  'Väliaikainen suuritahoinen tapahtumatila, joka sopii suurille tilaisuuksille ja tapahtumille.'
),
(
  'FLAVOUR STUDIO',
  'Studio',
  30,
  'Helsinki, Finland',
  'Pieni ja intiimiä tunnelmaa luova studio. Sopii pienille ryhmille ja erikoistapahtumille.'
),
(
  'CUISINE',
  'Restaurant',
  60,
  'Helsinki, Finland',
  'Ammattitaitoinen ravintolatila ruokailuun ja juhlatilaisuuksiin. Täysi ruokapalvelu saatavilla.'
),
(
  'PIZZALA',
  'Restaurant',
  40,
  'Helsinki, Finland',
  'Casual ravintolatila pizzojen ja italialaisen ruoan tarjouksella. Sopii epämuodollisempiin tapahtumiin.'
),
(
  'FLAVOUR CATERING',
  'Catering Service',
  NULL,
  'Helsinki, Finland',
  'Kattava catering-palvelu monenlaisille tapahtumille. Herkullisia ruokapalveluita joustavasti.'
);
