-- STEP 1: Check what policies exist (run this first to see output)
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'location_files';

-- STEP 2: Drop ALL policies on location_files (run after checking step 1)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname FROM pg_policies WHERE tablename = 'location_files'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON location_files', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- STEP 3: Create simple, working policies
-- Using simple (true) check first to rule out function issues
CREATE POLICY "files_select" ON location_files
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "files_insert" ON location_files
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "files_delete" ON location_files
  FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "files_update" ON location_files
  FOR UPDATE TO authenticated
  USING (true);
