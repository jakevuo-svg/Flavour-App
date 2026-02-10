-- Auto-confirm a user's email so they can log in immediately
-- without needing to click the confirmation link
-- Only admins can call this
CREATE OR REPLACE FUNCTION public.auto_confirm_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_role text;
    caller_active boolean;
BEGIN
    -- Verify the caller is an active admin
    SELECT role, is_active INTO caller_role, caller_active
    FROM public.users
    WHERE id = auth.uid();

    IF caller_role IS NULL OR caller_role != 'admin' OR caller_active != true THEN
        RAISE EXCEPTION 'Only admins can confirm users';
    END IF;

    -- Set email_confirmed_at in auth.users so user can log in immediately
    UPDATE auth.users
    SET email_confirmed_at = now(),
        updated_at = now()
    WHERE id = target_user_id;

    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_confirm_user(uuid) TO authenticated;
