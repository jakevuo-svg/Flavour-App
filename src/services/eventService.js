import { supabase } from './supabaseClient';

export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:location_id(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data || [];
};

export const getEvent = async (id) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:location_id(id, name)
    `)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching event:', error);
    throw error;
  }

  return data || null;
};

export const getEventsForWorker = async (userId) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:location_id(id, name),
      event_assignments!inner(user_id)
    `)
    .eq('event_assignments.user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching events for worker:', error);
    throw error;
  }

  return data || [];
};

export const createEvent = async (data) => {
  const eventData = {
    ...data,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
  };

  const { data: newEvent, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return newEvent;
};

export const updateEvent = async (id, data) => {
  const updateData = {
    ...data,
    modified_at: new Date().toISOString(),
  };

  const { data: updatedEvent, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return updatedEvent;
};

export const deleteEvent = async (id) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }

  return true;
};

export const assignWorker = async (eventId, userId, role, assignedBy) => {
  const assignmentData = {
    event_id: eventId,
    user_id: userId,
    role,
    assigned_by: assignedBy,
    assigned_at: new Date().toISOString(),
  };

  const { data: newAssignment, error } = await supabase
    .from('event_assignments')
    .insert([assignmentData])
    .select()
    .single();

  if (error) {
    console.error('Error assigning worker:', error);
    throw error;
  }

  return newAssignment;
};

export const removeWorkerAssignment = async (eventId, userId) => {
  const { error } = await supabase
    .from('event_assignments')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing worker assignment:', error);
    throw error;
  }

  return true;
};

export const getEventAssignments = async (eventId) => {
  const { data, error } = await supabase
    .from('event_assignments')
    .select(`
      *,
      user:user_id(id, email, first_name, last_name)
    `)
    .eq('event_id', eventId);

  if (error) {
    console.error('Error fetching event assignments:', error);
    throw error;
  }

  return data || [];
};
