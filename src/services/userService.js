import { supabase, isDemoMode } from './supabaseClient';

let demoUsers = [
  {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    first_name: 'Demo',
    last_name: 'Admin',
    role: 'admin',
    is_active: true,
    expires_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-worker-1',
    email: 'worker@demo.com',
    first_name: 'Demo',
    last_name: 'Worker',
    role: 'worker',
    is_active: true,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
];
let demoNextId = 100;

export const getUsers = async () => {
  if (isDemoMode) {
    return demoUsers;
  }

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
  if (isDemoMode) {
    return demoUsers.find(u => u.id === id) || null;
  }

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

  if (isDemoMode) {
    const id = `demo-user-${demoNextId++}`;
    const newUser = { id, ...userData };
    demoUsers.push(newUser);
    return newUser;
  }

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

  if (isDemoMode) {
    const user = demoUsers.find(u => u.id === id);
    if (user) {
      Object.assign(user, updateData);
      return user;
    }
    throw new Error('User not found');
  }

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
  if (isDemoMode) {
    const user = demoUsers.find(u => u.id === id);
    if (user) {
      user.is_active = false;
      return user;
    }
    throw new Error('User not found');
  }

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
  if (isDemoMode) {
    return demoUsers.filter(
      u => (u.role === 'worker' || u.role === 'temporary') && u.is_active
    );
  }

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
