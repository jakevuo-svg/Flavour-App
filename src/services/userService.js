import { supabase } from './supabaseClient';

export const getUsers = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
};

export const getUser = async (id) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
    throw error;
  }

  return data || null;
};

export const createUser = async (email, password, role, firstName, lastName, expiresAt = null) => {
  const authData = {
    email,
    password,
  };

  const userData = {
    email,
    first_name: firstName,
    last_name: lastName,
    role,
    is_active: true,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };

  try {
    const { data: authUser, error: authError } = await supabase.auth.signUp(authData);

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: authUser.user.id,
          ...userData,
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      throw profileError;
    }

    return userProfile;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  const updateData = {
    ...data,
    modified_at: new Date().toISOString(),
  };

  const { data: updatedUser, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return updatedUser;
};

export const deactivateUser = async (id) => {
  const { data: deactivatedUser, error } = await supabase
    .from('user_profiles')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }

  return deactivatedUser;
};

export const getWorkers = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .in('role', ['worker', 'temporary'])
    .eq('is_active', true)
    .order('first_name', { ascending: true });

  if (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }

  return data || [];
};
