import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

/**
 * Custom hook for managing notes data
 */
export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useAuth();

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setNotes(data || []);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(async (data) => {
    try {
      setError(null);
      // Only include known columns to avoid Supabase errors from extra fields
      const noteData = {
        content: data.content || '',
        event_id: data.event_id || null,
        person_id: data.person_id || null,
        title: data.title || null,
        created_by: profile?.id,
        author: profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
        created_at: new Date().toISOString(),
      };

      const { data: newNote, error: err } = await supabase
        .from('notes')
        .insert([noteData])
        .select()
        .single();

      if (err) throw err;
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error('Failed to add note:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const updateNote = useCallback(async (id, data) => {
    try {
      setError(null);
      const { data: updated, error: err } = await supabase
        .from('notes')
        .update({ ...data, modified_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      return updated;
    } catch (err) {
      console.error('Failed to update note:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteNote = useCallback(async (id) => {
    try {
      setError(null);

      const { error: err } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getNotesForEvent = useCallback(async (eventId) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('notes')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch notes for event:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getNotesForPerson = useCallback(async (personId) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('notes')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch notes for person:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Remove notes for a deleted event from local state (DB CASCADE handles the actual deletion)
  const removeNotesForEvent = useCallback((eventId) => {
    setNotes(prev => prev.filter(n => n.event_id !== eventId));
  }, []);

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    removeNotesForEvent,
    getNotesForEvent,
    getNotesForPerson,
    refetch: fetchNotes,
  };
}
