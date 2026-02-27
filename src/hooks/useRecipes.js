import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useAuth();

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (err) throw err;
      setRecipes(data || []);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const addRecipe = useCallback(async (data) => {
    try {
      setError(null);
      const { data: created, error: err } = await supabase
        .from('recipes')
        .insert({ ...data, created_by: profile?.id })
        .select()
        .single();
      if (err) throw err;
      setRecipes(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Failed to add recipe:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const updateRecipe = useCallback(async (id, data) => {
    try {
      setError(null);
      const updateData = { ...data, modified_at: new Date().toISOString() };
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.created_by;
      const { data: updated, error: err } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      setRecipes(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      console.error('Failed to update recipe:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteRecipe = useCallback(async (id) => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from('recipes')
        .update({ is_active: false, modified_at: new Date().toISOString() })
        .eq('id', id);
      if (err) throw err;
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return { recipes, loading, error, addRecipe, updateRecipe, deleteRecipe, refetch: fetchRecipes };
}
