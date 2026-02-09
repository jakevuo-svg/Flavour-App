-- ============================================================================
-- FIX RLS: Use SECURITY DEFINER helper functions to avoid nested RLS issues
-- Keeps role-based access control intact
-- Run in Supabase SQL Editor
-- ============================================================================

-- Step 1: Create helper functions that bypass RLS when checking roles
-- SECURITY DEFINER = runs as the function creator (superuser), avoids nested RLS

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================================
-- Step 2: USERS table — admin reads all, others read own
-- ============================================================================
DROP POLICY IF EXISTS "admin_users_all" ON users;
DROP POLICY IF EXISTS "users_view_own" ON users;
DROP POLICY IF EXISTS "admin_users_insert" ON users;
DROP POLICY IF EXISTS "authenticated_users_read" ON users;
DROP POLICY IF EXISTS "authenticated_users_insert_self" ON users;
DROP POLICY IF EXISTS "authenticated_users_update_self" ON users;
DROP POLICY IF EXISTS "authenticated_users_all" ON users;

-- Admin: full access
CREATE POLICY "admin_users_all" ON users
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Others: read own profile
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (id = auth.uid());

-- ============================================================================
-- Step 3: EVENTS table — admin reads all, workers read assigned
-- ============================================================================
DROP POLICY IF EXISTS "admin_events_all" ON events;
DROP POLICY IF EXISTS "workers_events_select" ON events;
DROP POLICY IF EXISTS "authenticated_events_all" ON events;

-- Admin: full access
CREATE POLICY "admin_events_all" ON events
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Workers: read events they're assigned to
CREATE POLICY "workers_events_select" ON events
  FOR SELECT USING (
    public.is_active_user()
    AND EXISTS (
      SELECT 1 FROM event_assignments
      WHERE event_assignments.event_id = events.id
      AND event_assignments.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Step 4: PERSONS table — admin full, workers read-only
-- ============================================================================
DROP POLICY IF EXISTS "admin_persons_all" ON persons;
DROP POLICY IF EXISTS "authenticated_persons_all" ON persons;

CREATE POLICY "admin_persons_all" ON persons
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "workers_persons_select" ON persons
  FOR SELECT USING (public.is_active_user());

-- ============================================================================
-- Step 5: LOCATIONS table — admin full, workers read-only
-- ============================================================================
DROP POLICY IF EXISTS "admin_locations_all" ON locations;
DROP POLICY IF EXISTS "workers_locations_select" ON locations;
DROP POLICY IF EXISTS "authenticated_locations_all" ON locations;

CREATE POLICY "admin_locations_all" ON locations
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "workers_locations_select" ON locations
  FOR SELECT USING (public.is_active_user());

-- ============================================================================
-- Step 6: NOTES table — admin full, workers read/write own events
-- ============================================================================
DROP POLICY IF EXISTS "admin_notes_all" ON notes;
DROP POLICY IF EXISTS "workers_notes_insert" ON notes;
DROP POLICY IF EXISTS "workers_notes_select" ON notes;
DROP POLICY IF EXISTS "authenticated_notes_all" ON notes;

CREATE POLICY "admin_notes_all" ON notes
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "workers_notes_select" ON notes
  FOR SELECT USING (
    public.is_active_user()
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM event_assignments
        WHERE event_assignments.event_id = notes.event_id
        AND event_assignments.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "workers_notes_insert" ON notes
  FOR INSERT WITH CHECK (public.is_active_user());

-- ============================================================================
-- Step 7: EVENT_TASKS table — admin full, workers read/update assigned
-- ============================================================================
DROP POLICY IF EXISTS "admins_full_access_tasks" ON event_tasks;
DROP POLICY IF EXISTS "workers_view_assigned_tasks" ON event_tasks;
DROP POLICY IF EXISTS "workers_create_tasks" ON event_tasks;
DROP POLICY IF EXISTS "workers_update_tasks" ON event_tasks;
DROP POLICY IF EXISTS "authenticated_tasks_all" ON event_tasks;

CREATE POLICY "admin_tasks_all" ON event_tasks
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "workers_tasks_select" ON event_tasks
  FOR SELECT USING (
    public.is_active_user()
    AND EXISTS (
      SELECT 1 FROM event_assignments ea
      WHERE ea.event_id = event_tasks.event_id
      AND ea.user_id = auth.uid()
    )
  );

CREATE POLICY "workers_tasks_update" ON event_tasks
  FOR UPDATE USING (
    public.is_active_user()
    AND EXISTS (
      SELECT 1 FROM event_assignments ea
      WHERE ea.event_id = event_tasks.event_id
      AND ea.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Step 8: EVENT_ASSIGNMENTS — admin full, workers read own
-- ============================================================================
DROP POLICY IF EXISTS "admin_event_assignments_all" ON event_assignments;
DROP POLICY IF EXISTS "workers_event_assignments_select" ON event_assignments;
DROP POLICY IF EXISTS "authenticated_assignments_all" ON event_assignments;

CREATE POLICY "admin_assignments_all" ON event_assignments
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "workers_assignments_select" ON event_assignments
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- Step 9: Other tables — admin full, workers read
-- ============================================================================

-- Location files
DROP POLICY IF EXISTS "admin_location_files_all" ON location_files;
DROP POLICY IF EXISTS "workers_location_files_select" ON location_files;
DROP POLICY IF EXISTS "authenticated_location_files_all" ON location_files;

CREATE POLICY "admin_location_files_all" ON location_files
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "workers_location_files_select" ON location_files
  FOR SELECT USING (public.is_active_user());

-- Event files
DROP POLICY IF EXISTS "admin_event_files_all" ON event_files;
DROP POLICY IF EXISTS "workers_event_files_select" ON event_files;
DROP POLICY IF EXISTS "workers_event_files_insert" ON event_files;
DROP POLICY IF EXISTS "authenticated_event_files_all" ON event_files;

CREATE POLICY "admin_event_files_all" ON event_files
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "workers_event_files_select" ON event_files
  FOR SELECT USING (public.is_active_user());

-- Activity log
DROP POLICY IF EXISTS "admin_activity_log_select" ON activity_log;
DROP POLICY IF EXISTS "workers_activity_log_select" ON activity_log;
DROP POLICY IF EXISTS "authenticated_activity_log_all" ON activity_log;

CREATE POLICY "admin_activity_log_all" ON activity_log
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "workers_activity_log_select" ON activity_log
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- Step 10: DIAGNOSTIC — Verify data exists
-- ============================================================================

SELECT 'events' as taulukko, count(*) as rivit FROM events
UNION ALL SELECT 'persons', count(*) FROM persons
UNION ALL SELECT 'notes', count(*) FROM notes
UNION ALL SELECT 'event_tasks', count(*) FROM event_tasks
UNION ALL SELECT 'locations', count(*) FROM locations
UNION ALL SELECT 'users', count(*) FROM users;
