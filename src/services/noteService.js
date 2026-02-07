import { supabase, isDemoMode } from './supabaseClient';

let demoNotes = [];
let demoNoteNextId = 1;

export const getNotes = async () => {
  if (isDemoMode) {
    return demoNotes
      .map(note => ({
        ...note,
        creator: {
          id: note.created_by,
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
        },
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      creator:created_by(id, email, first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return data || [];
};

export const getNotesForEvent = async (eventId) => {
  if (isDemoMode) {
    return demoNotes
      .filter(n => n.event_id === eventId)
      .map(note => ({
        ...note,
        creator: {
          id: note.created_by,
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
        },
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      creator:created_by(id, email, first_name, last_name)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes for event:', error);
    throw error;
  }

  return data || [];
};

export const getNotesForPerson = async (personId) => {
  if (isDemoMode) {
    return demoNotes
      .filter(n => n.person_id === personId)
      .map(note => ({
        ...note,
        creator: {
          id: note.created_by,
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
        },
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      creator:created_by(id, email, first_name, last_name)
    `)
    .eq('person_id', personId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes for person:', error);
    throw error;
  }

  return data || [];
};

export const createNote = async (data, userId) => {
  const noteData = {
    ...data,
    created_by: userId,
    created_at: new Date().toISOString(),
  };

  if (isDemoMode) {
    const id = `note-${demoNoteNextId++}`;
    const newNote = { id, ...noteData };
    demoNotes.push(newNote);
    return newNote;
  }

  const { data: newNote, error } = await supabase
    .from('notes')
    .insert([noteData])
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }

  return newNote;
};

export const deleteNote = async (id) => {
  if (isDemoMode) {
    demoNotes = demoNotes.filter(n => n.id !== id);
    return true;
  }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }

  return true;
};
