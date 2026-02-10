import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import S from '../../styles/theme';

const EventAssignments = ({ events = [], assignWorker, removeWorkerAssignment, getEventAssignments }) => {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [assignments, setAssignments] = useState({}); // { eventId: [userId, userId, ...] }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // "eventId-userId" being saved
  const [message, setMessage] = useState(null);

  // Fetch all non-admin users (workers + temporary)
  useEffect(() => {
    const fetchWorkers = async () => {
      if (isDemoMode) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, role, is_active')
          .in('role', ['worker', 'temporary'])
          .order('first_name');
        if (!error && data) setWorkers(data);
      } catch (err) {
        console.error('[EventAssignments] Failed to fetch workers:', err);
      }
    };
    fetchWorkers();
  }, []);

  // Fetch all assignments for all events
  useEffect(() => {
    const fetchAllAssignments = async () => {
      if (isDemoMode || events.length === 0) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('event_assignments')
          .select('event_id, user_id');
        if (!error && data) {
          const map = {};
          data.forEach(a => {
            if (!map[a.event_id]) map[a.event_id] = [];
            map[a.event_id].push(a.user_id);
          });
          setAssignments(map);
        }
      } catch (err) {
        console.error('[EventAssignments] Failed to fetch assignments:', err);
      }
      setLoading(false);
    };
    fetchAllAssignments();
  }, [events]);

  const handleToggle = async (eventId, userId) => {
    const key = `${eventId}-${userId}`;
    setSaving(key);
    setMessage(null);

    const isAssigned = (assignments[eventId] || []).includes(userId);

    try {
      if (isAssigned) {
        await removeWorkerAssignment(eventId, userId);
        setAssignments(prev => ({
          ...prev,
          [eventId]: (prev[eventId] || []).filter(id => id !== userId),
        }));
      } else {
        await assignWorker(eventId, userId);
        setAssignments(prev => ({
          ...prev,
          [eventId]: [...(prev[eventId] || []), userId],
        }));
      }
    } catch (err) {
      console.error('[EventAssignments] Toggle error:', err);
      setMessage({ type: 'error', text: err.message });
    }
    setSaving(null);
  };

  // Sort events by date (upcoming first)
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (workers.length === 0 && !loading) {
    return (
      <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
        <div style={{ ...S.pad, borderBottom: '1px solid #444' }}>
          <div style={S.label}>{t('eventAccess')}</div>
        </div>
        <div style={{ ...S.pad, color: '#666', fontSize: 12 }}>
          {t('noWorkersYet')}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
      <div style={{ ...S.pad, borderBottom: '1px solid #444' }}>
        <div style={S.label}>{t('eventAccess')}</div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
          {t('eventAccessDesc')}
        </div>
      </div>

      {message && (
        <div style={{
          padding: '8px 16px', fontSize: 12, fontWeight: 600,
          background: message.type === 'error' ? '#3a1111' : '#113a11',
          color: message.type === 'error' ? '#ff6b6b' : '#6bff6b',
          borderBottom: '1px solid #444',
        }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ ...S.pad, color: '#666', fontSize: 12 }}>{t('loading')}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', background: '#2a2a2a' }}>
                <th style={thStyle}>{t('eventName')}</th>
                <th style={thStyle}>{t('date')}</th>
                {workers.map(w => (
                  <th key={w.id} style={{ ...thStyle, textAlign: 'center', minWidth: 80 }}>
                    <div>{w.first_name}</div>
                    <div style={{ fontSize: 9, color: '#666', fontWeight: 400 }}>
                      {w.last_name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map(event => (
                <tr key={event.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ ...tdStyle, fontWeight: 600, maxWidth: 200 }}>
                    {event.name}
                  </td>
                  <td style={{ ...tdStyle, color: '#999', whiteSpace: 'nowrap' }}>
                    {event.date ? new Date(event.date).toLocaleDateString('fi-FI') : '-'}
                  </td>
                  {workers.map(w => {
                    const isAssigned = (assignments[event.id] || []).includes(w.id);
                    const isSaving = saving === `${event.id}-${w.id}`;
                    return (
                      <td key={w.id} style={{ ...tdStyle, textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggle(event.id, w.id)}
                          disabled={isSaving || !w.is_active}
                          style={{
                            width: 28,
                            height: 28,
                            border: isAssigned ? '2px solid #6bff6b' : '2px solid #555',
                            background: isAssigned ? '#1a2a1a' : '#1e1e1e',
                            color: isAssigned ? '#6bff6b' : '#555',
                            cursor: w.is_active ? 'pointer' : 'not-allowed',
                            fontSize: 14,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            opacity: w.is_active ? 1 : 0.3,
                          }}
                        >
                          {isSaving ? '·' : isAssigned ? '✓' : ''}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: '#999',
};

const tdStyle = {
  padding: '6px 12px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export default EventAssignments;
