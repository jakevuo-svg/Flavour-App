-- Fix RLS policies for location_files table
-- Run this in Supabase SQL Editor

-- Enable RLS (should already be on)
ALTER TABLE location_files ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start clean
DROP POLICY IF EXISTS "location_files_select" ON location_files;
DROP POLICY IF EXISTS "location_files_insert" ON location_files;
DROP POLICY IF EXISTS "location_files_delete" ON location_files;
DROP POLICY IF EXISTS "location_files_update" ON location_files;
DROP POLICY IF EXISTS "Allow authenticated select" ON location_files;
DROP POLICY IF EXISTS "Allow authenticated insert" ON location_files;
DROP POLICY IF EXISTS "Allow authenticated delete" ON location_files;

-- SELECT: all active authenticated users can view files
CREATE POLICY "location_files_select" ON location_files
  FOR SELECT TO authenticated
  USING ((select public.is_active_user()));

-- INSERT: all active authenticated users can add files
CREATE POLICY "location_files_insert" ON location_files
  FOR INSERT TO authenticated
  WITH CHECK ((select public.is_active_user()));

-- DELETE: only admins can delete files
CREATE POLICY "location_files_delete" ON location_files
  FOR DELETE TO authenticated
  USING ((select public.is_admin()));

-- UPDATE: only admins can update file records
CREATE POLICY "location_files_update" ON location_files
  FOR UPDATE TO authenticated
  USING ((select public.is_admin()));
