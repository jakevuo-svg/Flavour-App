import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

export function useMenus() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useAuth();

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('menus')
        .select('*, menu_recipes(id, recipe_id, course_order, course_label, notes, recipes(id, name, category, description, allergens, tags))')
        .eq('is_active', true)
        .order('name');
      if (err) throw err;
      setMenus(data || []);
    } catch (err) {
      console.error('Failed to fetch menus:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  const addMenu = useCallback(async (data) => {
    try {
      setError(null);
      const { data: created, error: err } = await supabase
        .from('menus')
        .insert({ ...data, created_by: profile?.id })
        .select()
        .single();
      if (err) throw err;
      created.menu_recipes = [];
      setMenus(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Failed to add menu:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const updateMenu = useCallback(async (id, data) => {
    try {
      setError(null);
      const updateData = { ...data, modified_at: new Date().toISOString() };
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.created_by;
      delete updateData.menu_recipes;
      const { data: updated, error: err } = await supabase
        .from('menus')
        .update(updateData)
        .eq('id', id)
        .select('*, menu_recipes(id, recipe_id, course_order, course_label, notes, recipes(id, name, category, description, allergens, tags))')
        .single();
      if (err) throw err;
      setMenus(prev => prev.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      console.error('Failed to update menu:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteMenu = useCallback(async (id) => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from('menus')
        .update({ is_active: false, modified_at: new Date().toISOString() })
        .eq('id', id);
      if (err) throw err;
      setMenus(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete menu:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Add recipe to menu
  const addRecipeToMenu = useCallback(async (menuId, recipeId, courseOrder = 0, courseLabel = '', notes = '') => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from('menu_recipes')
        .insert({ menu_id: menuId, recipe_id: recipeId, course_order: courseOrder, course_label: courseLabel, notes });
      if (err) throw err;
      await fetchMenus(); // refresh to get updated nested data
    } catch (err) {
      console.error('Failed to add recipe to menu:', err);
      setError(err.message);
      throw err;
    }
  }, [fetchMenus]);

  // Remove recipe from menu
  const removeRecipeFromMenu = useCallback(async (menuId, recipeId) => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from('menu_recipes')
        .delete()
        .eq('menu_id', menuId)
        .eq('recipe_id', recipeId);
      if (err) throw err;
      await fetchMenus();
    } catch (err) {
      console.error('Failed to remove recipe from menu:', err);
      setError(err.message);
      throw err;
    }
  }, [fetchMenus]);

  return {
    menus, loading, error,
    addMenu, updateMenu, deleteMenu,
    addRecipeToMenu, removeRecipeFromMenu,
    refetch: fetchMenus,
  };
}
