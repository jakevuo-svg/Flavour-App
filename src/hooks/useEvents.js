import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

/**
 * Custom hook for managing events data
 */
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile, isWorker, isAdmin } = useAuth();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('events').select('*');

      if (isWorker) {
        const { data: assignments, error: assignmentError } = await supabase
          .from('event_assignments')
          .select('event_id')
          .eq('user_id', profile?.id);

        if (assignmentError) throw assignmentError;

        const eventIds = assignments?.map(a => a.event_id) || [];
        if (eventIds.length === 0) {
          setEvents([]);
          return;
        }

        query = query.in('id', eventIds);
      }

      const { data, error: err } = await query.order('created_at', { ascending: false });

      if (err) {
        console.error('[useEvents] Supabase query error:', err);
        throw err;
      }
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, isWorker, isAdmin]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = useCallback(async (data) => {
    try {
      setError(null);
      const eventData = {
        ...data,
        created_by: profile?.id,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      };

      const { data: newEvent, error: err } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (err) throw err;
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      console.error('Failed to add event:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const updateEvent = useCallback(async (id, data) => {
    try {
      setError(null);
      const updateData = {
        ...data,
        modified_by: profile?.id,
        modified_at: new Date().toISOString(),
      };

      const { data: updated, error: err } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      console.error('Failed to update event:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const deleteEvent = useCallback(async (id) => {
    try {
      setError(null);

      const { error: err } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const assignWorker = useCallback(async (eventId, workerId) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('event_assignments')
        .insert([{ event_id: eventId, user_id: workerId }])
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err) {
      console.error('Failed to assign worker:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const removeWorkerAssignment = useCallback(async (eventId, workerId) => {
    try {
      setError(null);

      const { error: err } = await supabase
        .from('event_assignments')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', workerId);

      if (err) throw err;
    } catch (err) {
      console.error('Failed to remove worker assignment:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getEventAssignments = useCallback(async (eventId) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('event_assignments')
        .select('*')
        .eq('event_id', eventId);

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch event assignments:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    assignWorker,
    removeWorkerAssignment,
    getEventAssignments,
    refetch: fetchEvents,
  };
}
