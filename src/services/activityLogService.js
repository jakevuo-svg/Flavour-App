import { supabase } from './supabaseClient';

export const logActivity = async (action, entityType, entityId, details = null) => {
  const logData = {
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    created_at: new Date().toISOString(),
  };

  const { data: newLog, error } = await supabase
    .from('activity_log')
    .insert([logData])
    .select()
    .single();

  if (error) {
    console.error('Error logging activity:', error);
    throw error;
  }

  return newLog;
};

export const getRecentActivity = async (limit = 50) => {
  const { data, error } = await supabase
    .from('activity_log')
    .select(`
      *,
      user:user_id(id, email, first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }

  return data || [];
};

export const getActivityForEntity = async (entityType, entityId) => {
  const { data, error } = await supabase
    .from('activity_log')
    .select(`
      *,
      user:user_id(id, email, first_name, last_name)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching activity for entity:', error);
    throw error;
  }

  return data || [];
};
