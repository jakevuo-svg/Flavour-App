import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { PERMISSION_FEATURES } from '../../hooks/usePermissions';
import S from '../../styles/theme';

// Default permissions per role (duplicated from usePermissions for reference)
const DEFAULT_PERMISSIONS = {
  admin: {
    tab_persons: true, tab_date: true, tab_events: true, tab_inquiries: true, tab_menus: true, tab_archive: true, tab_locations: true, tab_notes: true, tab_admin: true,
    card_contacts: true, card_workers: true, card_goal: true, card_attention: true, card_erv: true,
    card_schedule: true, card_menu: true, card_decorations: true, card_logistics: true, card_order: true,
    card_materials: true, card_during: true, card_pricing: true, card_feedback: true, card_tasks: true, card_notes: true,
    action_create_event: true, action_create_person: true, action_edit: true, action_delete: true, action_add_notes: true,
  },
  worker: {
    tab_persons: false, tab_date: true, tab_events: true, tab_inquiries: false, tab_menus: true, tab_archive: true, tab_locations: true, tab_notes: true, tab_admin: false,
    card_contacts: false, card_workers: true, card_goal: true, card_attention: true, card_erv: true,
    card_schedule: true, card_menu: true, card_decorations: true, card_logistics: true, card_order: false,
    card_materials: true, card_during: true, card_pricing: false, card_feedback: false, card_tasks: true, card_notes: true,
    action_create_event: false, action_create_person: false, action_edit: false, action_delete: false, action_add_notes: true,
  },
  temporary: {
    tab_persons: false, tab_date: true, tab_events: true, tab_inquiries: false, tab_menus: false, tab_archive: false, tab_locations: false, tab_notes: true, tab_admin: false,
    card_contacts: false, card_workers: false, card_goal: false, card_attention: true, card_erv: true,
    card_schedule: true, card_menu: true, card_decorations: false, card_logistics: false, card_order: false,
    card_materials: false, card_during: true, card_pricing: false, card_feedback: false, card_tasks: true, card_notes: false,
    action_create_event: false, action_create_person: false, action_edit: false, action_delete: false, action_add_notes: true,
  },
};

