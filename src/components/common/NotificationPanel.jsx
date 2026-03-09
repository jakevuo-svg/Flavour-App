import { useState } from 'react';
import S from '../../styles/theme';
import { NOTIF_TYPES } from '../../hooks/useNotifications';

const NotificationPanel = ({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClearAll,
  onClose,
  onEventClick,
  onPersonClick,
  events = [],
  persons = [],
}) => {
  const [filter, setFilter] = useState('ALL');

  const filters = [
    { key: 'ALL', label: 'KAIKKI' },
    { key: 'UNREAD', label: 'LUKEMATTA' },
    { key: 'HIGH', label: 'TÄRKEÄT' },
  ];

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'HIGH') return n.priority === 'high';
    return true;
  });

  const handleClick = (n) => {
    if (!n.read) onMarkRead?.(n.id);
    if (n.entity_type === 'event' && n.entity_id) {
      const event = events.find(e => e.id === n.entity_id);
      if (event) { onEventClick?.(event); onClose?.(); }
    } else if (n.entity_type === 'person' && n.entity_id) {
      const person = persons.find(p => p.id === n.entity_id);
      if (person) { onPersonClick?.(person); onClose?.(); }
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.round((now - d) / 60000);
    if (diffMin < 1) return 'juuri nyt';
    if (diffMin < 60) return `${diffMin} min sitten`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `${diffH}h sitten`;
    return d.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' });
  };

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 4,
      background: 'var(--c-bg)', border: '2px solid var(--c-border)', zIndex: 300,
      width: 'min(360px, calc(100vw - 24px))', maxHeight: '70vh', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ ...S.flexBetween, padding: '10px 12px', borderBottom: '2px solid var(--c-border)' }}>
        <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>ILMOITUKSET</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {notifications.some(n => !n.read) && (
            <button onClick={onMarkAllRead} style={{ ...S.btnSmall, padding: '2px 8px', fontSize: 9 }}>
              MERKITSE LUETUKSI
            </button>
          )}
          <button onClick={onClose} style={{ ...S.btnSmall, padding: '2px 6px', fontSize: 10 }}>✕</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '1px solid var(--c-border-soft)' }}>
        {filters.map(f => (
          <span
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{ ...S.tag(filter === f.key), cursor: 'pointer', fontSize: 9, padding: '2px 8px' }}
          >
            {f.label}
          </span>
        ))}
      </div>

      {/* Notification list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--c-text-muted)', fontSize: 12 }}>
            Ei ilmoituksia
          </div>
        ) : (
          filtered.map(n => {
            const meta = NOTIF_TYPES[n.type] || NOTIF_TYPES.system;
            const isClickable = n.entity_type && n.entity_id;
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--c-border-row)',
                  background: n.read ? 'transparent' : 'var(--c-bg-hover)',
                  cursor: isClickable ? 'pointer' : 'default',
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 24, height: 24, flexShrink: 0,
                  border: n.priority === 'high' ? '2px solid var(--c-border)' : '1px solid var(--c-border-soft)',
                  background: n.priority === 'high' ? 'var(--c-text)' : 'transparent',
                  color: n.priority === 'high' ? 'var(--c-bg)' : 'var(--c-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: n.read ? 500 : 700, color: 'var(--c-text)' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--c-text-muted)', flexShrink: 0 }}>
                      {formatTime(n.timestamp)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--c-text-muted)', marginTop: 2, textTransform: 'uppercase' }}>
                    {meta.label}
                  </div>
                </div>

                {/* Unread indicator */}
                {!n.read && (
                  <div style={{
                    width: 6, height: 6, background: 'var(--c-accent-bg)',
                    flexShrink: 0, marginTop: 6,
                  }} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{ padding: '6px 12px', borderTop: '1px solid var(--c-border-soft)', textAlign: 'center' }}>
          <button onClick={onClearAll} style={{ ...S.btnSmall, padding: '2px 10px', fontSize: 9, color: 'var(--c-text-muted)', borderColor: 'var(--c-border-row)' }}>
            TYHJENNÄ KAIKKI
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
