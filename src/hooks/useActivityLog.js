import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

/**
 * Custom hook for managing activity logs
 * Tracks all user actions and provides activity retrieval
 * @returns {Object} activities state, loading state, and action functions
 */
export function useActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useAuth();

  const fetchActivities = useCallback(async (limit = 100) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (err) throw err;
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const logActivity = useCallback(async (activityData) => {
    try {
      setError(null);

      const log = {
        ...activityData,
        user_id: profile?.id,
        created_at: new Date().toISOString(),
      };

      const { data, error: err } = await supabase
        .from('activity_log')
        .insert([log])
        .select()
        .single();

      if (err) throw err;
      setActivities(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to log activity:', err);
      setError(err.message);
      // Don't throw - activity logging should never break the app
    }
  }, [profile?.id]);

  const getRecentActivity = useCallback(async (options = {}) => {
    try {
      const {
        limit = 50,
        userId = null,
        actionType = null,
        entityType = null,
      } = options;

      setError(null);

      let query = supabase.from('activity_log').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (actionType) {
        query = query.eq('action_type', actionType);
      }
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      const { data, error: err } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getActivityByEntity = useCallback(async (entityType, entityId, limit = 50) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('activity_log')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch activity by entity:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getActivityByUser = useCallback(async (userId, limit = 50) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch activity by user:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Helper function to create standard activity log entries
   * Usage examples:
   * - logPersonActivity('person', personId, 'CREATE', 'Created person record')
   * - logPersonActivity('event', eventId, 'UPDATE', 'Updated event details')
   */
  const logEntityActivity = useCallback(async (
    entityType,
    entityId,
    actionType,
    description = ''
  ) => {
    return logActivity({
      entity_type: entityType,
      entity_id: entityId,
      action_type: actionType,
      description,
    });
  }, [logActivity]);

  return {
    activities,
    loading,
    error,
    logActivity,
    logEntityActivity,
    getRecentActivity,
    getActivityByEntity,
    getActivityByUser,
    refetch: fetchActivities,
  };
}
