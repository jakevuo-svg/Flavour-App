import { useState, useCallback } from 'react';

// All controllable features with Finnish labels
export const PERMISSION_FEATURES = [
  // Navigation tabs
  { key: 'tab_persons', label: 'Henkilöt-välilehti', group: 'NAVIGAATIO' },
  { key: 'tab_date', label: 'Kalenteri-välilehti', group: 'NAVIGAATIO' },
  { key: 'tab_events', label: 'Tapahtumat-välilehti', group: 'NAVIGAATIO' },
  { key: 'tab_locations', label: 'Sijainnit-välilehti', group: 'NAVIGAATIO' },
  { key: 'tab_notes', label: 'Muistiinpanot-välilehti', group: 'NAVIGAATIO' },
  { key: 'tab_admin', label: 'Hallinta-välilehti', group: 'NAVIGAATIO' },
  // Visibility
  { key: 'view_pricing', label: 'Hinnoittelu', group: 'NÄKYVYYS' },
  { key: 'view_contacts', label: 'Yhteystiedot', group: 'NÄKYVYYS' },
  { key: 'view_allergens', label: 'Allergeenit / ERV', group: 'NÄKYVYYS' },
  { key: 'view_files', label: 'Tiedostot & materiaalit', group: 'NÄKYVYYS' },
  { key: 'view_feedback', label: 'Palautteet', group: 'NÄKYVYYS' },
  // Actions
  { key: 'action_create_event', label: 'Luo tapahtuma', group: 'TOIMINNOT' },
  { key: 'action_create_person', label: 'Luo henkilö', group: 'TOIMINNOT' },
  { key: 'action_edit', label: 'Muokkaa tietoja', group: 'TOIMINNOT' },
  { key: 'action_delete', label: 'Poista tietoja', group: 'TOIMINNOT' },
  { key: 'action_add_notes', label: 'Lisää muistiinpanoja', group: 'TOIMINNOT' },
];

export const ROLES = [
  { key: 'admin', label: 'Järjestelmänvalvoja' },
  { key: 'worker', label: 'Työntekijä' },
  { key: 'temporary', label: 'Väliaikainen' },
];

// Tab key → navigation tab name mapping
export const TAB_KEY_TO_NAV = {
  tab_persons: 'PERSON',
  tab_date: 'DATE',
  tab_events: 'EVENTS',
  tab_locations: 'LOCATIONS',
  tab_notes: 'NOTES',
  tab_admin: 'ADMIN',
};

// Default permissions per role
const DEFAULT_PERMISSIONS = {
  admin: {
    tab_persons: true, tab_date: true, tab_events: true, tab_locations: true, tab_notes: true, tab_admin: true,
    view_pricing: true, view_contacts: true, view_allergens: true, view_files: true, view_feedback: true,
    action_create_event: true, action_create_person: true, action_edit: true, action_delete: true, action_add_notes: true,
  },
  worker: {
    tab_persons: false, tab_date: true, tab_events: true, tab_locations: true, tab_notes: true, tab_admin: false,
    view_pricing: false, view_contacts: true, view_allergens: true, view_files: true, view_feedback: false,
    action_create_event: false, action_create_person: false, action_edit: false, action_delete: false, action_add_notes: true,
  },
  temporary: {
    tab_persons: false, tab_date: true, tab_events: true, tab_locations: false, tab_notes: true, tab_admin: false,
    view_pricing: false, view_contacts: false, view_allergens: true, view_files: false, view_feedback: false,
    action_create_event: false, action_create_person: false, action_edit: false, action_delete: false, action_add_notes: true,
  },
};

export function usePermissions() {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  const togglePermission = useCallback((role, featureKey) => {
    // Admin tab_admin is locked — can't remove admin's own admin access
    if (role === 'admin' && featureKey === 'tab_admin') return;

    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [featureKey]: !prev[role][featureKey],
      },
    }));
  }, []);

  const hasPermission = useCallback((role, featureKey) => {
    if (!role || !permissions[role]) return false;
    return !!permissions[role][featureKey];
  }, [permissions]);

  const getTabsForRole = useCallback((role) => {
    if (!role || !permissions[role]) return [];
    return Object.entries(TAB_KEY_TO_NAV)
      .filter(([key]) => permissions[role][key])
      .map(([, navTab]) => navTab);
  }, [permissions]);

  const resetToDefaults = useCallback(() => {
    setPermissions(DEFAULT_PERMISSIONS);
  }, []);

  return {
    permissions,
    togglePermission,
    hasPermission,
    getTabsForRole,
    resetToDefaults,
  };
}
