import { useState } from 'react';
import S from '../../styles/theme';

export default function ArchiveList({ events = [], onEventClick, onRestore }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false); // newest first by default

  const filtered = events.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.name || '').toLowerCase().includes(q) ||
      (e.company || '').toLowerCase().includes(q) ||
      (e.location_name || '').toLowerCase().includes(q) ||
      (e.type || '').toLowerCase().includes(q) ||
      (e.status || '').toLowerCase().includes(q) ||
      (e.booker || '').toLowerCase().includes(q) ||
      (e.contact || '').toLowerCase().includes(q) ||
      (e.date || '').includes(q)
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
    } else if (sortField === 'company') {
      aVal = (a.company || '').toLowerCase();
      bVal = (b.company || '').toLowerCase();
    } else if (sortField === 'location') {
      aVal = (a.location_name || '').toLowerCase();
      bVal = (b.location_name || '').toLowerCase();
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
    else { setSortField(field); setSortAsc(field === 'name'); }
  };

  const arrow = (field) => sortField === field ? (sortAsc ? ' ↑' : ' ↓') : '';

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
      {/* Archive header */}
      <div style={{ padding: '16px 16px 0', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#888', textTransform: 'uppercase' }}>
            ARKISTO
          </span>
          <span style={{ fontSize: 11, color: '#555' }}>
            {filtered.length} tapahtumaa
          </span>
        </div>

        {/* Search */}
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Hae arkistosta... (nimi, yritys, sijainti, päivämäärä)"
          style={{ ...S.input, width: '100%', boxSizing: 'border-box', marginBottom: 4 }}
        />
      </div>

      {/* Table header */}
      <div style={S.rowHeader}>
        <span style={{ ...S.col(2.5), cursor: 'pointer' }} onClick={() => handleSort('name')}>NIMI{arrow('name')}</span>
        <span style={{ ...S.col(1), cursor: 'pointer' }} onClick={() => handleSort('date')}>PVM{arrow('date')}</span>
        <span style={{ ...S.col(1.5), cursor: 'pointer' }} onClick={() => handleSort('company')}>YRITYS{arrow('company')}</span>
        <span style={{ ...S.col(1.2), cursor: 'pointer' }} onClick={() => handleSort('location')}>SIJAINTI{arrow('location')}</span>
        <span style={{ ...S.col(0.6), cursor: 'pointer' }} onClick={() => handleSort('pax')}>PAX{arrow('pax')}</span>
      </div>

      {/* Data rows */}
      {sorted.map(event => (
        <div
          key={event.id}
          style={{ ...S.row, cursor: 'pointer', opacity: 0.85 }}
          onClick={() => onEventClick?.(event)}
        >
          <span style={{ ...S.col(2.5), fontWeight: 600 }}>{event.name}</span>
          <span style={{ ...S.col(1), color: '#999', fontSize: 12 }}>
            {event.date ? new Date(event.date).toLocaleDateString('fi-FI') : ''}
          </span>
          <span style={{ ...S.col(1.5), color: '#999', fontSize: 12 }}>{event.company || ''}</span>
          <span style={{ ...S.col(1.2), color: '#999', fontSize: 12 }}>{event.location_name || ''}</span>
          <span style={{ ...S.col(0.6), color: '#999', fontSize: 12 }}>{event.guest_count || ''}</span>
        </div>
      ))}

      {sorted.length === 0 && (
        <div style={{ padding: 16, color: '#555', fontSize: 12, textAlign: 'center' }}>
          {searchQuery ? 'Ei hakutuloksia arkistosta' : 'Arkisto on tyhjä'}
        </div>
      )}
    </div>
  );
}
