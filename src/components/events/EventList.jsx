import { useState } from 'react';
import S from '../../styles/theme';

export default function EventList({ events = [], onEventClick, searchQuery = '' }) {
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = events.filter(e => {
    const query = searchQuery.toLowerCase();
    return (
      (e.name || '').toLowerCase().includes(query) ||
      (e.company || '').toLowerCase().includes(query) ||
      (e.location_name || '').toLowerCase().includes(query) ||
      (e.type || '').toLowerCase().includes(query) ||
      (e.status || '').toLowerCase().includes(query)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    if (sortField === 'name') {
      aVal = (a.name || '').toLowerCase();
      bVal = (b.name || '').toLowerCase();
    } else if (sortField === 'date') {
      aVal = a.date || '';
      bVal = b.date || '';
    } else if (sortField === 'location') {
      aVal = (a.location_name || '').toLowerCase();
      bVal = (b.location_name || '').toLowerCase();
    } else if (sortField === 'status') {
      aVal = (a.status || '').toLowerCase();
      bVal = (b.status || '').toLowerCase();
    } else if (sortField === 'pax') {
      aVal = parseInt(a.guest_count || 0);
      bVal = parseInt(b.guest_count || 0);
    }
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const arrow = (field) => sortField === field ? (sortAsc ? ' ↑' : ' ↓') : '';

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
      {/* Header */}
      <div style={S.rowHeader}>
        <span style={{ ...S.col(2), cursor: 'pointer' }} onClick={() => handleSort('name')}>NIMI{arrow('name')}</span>
        <span style={{ ...S.col(1), cursor: 'pointer' }} onClick={() => handleSort('date')}>PVM{arrow('date')}</span>
        <span style={{ ...S.col(1.5), cursor: 'pointer' }} onClick={() => handleSort('location')}>SIJAINTI{arrow('location')}</span>
        <span style={{ ...S.col(1), cursor: 'pointer' }} onClick={() => handleSort('status')}>STATUS{arrow('status')}</span>
        <span style={{ ...S.col(0.8), cursor: 'pointer' }} onClick={() => handleSort('pax')}>PAX{arrow('pax')}</span>
      </div>

      {/* Data rows */}
      {sorted.map(event => (
        <div key={event.id} style={S.row} onClick={() => onEventClick?.(event)}>
          <span style={{ ...S.col(2), fontWeight: 600 }}>{event.name}</span>
          <span style={{ ...S.col(1), color: '#999', fontSize: 12 }}>
            {event.date ? new Date(event.date).toLocaleDateString('fi-FI') : ''}
          </span>
          <span style={{ ...S.col(1.5), color: '#999' }}>{event.location_name || ''}</span>
          <span style={S.col(1)}>
            <span style={{
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 700,
              border: '1px solid #ddd',
              color: '#ddd',
              background: '#1e1e1e',
              textTransform: 'uppercase',
            }}>
              {event.status || ''}
            </span>
          </span>
          <span style={{ ...S.col(0.8), color: '#999' }}>{event.guest_count || ''}</span>
        </div>
      ))}

      {sorted.length === 0 && (
        <div style={{ padding: 12, color: '#666', fontSize: 12 }}>Ei tapahtumia</div>
      )}
    </div>
  );
}