const WorkerAccessModal = ({ worker, events = [], assignWorker, removeWorkerAssignment, onClose, onUpdateSpecialPermissions }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('TAPAHTUMAT');
  const [assignedIds, setAssignedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [specialPerms, setSpecialPerms] = useState(worker.special_permissions || {});
  const [savingPerm, setSavingPerm] = useState(false);

  const role = worker.role || 'worker';
  const roleDefaults = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.worker;

  // Fetch this worker's current assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data, error } = await supabase
          .from('event_assignments')
          .select('event_id')
          .eq('user_id', worker.id);
        if (!error && data) {
          setAssignedIds(data.map(a => a.event_id));
        }
      } catch (err) {
        console.error('[WorkerAccessModal] Fetch error:', err);
      }
      setLoading(false);
    };
    fetchAssignments();
  }, [worker.id]);

  const handleToggle = async (eventId) => {
    setSaving(eventId);
    const isAssigned = assignedIds.includes(eventId);

    try {
      if (isAssigned) {
        await removeWorkerAssignment(eventId, worker.id);
        setAssignedIds(prev => prev.filter(id => id !== eventId));
      } else {
        await assignWorker(eventId, worker.id);
        setAssignedIds(prev => [...prev, eventId]);
      }
    } catch (err) {
      console.error('[WorkerAccessModal] Toggle error:', err);
    }
    setSaving(null);
  };

  // Toggle a special permission
  const handleTogglePerm = async (featureKey) => {
    const currentOverride = specialPerms[featureKey];
    const roleDefault = !!roleDefaults[featureKey];

    let newPerms;
    if (currentOverride === undefined) {
      // No override → set to opposite of role default
      newPerms = { ...specialPerms, [featureKey]: !roleDefault };
    } else {
      // Has override → remove it (back to role default)
      newPerms = { ...specialPerms };
      delete newPerms[featureKey];
    }

    setSpecialPerms(newPerms);
    setSavingPerm(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ special_permissions: newPerms })
        .eq('id', worker.id);

      if (error) {
        console.error('[WorkerAccessModal] Save perm error:', error);
        setSpecialPerms(specialPerms); // revert
      } else {
        onUpdateSpecialPermissions?.(worker.id, newPerms);
      }
    } catch (err) {
      console.error('[WorkerAccessModal] Save perm failed:', err);
      setSpecialPerms(specialPerms); // revert
    }
    setSavingPerm(false);
  };

  // Get effective value for a permission
  const getEffective = (featureKey) => {
    if (specialPerms[featureKey] !== undefined) return specialPerms[featureKey];
    return !!roleDefaults[featureKey];
  };

  const hasOverride = (featureKey) => specialPerms[featureKey] !== undefined;

  // Sort events: upcoming first, then by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group permission features by category
  const groups = {};
  PERMISSION_FEATURES.forEach(f => {
    if (!groups[f.group]) groups[f.group] = [];
    groups[f.group].push(f);
  });

  const tabs = [
    { key: 'TAPAHTUMAT', label: 'TAPAHTUMAT' },
    { key: 'ERIKOISOIKEUDET', label: 'ERIKOISOIKEUDET' },
  ];

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBoxLg, width: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#999' }}>
            {t('eventAccess')}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            {worker.first_name} {worker.last_name}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: '#999' }}>{worker.email}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              padding: '2px 8px', border: '1px solid #555', color: '#888',
            }}>
              {role === 'admin' ? 'Admin' : role === 'temporary' ? 'Väliaikainen' : 'Työntekijä'}
            </span>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: 12 }}>
          {tabs.map(tab => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: 1,
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #ddd' : '2px solid transparent',
                color: activeTab === tab.key ? '#ddd' : '#666',
              }}
            >
              {tab.label}
              {tab.key === 'ERIKOISOIKEUDET' && Object.keys(specialPerms).length > 0 && (
                <span style={{ color: '#6baaff', marginLeft: 6, fontWeight: 400 }}>
                  ({Object.keys(specialPerms).length})
                </span>
              )}
            </div>
          ))}
        </div>

        {/* TAPAHTUMAT TAB */}
        {activeTab === 'TAPAHTUMAT' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>
              {t('eventAccessDesc')}
            </div>

            {loading ? (
              <div style={{ color: '#666', fontSize: 12, padding: '20px 0' }}>{t('loading')}</div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {sortedEvents.length === 0 ? (
                  <div style={{ color: '#666', fontSize: 12, padding: '20px 0' }}>{t('noResults')}</div>
                ) : (
                  sortedEvents.map(event => {
                    const isAssigned = assignedIds.includes(event.id);
                    const isSaving = saving === event.id;
                    const eventDate = event.date ? new Date(event.date) : null;
                    const isPast = eventDate && eventDate < new Date();

                    return (
                      <div
                        key={event.id}
                        onClick={() => !isSaving && handleToggle(event.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderBottom: '1px solid #333',
                          cursor: isSaving ? 'wait' : 'pointer',
                          opacity: isPast ? 0.5 : 1,
                          background: isAssigned ? '#1a2a1a' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{
                          width: 24, height: 24,
                          border: isAssigned ? '2px solid #6bff6b' : '2px solid #555',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: 14, fontWeight: 700,
                          color: isAssigned ? '#6bff6b' : '#555',
                        }}>
                          {isSaving ? '·' : isAssigned ? '✓' : ''}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{event.name}</div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2, display: 'flex', gap: 12 }}>
                            <span>{eventDate ? eventDate.toLocaleDateString('fi-FI') : '-'}</span>
                            {event.location_name && <span>{event.location_name}</span>}
                            {event.type && <span style={{ color: '#666' }}>{event.type}</span>}
                          </div>
                        </div>
                        <div style={{
                          fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                          color: event.status === 'CONFIRMED' ? '#6bff6b' : event.status === 'DONE' ? '#666' : '#ddd',
                          flexShrink: 0,
                        }}>
                          {event.status}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* ERIKOISOIKEUDET TAB */}
        {activeTab === 'ERIKOISOIKEUDET' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>
              Valitse tämän henkilön erikoisoikeudet. Sininen = roolin oletuksesta poikkeava asetus.
              Klikkaa muuttaaksesi: oletusarvo → käänteinen → takaisin oletukseen.
            </div>

            {savingPerm && (
              <div style={{ fontSize: 11, color: '#6baaff', marginBottom: 8 }}>Tallennetaan...</div>
            )}

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {Object.entries(groups).map(([groupName, features]) => (
                <div key={groupName}>
                  {/* Group header */}
                  <div style={{
                    padding: '6px 12px', background: '#1a1a1a',
                    borderBottom: '1px solid #444',
                    fontSize: 10, fontWeight: 700, color: '#666', letterSpacing: 1,
                  }}>
                    {groupName}
                  </div>

                  {/* Feature rows */}
                  {features.map(feature => {
                    const effective = getEffective(feature.key);
                    const overridden = hasOverride(feature.key);
                    const roleVal = !!roleDefaults[feature.key];

                    return (
                      <div
                        key={feature.key}
                        onClick={() => handleTogglePerm(feature.key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '8px 12px', borderBottom: '1px solid #333',
                          cursor: 'pointer',
                          background: overridden ? '#1a1a2a' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: 22, height: 22,
                          border: `2px solid ${overridden ? '#6baaff' : effective ? '#555' : '#444'}`,
                          background: effective ? (overridden ? '#6baaff' : '#555') : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: 12, fontWeight: 700,
                          color: effective ? '#111' : 'transparent',
                        }}>
                          {effective ? '✓' : ''}
                        </div>

                        {/* Label */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 12,
                            color: overridden ? '#6baaff' : '#ccc',
                            fontWeight: overridden ? 600 : 400,
                          }}>
                            {feature.label}
                          </div>
                        </div>

                        {/* Status indicator */}
                        <div style={{ flexShrink: 0, fontSize: 10, color: '#666' }}>
                          {overridden ? (
                            <span style={{ color: '#6baaff', fontWeight: 600 }}>
                              {effective ? 'SALLITTU' : 'ESTETTY'}
                            </span>
                          ) : (
                            <span>{roleVal ? 'oletus ✓' : 'oletus ✗'}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{
              paddingTop: 10, marginTop: 8, borderTop: '1px solid #444',
              display: 'flex', gap: 16, fontSize: 10, color: '#666', flexWrap: 'wrap',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, border: '2px solid #555', background: '#555', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#111' }}>✓</span>
                Roolin oletus
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, border: '2px solid #6baaff', background: '#6baaff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#111' }}>✓</span>
                Erikoisoikeus (sallittu)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, border: '2px solid #6baaff', background: 'transparent', display: 'inline-block' }}></span>
                Erikoisoikeus (estetty)
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 16, paddingTop: 12, borderTop: '1px solid #444',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, color: '#999' }}>
            {activeTab === 'TAPAHTUMAT'
              ? `${assignedIds.length} / ${events.length} ${t('tab_EVENTS').toLowerCase()}`
              : `${Object.keys(specialPerms).length} erikoisoikeutta`
            }
          </div>
          <button onClick={onClose} style={S.btnWire}>
            {t('cancel')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default WorkerAccessModal;
