-- ============================================================================
-- Function: get_event_workers(event_id)
-- Returns worker details for a specific event from event_assignments + users
-- SECURITY DEFINER so all authenticated users can see assigned worker names
-- Run in Supabase SQL Editor
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_event_workers(p_event_id uuid)
RETURNS TABLE (
  id uuid,
  first_name varchar,
  last_name varchar,
  email varchar,
  role varchar
) AS $$
  SELECT u.id, u.first_name, u.last_name, u.email, u.role
  FROM public.users u
  INNER JOIN public.event_assignments ea ON ea.user_id = u.id
  WHERE ea.event_id = p_event_id
  AND u.is_active = true
  ORDER BY u.first_name, u.last_name;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_event_workers(uuid) TO authenticated;
