-- ============================================================================
-- Add shift/booking fields to event_assignments
-- Makes worker assignments work like restaurant reservations:
-- who, when (start-end), what role, and any notes
-- Run in Supabase SQL Editor
-- ============================================================================

-- Add time fields for shift start/end
ALTER TABLE event_assignments ADD COLUMN IF NOT EXISTS start_time VARCHAR(10);
ALTER TABLE event_assignments ADD COLUMN IF NOT EXISTS end_time VARCHAR(10);

-- Add notes for special instructions
ALTER TABLE event_assignments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update the get_event_workers function to return assignment details
CREATE OR REPLACE FUNCTION public.get_event_workers(p_event_id uuid)
RETURNS TABLE (
  id uuid,
  first_name varchar,
  last_name varchar,
  email varchar,
  role varchar,
  assignment_role varchar,
  start_time varchar,
  end_time varchar,
  assignment_notes text,
  assigned_at timestamptz
) AS $$
  SELECT
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.role,
    ea.role as assignment_role,
    ea.start_time,
    ea.end_time,
    ea.notes as assignment_notes,
    ea.assigned_at
  FROM public.users u
  INNER JOIN public.event_assignments ea ON ea.user_id = u.id
  WHERE ea.event_id = p_event_id
  AND u.is_active = true
  ORDER BY ea.start_time NULLS LAST, u.first_name, u.last_name;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_event_workers(uuid) TO authenticated;
