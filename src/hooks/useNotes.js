import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

// Demo seed data for notes
let demoNotes = isDemoMode ? [
  {
    id: 'note-1',
    event_id: 'event-1',
    person_id: null,
    content: 'VIP-vieraat saapuvat klo 17:30. Vastaanottotiimi paikalla klo 17:00.',
    author: 'Demo Admin',
    created_by: 'demo-admin-1',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'note-2',
    event_id: 'event-1',
    person_id: null,
    content: 'Menun muutos: kala-annos vaihdettu vegaaniseen vaihtoehtoon allergioiden vuoksi.',
    author: 'Demo Admin',
    created_by: 'demo-admin-1',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'note-3',
    event_id: 'event-2',
    person_id: null,
    content: 'Sadevaraus tehty: sisätilat Puistolan juhlasalissa saatavilla tarvittaessa.',
    author: 'Demo Admin',
    created_by: 'demo-admin-1',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'note-4',
    event_id: null,
    person_id: 'person-1',
    content: 'Matti toivoi ensi vuoden gaalan teemaksi "Pohjoisen valot".',
    author: 'Demo Admin',
    created_by: 'demo-admin-1',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'note-5',
    event_id: 'event-3',
    person_id: null,
    content: 'Workshop-materiaalit tulostettu 45 kappaletta. Kahvitarjoilu klo 10:30 ja 14:00.',
    author: 'Demo Admin',
    created_by: 'demo-admin-1',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
] : [];

let demoNextId = 100;

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

      if (isDemoMode) {
        setNotes([...demoNotes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        return;
      }

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
      const noteData = {
        ...data,
        created_by: profile?.id,
        author: profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
        created_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const id = `note-${demoNextId++}`;
        const newNote = { id, ...noteData };
        demoNotes.push(newNote);
        setNotes(prev => [newNote, ...prev]);
        return newNote;
      }

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

  const deleteNote = useCallback(async (id) => {
    try {
      setError(null);

      if (isDemoMode) {
        demoNotes = demoNotes.filter(n => n.id !== id);
        setNotes(prev => prev.filter(n => n.id !== id));
        return;
      }

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

      if (isDemoMode) {
        return demoNotes.filter(n => n.event_id === eventId);
      }

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

      if (isDemoMode) {
        return demoNotes.filter(n => n.person_id === personId);
      }

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

  return {
    notes,
    loading,
    error,
    addNote,
    deleteNote,
    getNotesForEvent,
    getNotesForPerson,
    refetch: fetchNotes,
  };
}
