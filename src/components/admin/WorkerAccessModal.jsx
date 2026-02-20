import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import S from '../../styles/theme';

const WorkerAccessModal = ({ worker, events = [], assignWorker, removeWorkerAssignment, onClose }) => {
  const { t } = useLanguage();
  const [assignedIds, setAssignedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

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

  // Sort: upcoming first, then by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBoxLg, width: 520 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#999' }}>
            {t('eventAccess')}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            {worker.first_name} {worker.last_name}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {worker.email}
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.5 }}>
          {t('eventAccessDesc')}
        </div>

        {/* Event list */}
        {loading ? (
          <div style={{ color: '#666', fontSize: 12, padding: '20px 0' }}>{t('loading')}</div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderBottom: '1px solid #333',
                      cursor: isSaving ? 'wait' : 'pointer',
                      opacity: isPast ? 0.5 : 1,
                      background: isAssigned ? '#1a2a1a' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 24,
                      height: 24,
                      border: isAssigned ? '2px solid #6bff6b' : '2px solid #555',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: isAssigned ? '#6bff6b' : '#555',
                    }}>
                      {isSaving ? '·' : isAssigned ? '✓' : ''}
                    </div>

                    {/* Event info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {event.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2, display: 'flex', gap: 12 }}>
                        <span>{eventDate ? eventDate.toLocaleDateString('fi-FI') : '-'}</span>
                        {event.location_name && <span>{event.location_name}</span>}
                        {event.type && <span style={{ color: '#666' }}>{event.type}</span>}
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      color: event.status === 'CONFIRMED' ? '#6bff6b' :
                             event.status === 'DONE' ? '#666' : '#ddd',
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

        {/* Summary */}
        <div style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid #444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, color: '#999' }}>
            {assignedIds.length} / {events.length} {t('tab_EVENTS').toLowerCase()}
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
