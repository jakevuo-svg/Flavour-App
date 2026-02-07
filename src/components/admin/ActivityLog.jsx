import { useState } from 'react';
import S from '../../styles/theme';

const ActivityLog = () => {
  const [activities] = useState([
    { id: '1', timestamp: '2026-02-06T14:32:00Z', user_name: 'Admin User', action: 'CREATED_EVENT', action_description: 'Loi tapahtuman "Team Meeting"', entity_type: 'event', entity_name: 'Team Meeting' },
    { id: '2', timestamp: '2026-02-06T13:15:00Z', user_name: 'Worker User', action: 'UPDATED_PERSON', action_description: 'Päivitti henkilön "Matti Virtanen"', entity_type: 'person', entity_name: 'Matti Virtanen' },
    { id: '3', timestamp: '2026-02-06T11:45:00Z', user_name: 'Admin User', action: 'CREATED_NOTE', action_description: 'Loi muistiinpanon "Meeting Notes"', entity_type: 'note', entity_name: 'Meeting Notes' },
    { id: '4', timestamp: '2026-02-06T10:20:00Z', user_name: 'Admin User', action: 'CREATED_USER', action_description: 'Loi käyttäjän "temp@flavour.fi"', entity_type: 'user', entity_name: 'temp@flavour.fi' },
    { id: '5', timestamp: '2026-02-06T09:00:00Z', user_name: 'Worker User', action: 'UPDATED_EVENT', action_description: 'Päivitti tapahtumaa "Team Meeting"', entity_type: 'event', entity_name: 'Team Meeting' },
  ]);

  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filters = { ALL: 'KAIKKI', EVENTS: 'TAPAHTUMAT', PERSONS: 'HENKILÖT', NOTES: 'MUISTIINPANOT', USERS: 'KÄYTTÄJÄT' };

  const getEntityType = (action) => {
    if (action.includes('EVENT')) return 'EVENTS';
    if (action.includes('PERSON')) return 'PERSONS';
    if (action.includes('NOTE')) return 'NOTES';
    if (action.includes('USER')) return 'USERS';
    return 'ALL';
  };

  const filtered = activities
    .filter(a => selectedFilter === 'ALL' || getEntityType(a.action) === selectedFilter)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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

      {/* Activity list */}
      {filtered.length === 0 ? (
        <div style={{ ...S.pad, color: '#666', fontSize: 12 }}>Ei aktiviteettiä</div>
      ) : (
        filtered.map(activity => (
          <div key={activity.id} style={{ ...S.row, flexDirection: 'column', alignItems: 'stretch', padding: '8px 12px' }}>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#666', marginBottom: 4 }}>
              <span>{new Date(activity.timestamp).toLocaleDateString('fi-FI')}</span>
              <span>{new Date(activity.timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: '#ddd' }}>{activity.user_name}</span>{' '}
              {activity.action_description}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
              {activity.entity_type}: <span style={{ color: '#999' }}>{activity.entity_name}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ActivityLog;
