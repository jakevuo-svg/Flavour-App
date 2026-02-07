import { supabase, isDemoMode } from './supabaseClient';

let demoActivityLog = [];
let demoActivityNextId = 1;

export const logActivity = async (action, entityType, entityId, details = null) => {
  const logData = {
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    created_at: new Date().toISOString(),
  };

  if (isDemoMode) {
    const id = `activity-${demoActivityNextId++}`;
    const newLog = { id, ...logData, user_id: 'demo-user' };
    demoActivityLog.push(newLog);
    return newLog;
  }

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
  if (isDemoMode) {
    return demoActivityLog
      .map(log => ({
        ...log,
        user: {
          id: log.user_id,
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
        },
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

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
  if (isDemoMode) {
    return demoActivityLog
      .filter(log => log.entity_type === entityType && log.entity_id === entityId)
      .map(log => ({
        ...log,
        user: {
          id: log.user_id,
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
        },
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

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
