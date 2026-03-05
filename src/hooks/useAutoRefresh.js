import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * useAutoRefresh — Automaattinen datan päivitys
 *
 * 3 mekanismia:
 * 1. Visibility change: kun käyttäjä palaa välilehdelle, kaikki data päivittyy
 * 2. Polling: hiljainen taustapolling N minuutin välein
 * 3. Supabase Realtime: välitön päivitys kun tietokannassa tapahtuu muutos
 *
 * @param {Object} refetchers - { events: fn, persons: fn, notes: fn, ... }
 * @param {Object} options - { pollingInterval, enableRealtime }
 */
export function useAutoRefresh(refetchers = {}, options = {}) {
  const {
    pollingInterval = 3 * 60 * 1000,  // 3 min oletus
    enableRealtime = true,
  } = options;

  const refetchersRef = useRef(refetchers);
  refetchersRef.current = refetchers;

  const lastRefreshRef = useRef(Date.now());

  // Refetch kaikki
  const refetchAll = useCallback(() => {
    const now = Date.now();
    // Throttle: vähintään 5s väli
    if (now - lastRefreshRef.current < 5000) return;
    lastRefreshRef.current = now;

    console.log('[AutoRefresh] Päivitetään kaikki data...');
    Object.values(refetchersRef.current).forEach(fn => {
      if (typeof fn === 'function') {
        try { fn(); } catch (e) { console.warn('[AutoRefresh] Refetch error:', e); }
      }
    });
  }, []);

  // Refetch yksittäinen taulu
  const refetchTable = useCallback((table) => {
    const mapping = {
      events: 'events',
      persons: 'persons',
      notes: 'notes',
      locations: 'locations',
      tasks: 'tasks',
      inquiries: 'inquiries',
      recipes: 'recipes',
      menus: 'menus',
    };
    const key = mapping[table];
    if (key && typeof refetchersRef.current[key] === 'function') {
      console.log(`[AutoRefresh] Realtime päivitys: ${table}`);
      refetchersRef.current[key]();
    }
  }, []);

  // 1. VISIBILITY CHANGE — kun käyttäjä tulee takaisin
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastRefreshRef.current;
        // Päivitä vain jos yli 30s poissa
        if (elapsed > 30000) {
          console.log(`[AutoRefresh] Välilehti aktiivinen (poissa ${Math.round(elapsed/1000)}s), päivitetään...`);
          refetchAll();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchAll]);

  // 2. ONLINE — kun nettiyhteys palautuu
  useEffect(() => {
    const handleOnline = () => {
      console.log('[AutoRefresh] Yhteys palautui, päivitetään...');
      refetchAll();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchAll]);

  // 3. POLLING — hiljainen taustapolling
  useEffect(() => {
    if (!pollingInterval || pollingInterval < 30000) return;

    const interval = setInterval(() => {
      // Pollataan vain jos sivu on näkyvissä
      if (document.visibilityState === 'visible') {
        refetchAll();
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval, refetchAll]);

  // 4. SUPABASE REALTIME — välitön päivitys muutoksista
  useEffect(() => {
    if (!enableRealtime) return;

    const tables = ['events', 'persons', 'notes', 'locations', 'tasks', 'inquiries', 'recipes', 'menus'];

    const channel = supabase
      .channel('auto-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => refetchTable('events'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'persons' }, () => refetchTable('persons'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => refetchTable('notes'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => refetchTable('locations'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => refetchTable('tasks'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => refetchTable('inquiries'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => refetchTable('recipes'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menus' }, () => refetchTable('menus'))
      .subscribe((status) => {
        console.log('[AutoRefresh] Realtime status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, refetchTable]);

  return { refetchAll };
}
