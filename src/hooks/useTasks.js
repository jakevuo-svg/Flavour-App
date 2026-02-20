import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

export function useTasks() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[useTasks] Fetching tasks from Supabase...');
      const { data, error: err } = await supabase
        .from('event_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        console.error('[useTasks] Supabase error:', err);
        throw err;
      }
      console.log('[useTasks] Got tasks:', data?.length || 0);
      setTasks(data || []);
    } catch (err) {
      console.error('[useTasks] Failed to fetch tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (taskData) => {
    try {
      const insertData = {
        ...taskData,
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'MEDIUM',
        created_by: profile?.id,
        created_at: new Date().toISOString(),
      };

      const { data: newTask, error: err } = await supabase
        .from('event_tasks')
        .insert([insertData])
        .select()
        .single();

      if (err) throw err;
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      console.error('[useTasks] Failed to add task:', err);
      setError(err.message);
      return null;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const now = new Date().toISOString();
      const updateData = { ...updates };
      if (updates.status === 'DONE') {
        updateData.completed_at = now;
      }
      if (updates.status && updates.status !== 'DONE') {
        updateData.completed_at = null;
      }

      const { data: updatedRow, error: err } = await supabase
        .from('event_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (err) throw err;

      // Always set updated_at in local state for dashboard tracking
      const merged = { ...(updatedRow || updates), updated_at: now };
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, ...merged };
        }
        return t;
      }));
      return merged;
    } catch (err) {
      console.error('[useTasks] Failed to update task:', err);
      setError(err.message);
      return false;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error: err } = await supabase
        .from('event_tasks')
        .delete()
        .eq('id', taskId);

      if (err) throw err;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      return true;
    } catch (err) {
      console.error('[useTasks] Failed to delete task:', err);
      setError(err.message);
      return false;
    }
  };

  const getTasksForEvent = (eventId) => {
    return tasks.filter(t => t.event_id === eventId);
  };

  const getOpenTasks = () => {
    return tasks.filter(t => t.status !== 'DONE')
      .sort((a, b) => {
        const prio = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const prioDiff = (prio[a.priority] || 1) - (prio[b.priority] || 1);
        if (prioDiff !== 0) return prioDiff;
        if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
        return 0;
      });
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(t => t.status !== 'DONE' && t.due_date && new Date(t.due_date) < now);
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    getTasksForEvent,
    getOpenTasks,
    getOverdueTasks,
    refetch: fetchTasks,
  };
}
