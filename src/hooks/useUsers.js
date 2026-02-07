import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

// Demo data for users
let demoUsers = [
  {
    id: 'demo-admin-1',
    email: 'admin@typedwn.fi',
    first_name: 'Demo',
    last_name: 'Admin',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];
let demoNextId = 2;

/**
 * Custom hook for managing users (admin-only)
 * Provides user CRUD operations and worker list retrieval
 * Requires admin role
 * @returns {Object} users state, loading state, and action functions
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile, isAdmin } = useAuth();

  const checkAdminAccess = useCallback(() => {
    if (!isAdmin) {
      const err = new Error('Admin access required');
      setError(err.message);
      throw err;
    }
  }, [isAdmin]);

  const fetchUsers = useCallback(async () => {
    try {
      checkAdminAccess();
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        setUsers(demoUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        return;
      }

      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess]);

  // Initial fetch
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const createUser = useCallback(async (data) => {
    try {
      checkAdminAccess();
      setError(null);

      const userData = {
        ...data,
        created_by: profile?.id,
        created_at: new Date().toISOString(),
        is_active: true,
      };

      if (isDemoMode) {
        const id = `user-${demoNextId++}`;
        const newUser = { id, ...userData };
        demoUsers.push(newUser);
        setUsers(prev => [newUser, ...prev]);
        return newUser;
      }

      const { data: newUser, error: err } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (err) throw err;
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id, checkAdminAccess]);

  const updateUser = useCallback(async (id, data) => {
    try {
      checkAdminAccess();
      setError(null);

      const updateData = {
        ...data,
        modified_by: profile?.id,
        modified_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const user = demoUsers.find(u => u.id === id);
        if (user) {
          Object.assign(user, updateData);
          setUsers(prev => prev.map(u => u.id === id ? user : u));
          return user;
        }
        throw new Error('User not found');
      }

      const { data: updated, error: err } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      console.error('Failed to update user:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id, checkAdminAccess]);

  const deactivateUser = useCallback(async (id) => {
    try {
      checkAdminAccess();
      setError(null);

      if (isDemoMode) {
        const user = demoUsers.find(u => u.id === id);
        if (user) {
          user.is_active = false;
          user.deactivated_at = new Date().toISOString();
          setUsers(prev => prev.map(u => u.id === id ? user : u));
          return user;
        }
        throw new Error('User not found');
      }

      const { data: updated, error: err } = await supabase
        .from('users')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
          modified_by: profile?.id,
          modified_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      console.error('Failed to deactivate user:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id, checkAdminAccess]);

  const activateUser = useCallback(async (id) => {
    try {
      checkAdminAccess();
      setError(null);

      if (isDemoMode) {
        const user = demoUsers.find(u => u.id === id);
        if (user) {
          user.is_active = true;
          user.deactivated_at = null;
          setUsers(prev => prev.map(u => u.id === id ? user : u));
          return user;
        }
        throw new Error('User not found');
      }

      const { data: updated, error: err } = await supabase
        .from('users')
        .update({
          is_active: true,
          deactivated_at: null,
          modified_by: profile?.id,
          modified_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      console.error('Failed to activate user:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id, checkAdminAccess]);

  const getWorkers = useCallback(async () => {
    try {
      setError(null);

      if (isDemoMode) {
        return demoUsers.filter(u => u.role === 'worker' && u.is_active);
      }

      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'worker')
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch workers:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    getWorkers,
    refetch: fetchUsers,
  };
}
