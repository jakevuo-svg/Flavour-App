import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthContext';

// Demo tasks data
const DEMO_TASKS = [
  { id: 't1', event_id: 'event-1', title: 'Varaa kamerakalusto', description: 'Kolme kameraa + valaistus', assigned_to: null, status: 'DONE', priority: 'HIGH', due_date: '2022-05-14', created_by: 'Masa', created_at: '2022-05-01T10:00:00Z', completed_at: '2022-05-12T14:00:00Z' },
  { id: 't2', event_id: 'event-1', title: 'Tarkista studio-asettelu', description: '', assigned_to: null, status: 'DONE', priority: 'MEDIUM', due_date: '2022-05-14', created_by: 'Stina', created_at: '2022-05-02T09:00:00Z', completed_at: '2022-05-14T08:00:00Z' },
  { id: 't3', event_id: 'event-2', title: 'Tilaa viinipaketti', description: 'Valkoviini + punaviini + kuohuviini cocktaileihin', assigned_to: null, status: 'TODO', priority: 'HIGH', due_date: '2026-03-15', created_by: 'Masa', created_at: '2026-01-15T10:00:00Z', completed_at: null },
  { id: 't4', event_id: 'event-2', title: 'Joulukoristeet', description: 'Winter Wonderland -teema, lumi, hopea, sininen', assigned_to: null, status: 'IN_PROGRESS', priority: 'MEDIUM', due_date: '2026-03-18', created_by: 'Stina', created_at: '2026-01-20T11:00:00Z', completed_at: null },
  { id: 't5', event_id: 'event-3', title: 'DJ-sopimus', description: 'Vahvista DJ + bändi aikataulut', assigned_to: null, status: 'TODO', priority: 'HIGH', due_date: '2026-02-20', created_by: 'Masa', created_at: '2026-01-10T09:00:00Z', completed_at: null },
  { id: 't6', event_id: 'event-4', title: 'Tilaa esilinat', description: '30 kpl kokkiesiliinoja + nimilaput', assigned_to: null, status: 'TODO', priority: 'LOW', due_date: '2026-02-10', created_by: 'Stina', created_at: '2026-01-05T14:00:00Z', completed_at: null },
  { id: 't7', event_id: 'event-5', title: 'Varmista puhujat', description: '3 kansainvälistä puhujaa, lentoliput ja hotellit', assigned_to: null, status: 'IN_PROGRESS', priority: 'HIGH', due_date: '2026-02-28', created_by: 'Stina', created_at: '2026-01-22T10:00:00Z', completed_at: null },
  { id: 't8', event_id: 'event-5', title: 'Workshop-materiaalit', description: 'Tulosta materiaalit 80 osallistujalle', assigned_to: null, status: 'TODO', priority: 'MEDIUM', due_date: '2026-03-08', created_by: 'Masa', created_at: '2026-01-25T11:00:00Z', completed_at: null },
  { id: 't9', event_id: 'event-5', title: 'Livestream-testaus', description: 'Testaa livestream-yhteys ja laitteet', assigned_to: null, status: 'TODO', priority: 'MEDIUM', due_date: '2026-03-09', created_by: 'Stina', created_at: '2026-01-26T09:00:00Z', completed_at: null },
];

export function useTasks() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Demo mode: use local data
      setTasks(DEMO_TASKS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (taskData) => {
    try {
      const newTask = {
        id: 't' + Date.now(),
        ...taskData,
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'MEDIUM',
        created_by: profile?.first_name || 'User',
        created_at: new Date().toISOString(),
        completed_at: null,
      };
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates };
          // Auto-set completed_at when marking done
          if (updates.status === 'DONE' && !t.completed_at) {
            updated.completed_at = new Date().toISOString();
          }
          if (updates.status && updates.status !== 'DONE') {
            updated.completed_at = null;
          }
          return updated;
        }
        return t;
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      return true;
    } catch (err) {
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
        // Sort by priority first (HIGH > MEDIUM > LOW), then by due date
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
