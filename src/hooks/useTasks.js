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
      // Map Finnish priority labels to DB values
      const priorityMap = { 'KORKEA': 'HIGH', 'NORMAALI': 'MEDIUM', 'MATALA': 'LOW' };
      const rawPriority = taskData.priority || 'MEDIUM';
      const dbPriority = priorityMap[rawPriority] || rawPriority;

      // Only include fields that exist in event_tasks table
      const insertData = {
        title: taskData.title,
        event_id: taskData.event_id || null,
        status: taskData.status || 'TODO',
        priority: dbPriority,
        due_date: taskData.due_date || null,
        assigned_to: taskData.assigned_to || null,
        created_by: profile?.id,
      };

      console.log('[useTasks] Inserting task:', JSON.stringify(insertData));

      const { data: newTask, error: err } = await supabase
        .from('event_tasks')
        .insert([insertData])
        .select()
        .single();

      if (err) {
        console.error('[useTasks] Supabase insert error:', err.message, err.details, err.hint);
        throw err;
      }
      console.log('[useTasks] Task created successfully:', newTask?.id);
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

      const { error: err } = await supabase
        .from('event_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (err) throw err;

      // Set updated_at locally for dashboard activity tracking
      let result = null;
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          result = { ...t, ...updateData, updated_at: now };
          return result;
        }
        return t;
      }));
      console.log('[useTasks] Task updated:', taskId, 'updated_at:', now);
      return result;
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
