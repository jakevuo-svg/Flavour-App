-- ============================================================================
-- FIX RLS LINTER WARNINGS
-- Fixes two categories:
--   1. auth_rls_initplan: wrap auth.uid(), is_admin(), is_active_user()
--      in (select ...) so they evaluate once per query, not per row
--   2. multiple_permissive_policies: drop duplicate policies
-- Run in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- Step 1: Update helper functions to use (select auth.uid()) internally
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = (select auth.uid());
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (select auth.uid()) AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (select auth.uid()) AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- ============================================================================
-- Step 2: USERS — drop ALL policies, recreate clean
-- ============================================================================
DROP POLICY IF EXISTS "admin_users_all" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_view_own" ON users;
DROP POLICY IF EXISTS "admin_users_insert" ON users;
DROP POLICY IF EXISTS "authenticated_users_read" ON users;
DROP POLICY IF EXISTS "authenticated_users_insert_self" ON users;
DROP POLICY IF EXISTS "authenticated_users_update_self" ON users;
DROP POLICY IF EXISTS "authenticated_users_all" ON users;

CREATE POLICY "admin_users_all" ON users
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (id = (select auth.uid()));

-- ============================================================================
-- Step 3: EVENTS — drop ALL policies, recreate clean
-- ============================================================================
DROP POLICY IF EXISTS "admin_events_all" ON events;
DROP POLICY IF EXISTS "workers_events_select" ON events;
DROP POLICY IF EXISTS "authenticated_events_all" ON events;

CREATE POLICY "admin_events_all" ON events
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "workers_events_select" ON events
  FOR SELECT USING (
    (select public.is_active_user())
    AND EXISTS (
      SELECT 1 FROM event_assignments
      WHERE event_assignments.event_id = events.id
      AND event_assignments.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- Step 4: PERSONS — drop ALL policies, recreate clean
-- ============================================================================
DROP POLICY IF EXISTS "admin_persons_all" ON persons;
DROP POLICY IF EXISTS "workers_persons_select" ON persons;
DROP POLICY IF EXISTS "authenticated_persons_all" ON persons;

CREATE POLICY "admin_persons_all" ON persons
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "workers_persons_select" ON persons
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- Step 5: LOCATIONS — drop ALL policies, recreate clean
-- ============================================================================
DROP POLICY IF EXISTS "admin_locations_all" ON locations;
DROP POLICY IF EXISTS "workers_locations_select" ON locations;
DROP POLICY IF EXISTS "authenticated_locations_all" ON locations;

CREATE POLICY "admin_locations_all" ON locations
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "workers_locations_select" ON locations
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- Step 6: NOTES — drop ALL policies, recreate clean
-- ============================================================================
DROP POLICY IF EXISTS "admin_notes_all" ON notes;
DROP POLICY IF EXISTS "workers_notes_select" ON notes;
DROP POLICY IF EXISTS "workers_notes_insert" ON notes;
DROP POLICY IF EXISTS "authenticated_notes_all" ON notes;

CREATE POLICY "admin_notes_all" ON notes
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "workers_notes_select" ON notes
  FOR SELECT USING (
    (select public.is_active_user())
    AND (
      created_by = (select auth.uid())
      OR EXISTS (
        SELECT 1 FROM event_assignments
        WHERE event_assignments.event_id = notes.event_id
        AND event_assignments.user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "workers_notes_insert" ON notes
  FOR INSERT WITH CHECK ((select public.is_active_user()));

-- ============================================================================
-- Step 7: EVENT_TASKS — drop ALL policies, recreate clean
-- ============================================================================
DROP POLICY IF EXISTS "admin_tasks_all" ON event_tasks;
DROP POLICY IF EXISTS "admins_full_access_tasks" ON event_tasks;
DROP POLICY IF EXISTS "workers_tasks_select" ON event_tasks;
DROP POLICY IF EXISTS "workers_view_assigned_tasks" ON event_tasks;
DROP POLICY IF EXISTS "workers_tasks_update" ON event_tasks;
DROP POLICY IF EXISTS "workers_create_tasks" ON event_tasks;
DROP POLICY IF EXISTS "workers_update_tasks" ON event_tasks;
DROP POLICY IF EXISTS "authenticated_tasks_all" ON event_tasks;

CREATE POLICY "admin_tasks_all" ON event_tasks
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "workers_tasks_select" ON event_tasks
  FOR SELECT USING (
    (select public.is_active_user())
    AND EXISTS (
      SELECT 1 FROM event_assignments ea
      WHERE ea.event_id = event_tasks.event_id
      AND ea.user_id = (select auth.uid())
    )
  );

CREATE POLICY "workers_tasks_update" ON event_tasks
  FOR UPDATE USING (
    (select public.is_active_user())
    AND EXISTS (
      SELECT 1 FROM event_assignments ea
      WHERE ea.event_id = event_tasks.event_id
      AND ea.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- Step 8: EVENT_ASSIGNMENTS — drop ALL policies (incl. duplicates), recreate
-- ============================================================================
DROP POLICY IF EXISTS "admin_assignments_all" ON event_assignments;
DROP POLICY IF EXISTS "admin_event_assignments_all" ON event_assignments;
DROP POLICY IF EXISTS "Admins full access to event_assignments" ON event_assignments;
DROP POLICY IF EXISTS "workers_assignments_select" ON event_assignments;
DROP POLICY IF EXISTS "workers_event_assignments_select" ON event_assignments;
DROP POLICY IF EXISTS "Workers can view own assignments" ON event_assignments;
DROP POLICY IF EXISTS "authenticated_assignments_all" ON event_assignments;

CREATE POLICY "admin_assignments_all" ON event_assignments
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "workers_assignments_select" ON event_assignments
  FOR SELECT USING (user_id = (select auth.uid()));

-- ============================================================================
-- Step 9: LOCATION_FILES — drop ALL policies, recreate clean
-- ============================================================================
DROP POLICY IF EXISTS "admin_location_files_all" ON location_files;
DROP POLICY IF EXISTS "workers_location_files_select" ON location_files;
DROP POLICY IF EXISTS "authenticated_location_files_all" ON location_files;

CREATE POLICY "admin_location_files_all" ON location_files
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "workers_location_files_select" ON location_files
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- Step 10: EVENT_FILES — drop ALL policies, recreate clean
-- ============================================================================
DROP POLICY IF EXISTS "admin_event_files_all" ON event_files;
DROP POLICY IF EXISTS "workers_event_files_select" ON event_files;
DROP POLICY IF EXISTS "workers_event_files_insert" ON event_files;
DROP POLICY IF EXISTS "authenticated_event_files_all" ON event_files;

CREATE POLICY "admin_event_files_all" ON event_files
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "workers_event_files_select" ON event_files
  FOR SELECT USING ((select public.is_active_user()));

-- ============================================================================
-- Step 11: ACTIVITY_LOG — drop ALL policies, recreate clean
-- ============================================================================
DROP POLICY IF EXISTS "admin_activity_log_all" ON activity_log;
DROP POLICY IF EXISTS "admin_activity_log_select" ON activity_log;
DROP POLICY IF EXISTS "workers_activity_log_select" ON activity_log;
DROP POLICY IF EXISTS "authenticated_activity_log_all" ON activity_log;

CREATE POLICY "admin_activity_log_all" ON activity_log
  FOR ALL USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "workers_activity_log_select" ON activity_log
  FOR SELECT USING (user_id = (select auth.uid()));

-- ============================================================================
-- Done! All linter warnings should now be resolved.
-- Verify by running the Database Linter again in Supabase Dashboard.
-- ============================================================================
