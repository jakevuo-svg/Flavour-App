import { useState } from 'react';
import S from '../../styles/theme';

export default function PersonList({ persons = [], onPersonClick, searchQuery = '' }) {
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = persons.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.first_name || '').toLowerCase().includes(query) ||
      (p.last_name || '').toLowerCase().includes(query) ||
      (p.company || '').toLowerCase().includes(query) ||
      (p.email || '').toLowerCase().includes(query)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    if (sortField === 'name') {
      aVal = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
      bVal = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
    } else if (sortField === 'company') {
      aVal = (a.company || '').toLowerCase();
      bVal = (b.company || '').toLowerCase();
    } else if (sortField === 'profile') {
      aVal = (a.profile || '').toLowerCase();
      bVal = (b.profile || '').toLowerCase();
    } else if (sortField === 'modified') {
      aVal = a.modified || a.updated_at || '';
      bVal = b.modified || b.updated_at || '';
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
        <span style={{ ...S.col(2), cursor: 'pointer' }} onClick={() => handleSort('company')}>YRITYS{arrow('company')}</span>
        <span style={{ ...S.col(1), cursor: 'pointer' }} onClick={() => handleSort('profile')}>PROFIILI{arrow('profile')}</span>
        <span style={{ ...S.col(1), cursor: 'pointer' }} onClick={() => handleSort('modified')}>MUOKATTU{arrow('modified')}</span>
      </div>

      {/* Data rows */}
      {sorted.map(person => (
        <div key={person.id} style={S.row} onClick={() => onPersonClick?.(person)}>
          <span style={{ ...S.col(2), fontWeight: 600 }}>{person.first_name} {person.last_name}</span>
          <span style={{ ...S.col(2), color: '#999' }}>{person.company || ''}</span>
          <span style={{ ...S.col(1), color: '#999' }}>{person.profile || ''}</span>
          <span style={{ ...S.col(1), color: '#666', fontSize: 11 }}>
            {person.updated_at ? new Date(person.updated_at).toLocaleDateString('fi-FI') : ''}
          </span>
        </div>
      ))}

      {sorted.length === 0 && (
        <div style={{ padding: 12, color: '#666', fontSize: 12 }}>Ei henkilöitä</div>
      )}
    </div>
  );
}
