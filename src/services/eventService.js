import { supabase, isDemoMode } from './supabaseClient';

let demoEvents = [];
let demoAssignments = [];
let demoEventNextId = 1;
let demoAssignmentNextId = 1;

export const getEvents = async () => {
  if (isDemoMode) {
    return demoEvents.map(event => ({
      ...event,
      location: {
        id: event.location_id,
        name: event.location_name,
      },
    }));
  }

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
  if (isDemoMode) {
    const event = demoEvents.find(e => e.id === id);
    if (!event) return null;
    return {
      ...event,
      location: {
        id: event.location_id,
        name: event.location_name,
      },
    };
  }

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
  if (isDemoMode) {
    const assignmentEventIds = demoAssignments
      .filter(a => a.user_id === userId)
      .map(a => a.event_id);

    return demoEvents
      .filter(e => assignmentEventIds.includes(e.id))
      .map(event => ({
        ...event,
        location: {
          id: event.location_id,
          name: event.location_name,
        },
      }));
  }

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

  if (isDemoMode) {
    const id = `event-${demoEventNextId++}`;
    const newEvent = { id, ...eventData };
    demoEvents.push(newEvent);
    return newEvent;
  }

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

  if (isDemoMode) {
    const event = demoEvents.find(e => e.id === id);
    if (event) {
      Object.assign(event, updateData);
      return event;
    }
    throw new Error('Event not found');
  }

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
  if (isDemoMode) {
    demoEvents = demoEvents.filter(e => e.id !== id);
    demoAssignments = demoAssignments.filter(a => a.event_id !== id);
    return true;
  }

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

  if (isDemoMode) {
    const id = `assignment-${demoAssignmentNextId++}`;
    const newAssignment = { id, ...assignmentData };
    demoAssignments.push(newAssignment);
    return newAssignment;
  }

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
  if (isDemoMode) {
    demoAssignments = demoAssignments.filter(
      a => !(a.event_id === eventId && a.user_id === userId)
    );
    return true;
  }

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
  if (isDemoMode) {
    return demoAssignments
      .filter(a => a.event_id === eventId)
      .map(assignment => {
        const user = null; // In demo mode, would need to join with user data
        return {
          ...assignment,
          user,
        };
      });
  }

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
