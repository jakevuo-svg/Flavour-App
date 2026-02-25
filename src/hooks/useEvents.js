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

      const { data, error: err } = await query.order('modified_at', { ascending: false });

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

      // Combine allergens array (with counts) + ervNotes into single 'erv' text field
      const allergenText = (data.allergens || []).map(a => {
        if (typeof a === 'string') return a; // backward compat
        return a.count > 0 ? `${a.name} x${a.count}` : a.name;
      }).join(', ');
      const ervNotesText = data.ervNotes || '';
      const erv = [allergenText, ervNotesText].filter(Boolean).join(' — ');

      // Only include fields that exist in the events table
      const eventData = {
        name: data.name || '',
        type: data.type || '',
        date: data.date || new Date().toISOString().split('T')[0],
        end_date: data.end_date || data.date || null,
        start_time: data.start_time || '',
        end_time: data.end_time || '',
        location_name: data.location_name || '',
        location_id: data.location_id || null,
        guest_count: data.guest_count || null,
        language: data.language || '',
        company: data.company || '',
        booker: data.booker || '',
        contact: data.contact || '',
        status: data.status || '',
        goal: data.goal || '',
        attentionNotes: data.attentionNotes || '',
        erv: erv || '',
        schedule: data.schedule || '',
        menu: data.menu || '',
        menuLink: data.menuLink || '',
        menuAttachments: data.menuAttachments || [],
        decorations: data.decorations || '',
        logistics: data.logistics || '',
        orderLink: data.orderLink || '',
        orderNotes: data.orderNotes || '',
        orderAttachments: data.orderAttachments || [],
        materials: data.materials || [],
        notes: data.notes || '',
        duringEvent: data.duringEvent || '',
        feedback: data.feedback || '',
        drinkService: data.drinkService || [],
        drinkNotes: data.drinkNotes || '',
        drinkTicketSource: data.drinkTicketSource || '',
        food: data.food || '',
        foodPrice: data.foodPrice || null,
        drinks: data.drinks || '',
        drinksPrice: data.drinksPrice || null,
        tech: data.tech || '',
        techPrice: data.techPrice || null,
        program: data.program || '',
        programPrice: data.programPrice || null,
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
      // Strip client-only fields before sending to DB
      const { last_change, ...dbFields } = data;
      const updateData = {
        ...dbFields,
        modified_at: new Date().toISOString(),
      };

      const { data: updated, error: err } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      // Merge last_change into local state only (not in DB)
      const withMeta = { ...updated, last_change: last_change || '' };
      setEvents(prev => prev.map(e => e.id === id ? withMeta : e));
      return withMeta;
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

  const assignWorker = useCallback(async (eventId, workerId, assignmentData = {}) => {
    try {
      setError(null);

      // Build full insert with shift fields
      const fullData = {
        event_id: eventId,
        user_id: workerId,
        ...(assignmentData.start_time ? { start_time: assignmentData.start_time } : {}),
        ...(assignmentData.end_time ? { end_time: assignmentData.end_time } : {}),
        ...(assignmentData.role ? { role: assignmentData.role } : {}),
        ...(assignmentData.notes ? { notes: assignmentData.notes } : {}),
      };

      const { data, error: err } = await supabase
        .from('event_assignments')
        .insert([fullData])
        .select()
        .single();

      if (err) {
        // If column not found (migration not run yet), fallback to base fields only
        if (err.message?.includes('schema cache') || err.message?.includes('column')) {
          console.warn('Shift columns not found, falling back to basic assignment');
          const baseData = {
            event_id: eventId,
            user_id: workerId,
            ...(assignmentData.role ? { role: assignmentData.role } : {}),
          };
          const { data: fallbackData, error: fallbackErr } = await supabase
            .from('event_assignments')
            .insert([baseData])
            .select()
            .single();
          if (fallbackErr) throw fallbackErr;
          return fallbackData;
        }
        throw err;
      }
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

  const archiveEvent = useCallback(async (id, archive = true) => {
    try {
      setError(null);
      const { data: updated, error: err } = await supabase
        .from('events')
        .update({ is_archived: archive, modified_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      console.error('Failed to archive event:', err);
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
    archiveEvent,
    assignWorker,
    removeWorkerAssignment,
    getEventAssignments,
    refetch: fetchEvents,
  };
}
