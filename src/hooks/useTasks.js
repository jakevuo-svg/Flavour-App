import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

// Demo tasks data (only used when isDemoMode is true)
const DEMO_TASKS = [
  { id: 't1', event_id: 'event-1', title: 'Varaa kamerakalusto', description: 'Kolme kameraa + valaistus', assigned_to: null, status: 'DONE', priority: 'HIGH', due_date: '2022-05-14', created_by: 'Masa', created_at: '2022-05-01T10:00:00Z', completed_at: '2022-05-12T14:00:00Z' },
  { id: 't2', event_id: 'event-1', title: 'Tarkista studio-asettelu', description: '', assigned_to: null, status: 'DONE', priority: 'MEDIUM', due_date: '2022-05-14', created_by: 'Stina', created_at: '2022-05-02T09:00:00Z', completed_at: '2022-05-14T08:00:00Z' },
];

export function useTasks() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        setTasks(DEMO_TASKS);
        return;
      }

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
      if (isDemoMode) {
        const newTask = { id: 't' + Date.now(), ...taskData, status: taskData.status || 'TODO', priority: taskData.priority || 'MEDIUM', created_by: profile?.first_name || 'User', created_at: new Date().toISOString(), completed_at: null };
        setTasks(prev => [newTask, ...prev]);
        return newTask;
      }

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
      if (isDemoMode) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
        return true;
      }

      const updateData = { ...updates };
      if (updates.status === 'DONE') {
        updateData.completed_at = new Date().toISOString();
      }
      if (updates.status && updates.status !== 'DONE') {
        updateData.completed_at = null;
      }

      const { error: err } = await supabase
        .from('event_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (err) throw err;

      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const updated = { ...t, ...updateData };
          return updated;
        }
        return t;
      }));
      return true;
    } catch (err) {
      console.error('[useTasks] Failed to update task:', err);
      setError(err.message);
      return false;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      if (isDemoMode) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        return true;
      }

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
