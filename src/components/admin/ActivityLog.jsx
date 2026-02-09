import { useState } from 'react';
import { useActivityLog } from '../../hooks/useActivityLog';
import S from '../../styles/theme';

const ActivityLog = () => {
  const { activities, loading } = useActivityLog();
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filters = { ALL: 'KAIKKI', EVENTS: 'TAPAHTUMAT', PERSONS: 'HENKILÖT', NOTES: 'MUISTIINPANOT', USERS: 'KÄYTTÄJÄT' };

  const getEntityType = (activity) => {
    const type = activity.entity_type || activity.action || '';
    if (type.includes('event') || type.includes('EVENT')) return 'EVENTS';
    if (type.includes('person') || type.includes('PERSON')) return 'PERSONS';
    if (type.includes('note') || type.includes('NOTE')) return 'NOTES';
    if (type.includes('user') || type.includes('USER')) return 'USERS';
    return 'ALL';
  };

  const filtered = activities
    .filter(a => selectedFilter === 'ALL' || getEntityType(a) === selectedFilter)
    .sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp));

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
      <div style={{ ...S.pad, borderBottom: '1px solid #444' }}>
        <div style={{ ...S.label, marginBottom: 8 }}>AKTIVITEETTIHISTORIA</div>
        <div style={S.flexWrap}>
          {Object.entries(filters).map(([key, label]) => (
            <span
              key={key}
              onClick={() => setSelectedFilter(key)}
              style={{ ...S.tag(selectedFilter === key), cursor: 'pointer' }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ ...S.pad, color: '#666', fontSize: 12 }}>Ladataan...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...S.pad, color: '#666', fontSize: 12 }}>Ei aktiviteettiä</div>
      ) : (
        filtered.map(activity => (
          <div key={activity.id} style={{ ...S.row, flexDirection: 'column', alignItems: 'stretch', padding: '8px 12px' }}>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#666', marginBottom: 4 }}>
              <span>{new Date(activity.created_at || activity.timestamp).toLocaleDateString('fi-FI')}</span>
              <span>{new Date(activity.created_at || activity.timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: '#ddd' }}>{activity.user_name || 'Käyttäjä'}</span>{' '}
              {activity.description || activity.action_description || activity.action_type || ''}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
              {activity.entity_type}: <span style={{ color: '#999' }}>{activity.entity_name || activity.entity_id || ''}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ActivityLog;
