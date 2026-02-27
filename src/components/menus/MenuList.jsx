import React, { useState, useMemo } from 'react';

const MENU_TYPES = [
  { value: 'all', label: 'Kaikki' },
  { value: '3-ruokalajin illallinen', label: '3-ruokalajin illallinen' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'cocktailpalat', label: 'Cocktailpalat' },
  { value: 'lounas', label: 'Lounas' },
  { value: 'aamupala', label: 'Aamupala' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'muu', label: 'Muu' },
];

const TYPE_COLORS = {
  '3-ruokalajin illallinen': '#e67e22', buffet: '#27ae60', cocktailpalat: '#e74c3c',
  lounas: '#3498db', aamupala: '#f1c40f', snacks: '#1abc9c', muu: '#666',
};

export default function MenuList({ menus = [], onMenuClick, searchQuery = '' }) {
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = menus;
    if (typeFilter !== 'all') list = list.filter(m => m.menu_type === typeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [menus, typeFilter, searchQuery]);

  const counts = useMemo(() => {
    const c = {};
    menus.forEach(m => { c[m.menu_type] = (c[m.menu_type] || 0) + 1; });
    return c;
  }, [menus]);

  return (
    <div style={{ padding: 8 }}>
      {/* Type filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {MENU_TYPES.map(t => {
          const count = t.value === 'all' ? menus.length : (counts[t.value] || 0);
          if (t.value !== 'all' && count === 0) return null;
          const active = typeFilter === t.value;
          const color = t.value === 'all' ? '#ddd' : (TYPE_COLORS[t.value] || '#666');
          return (
            <button key={t.value} onClick={() => setTypeFilter(t.value)} style={{
              padding: '4px 10px', fontSize: 10, fontWeight: 700, border: '1px solid',
              borderColor: active ? color : '#333', cursor: 'pointer',
              background: active ? color + '22' : 'transparent',
              color: active ? color : '#666', letterSpacing: 0.5,
            }}>
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Menu list */}
      {filtered.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 12 }}>Ei menuja</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(m => {
            const tc = TYPE_COLORS[m.menu_type] || '#666';
            const recipeCount = m.menu_recipes?.length || 0;
            const typeLabel = MENU_TYPES.find(t => t.value === m.menu_type)?.label || m.menu_type;
            return (
              <div key={m.id} onClick={() => onMenuClick(m)} style={{
                padding: '10px 12px', background: '#111', border: '1px solid #1a1a1a',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#ddd', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                  <span style={{ fontSize: 9, padding: '1px 6px', background: tc + '22', color: tc, border: `1px solid ${tc}44`, flexShrink: 0 }}>{typeLabel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {m.description && <span style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{m.description}</span>}
                  <span style={{ fontSize: 10, color: '#999', flexShrink: 0 }}>{recipeCount} annosta</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
