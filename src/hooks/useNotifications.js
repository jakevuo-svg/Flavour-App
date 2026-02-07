import { useState, useCallback, useMemo } from 'react';

/**
 * Notification system — event bus for all app changes.
 * Captures actions, generates notifications, tracks read/unread.
 * Designed as a foundation for future per-user agents.
 *
 * Notification shape:
 * { id, type, title, message, timestamp, read, entity_type, entity_id, priority }
 *
 * Types: event_created, event_updated, note_added, deadline_approaching,
 *        task_overdue, person_updated, person_created, reminder
 */

let nextNotifId = 1;

export const NOTIF_TYPES = {
  event_created: { icon: '◆', label: 'Uusi tapahtuma' },
  event_updated: { icon: '◇', label: 'Tapahtuma päivitetty' },
  note_added: { icon: '✎', label: 'Muistiinpano' },
  deadline_approaching: { icon: '!', label: 'Deadline lähestyy' },
  task_overdue: { icon: '!!', label: 'Tehtävä myöhässä' },
  person_updated: { icon: '○', label: 'Henkilö päivitetty' },
  person_created: { icon: '●', label: 'Uusi henkilö' },
  reminder: { icon: '◎', label: 'Muistutus' },
  system: { icon: '⚙', label: 'Järjestelmä' },
};

// Notification preferences — which types each role wants
const DEFAULT_PREFERENCES = {
  admin: {
    event_created: true, event_updated: true, note_added: true,
    deadline_approaching: true, task_overdue: true,
    person_updated: true, person_created: true, reminder: true, system: true,
  },
  worker: {
    event_created: true, event_updated: true, note_added: true,
    deadline_approaching: true, task_overdue: true,
    person_updated: false, person_created: false, reminder: true, system: false,
  },
  temporary: {
    event_created: false, event_updated: true, note_added: false,
    deadline_approaching: true, task_overdue: false,
    person_updated: false, person_created: false, reminder: true, system: false,
  },
};

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  // Push a new notification
  const pushNotification = useCallback(({ type, title, message, entity_type, entity_id, priority = 'normal' }) => {
    const notif = {
      id: `notif-${nextNotifId++}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      entity_type: entity_type || null,
      entity_id: entity_id || null,
      priority,
    };
    setNotifications(prev => [notif, ...prev].slice(0, 100)); // Keep max 100
    return notif;
  }, []);

  // Mark single notification as read
  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  // Mark all as read
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Dismiss / remove
  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Unread count
  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.read).length
  , [notifications]);

  // Get notifications filtered by user role preferences
  const getForRole = useCallback((role) => {
    const prefs = preferences[role] || preferences.worker;
    return notifications.filter(n => prefs[n.type] !== false);
  }, [notifications, preferences]);

  // Toggle preference for a role
  const togglePreference = useCallback((role, type) => {
    setPreferences(prev => ({
      ...prev,
      [role]: { ...prev[role], [type]: !prev[role]?.[type] },
    }));
  }, []);

  // === Convenience emitters (call these from App.jsx actions) ===

  const emitEventCreated = useCallback((event) => {
    pushNotification({
      type: 'event_created',
      title: 'Uusi tapahtuma luotu',
      message: `"${event.name}" — ${event.date || 'ei päivämäärää'}`,
      entity_type: 'event',
      entity_id: event.id,
    });
  }, [pushNotification]);

  const emitEventUpdated = useCallback((event) => {
    pushNotification({
      type: 'event_updated',
      title: 'Tapahtuma päivitetty',
      message: `"${event.name}"`,
      entity_type: 'event',
      entity_id: event.id,
    });
  }, [pushNotification]);

  const emitNoteAdded = useCallback((note, contextName) => {
    pushNotification({
      type: 'note_added',
      title: 'Muistiinpano lisätty',
      message: contextName ? `Kohde: ${contextName}` : (note.content || '').slice(0, 60),
      entity_type: note.event_id ? 'event' : note.person_id ? 'person' : null,
      entity_id: note.event_id || note.person_id || null,
    });
  }, [pushNotification]);

  const emitPersonCreated = useCallback((person) => {
    pushNotification({
      type: 'person_created',
      title: 'Uusi henkilö lisätty',
      message: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
      entity_type: 'person',
      entity_id: person.id,
    });
  }, [pushNotification]);

  const emitPersonUpdated = useCallback((person) => {
    pushNotification({
      type: 'person_updated',
      title: 'Henkilö päivitetty',
      message: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
      entity_type: 'person',
      entity_id: person.id,
    });
  }, [pushNotification]);

  const emitDeadline = useCallback((event, hoursLeft) => {
    pushNotification({
      type: 'deadline_approaching',
      title: 'Tapahtuma lähestyy',
      message: `"${event.name}" — ${hoursLeft < 24 ? 'HUOMENNA' : `${Math.round(hoursLeft / 24)}pv päästä`}`,
      entity_type: 'event',
      entity_id: event.id,
      priority: hoursLeft < 24 ? 'high' : 'normal',
    });
  }, [pushNotification]);

  const emitTaskOverdue = useCallback((task, eventName) => {
    pushNotification({
      type: 'task_overdue',
      title: 'Tehtävä myöhässä',
      message: `"${task.title}" — ${eventName || ''}`,
      entity_type: 'event',
      entity_id: task.event_id,
      priority: 'high',
    });
  }, [pushNotification]);

  return {
    notifications,
    unreadCount,
    preferences,
    pushNotification,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
    getForRole,
    togglePreference,
    // Convenience emitters
    emitEventCreated,
    emitEventUpdated,
    emitNoteAdded,
    emitPersonCreated,
    emitPersonUpdated,
    emitDeadline,
    emitTaskOverdue,
  };
}
