-- Create function to delete a user completely (both from public.users and auth.users)
-- This function requires admin privileges and includes safety checks
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_role text;
    caller_active boolean;
BEGIN
    -- Verify the caller is an admin
    SELECT role, is_active INTO caller_role, caller_active
    FROM public.users
    WHERE id = auth.uid();

    -- Check if caller exists and is an active admin
    IF caller_role IS NULL THEN
        RAISE EXCEPTION 'Only admins can delete users';
    END IF;

    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can delete users';
    END IF;

    IF caller_active != true THEN
        RAISE EXCEPTION 'Only admins can delete users';
    END IF;

    -- Prevent deleting yourself
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot delete your own user account';
    END IF;

    -- Delete from public.users
    DELETE FROM public.users
    WHERE id = target_user_id;

    -- Delete from auth.users
    DELETE FROM auth.users
    WHERE id = target_user_id;

    RETURN true;
END;
$$;

-- Grant EXECUTE permission to authenticated role
GRANT EXECUTE ON FUNCTION public.delete_user_completely(uuid) TO authenticated;
