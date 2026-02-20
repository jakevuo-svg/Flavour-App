import { supabase } from './supabaseClient';

export const getNotes = async () => {
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
