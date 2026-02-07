import { useState, useEffect, useCallback } from 'react';
import * as personService from '../services/personService';
import { useAuth } from '../components/auth/AuthContext';

/**
 * Custom hook for managing persons data
 * Provides CRUD operations with automatic state management
 * @returns {Object} persons state, loading state, and action functions
 */
export function usePersons() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useAuth();

  const fetchPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await personService.getPersons();
      setPersons(data || []);
    } catch (err) {
      console.error('Failed to fetch persons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  const addPerson = useCallback(async (data) => {
    try {
      setError(null);
      const newPerson = await personService.createPerson({
        ...data,
        created_by: profile?.id,
      });
      if (newPerson) {
        setPersons(prev => [newPerson, ...prev]);
      }
      return newPerson;
    } catch (err) {
      console.error('Failed to add person:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const updatePerson = useCallback(async (id, data) => {
    try {
      setError(null);
      const updated = await personService.updatePerson(id, {
        ...data,
        modified_by: profile?.id,
      });
      if (updated) {
        setPersons(prev => prev.map(p => p.id === id ? updated : p));
      }
      return updated;
    } catch (err) {
      console.error('Failed to update person:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const deletePerson = useCallback(async (id) => {
    try {
      setError(null);
      await personService.deletePerson(id);
      setPersons(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete person:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    persons,
    loading,
    error,
    addPerson,
    updatePerson,
    deletePerson,
    refetch: fetchPersons,
  };
}
