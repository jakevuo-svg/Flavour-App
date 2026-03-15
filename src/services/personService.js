import { supabase } from './supabaseClient';

export const getPersons = async () => {
  // Fetch system users to filter them out — persons should only show clients
  const { data: systemUsers } = await supabase.from('users').select('email, first_name, last_name');
  const systemEmails = new Set((systemUsers || []).map(u => u.email?.toLowerCase()).filter(Boolean));
  const systemNames = new Set((systemUsers || []).map(u => {
    const name = `${(u.first_name || '').toLowerCase().trim()} ${(u.last_name || '').toLowerCase().trim()}`.trim();
    return name || null;
  }).filter(Boolean));

  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching persons:', error);
    throw error;
  }

  // Filter out system users (admins/workers) — match by email OR full name
  const clients = (data || []).filter(p => {
    if (p.email && systemEmails.has(p.email.toLowerCase())) return false;
    const personName = `${(p.first_name || '').toLowerCase().trim()} ${(p.last_name || '').toLowerCase().trim()}`.trim();
    if (personName && systemNames.has(personName)) return false;
    return true;
  });
  return clients;
};

export const getPerson = async (id) => {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching person:', error);
    throw error;
  }

  return data || null;
};

export const createPerson = async (data) => {
  const personData = {
    ...data,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
  };

  const { data: newPerson, error } = await supabase
    .from('persons')
    .insert([personData])
    .select()
    .single();

  if (error) {
    console.error('Error creating person:', error);
    throw error;
  }

  return newPerson;
};

// Only these columns exist in the persons table
const PERSON_COLUMNS = ['first_name', 'last_name', 'company', 'role', 'email', 'phone', 'website', 'type', 'next_action', 'notes', 'feedback', 'modified_at', 'modified_by'];

export const updatePerson = async (id, data) => {
  // Only include fields that actually exist as columns in the DB
  const updateData = { modified_at: new Date().toISOString() };
  for (const key of PERSON_COLUMNS) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }

  let { data: updatedPerson, error } = await supabase
    .from('persons')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  // If column doesn't exist, retry without optional columns
  if (error && error.message?.includes('column')) {
    const safeData = { ...updateData };
    delete safeData.feedback;
    delete safeData.next_action;
    delete safeData.modified_by;
    const retry = await supabase
      .from('persons')
      .update(safeData)
      .eq('id', id)
      .select()
      .single();
    updatedPerson = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Error updating person:', error);
    throw error;
  }

  return updatedPerson;
};

export const deletePerson = async (id) => {
  const { error } = await supabase
    .from('persons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting person:', error);
    throw error;
  }

  return true;
};
