import React, { useState, useMemo } from 'react';

const CATEGORIES = [
  { value: 'all', label: 'Kaikki' },
  { value: 'alkuruoka', label: 'Alkuruoka' },
  { value: 'pääruoka', label: 'Pääruoka' },
  { value: 'jälkiruoka', label: 'Jälkiruoka' },
  { value: 'salaatti', label: 'Salaatti' },
  { value: 'keitto', label: 'Keitto' },
  { value: 'välipala', label: 'Välipala' },
  { value: 'cocktailpala', label: 'Cocktailpala' },
  { value: 'leipä', label: 'Leipä' },
  { value: 'juoma', label: 'Juoma' },
  { value: 'muu', label: 'Muu' },
];

const CATEGORY_COLORS = {
  alkuruoka: '#27ae60', pääruoka: '#e67e22', jälkiruoka: '#9b59b6',
  salaatti: '#2ecc71', keitto: '#f39c12', välipala: '#1abc9c',
  cocktailpala: '#e74c3c', leipä: '#d4a574', juoma: '#3498db', muu: '#666',
};

export default function RecipeList({ recipes = [], onRecipeClick, searchQuery = '' }) {
  const [catFilter, setCatFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = recipes;
    if (catFilter !== 'all') list = list.filter(r => r.category === catFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q)) ||
        r.allergens?.some(a => a.toLowerCase().includes(q))
      );
    }
    return list;
  }, [recipes, catFilter, searchQuery]);

  // Count per category
  const counts = useMemo(() => {
    const c = {};
    recipes.forEach(r => { c[r.category] = (c[r.category] || 0) + 1; });
    return c;
  }, [recipes]);

  return (
    <div style={{ padding: 8 }}>
      {/* Category filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {CATEGORIES.map(cat => {
          const count = cat.value === 'all' ? recipes.length : (counts[cat.value] || 0);
          if (cat.value !== 'all' && count === 0) return null;
          const active = catFilter === cat.value;
          const color = cat.value === 'all' ? '#ddd' : (CATEGORY_COLORS[cat.value] || '#666');
          return (
            <button key={cat.value} onClick={() => setCatFilter(cat.value)} style={{
              padding: '4px 10px', fontSize: 10, fontWeight: 700, border: '1px solid',
              borderColor: active ? color : '#333', cursor: 'pointer',
              background: active ? color + '22' : 'transparent',
              color: active ? color : '#666', letterSpacing: 0.5,
            }}>
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Recipe list */}
      {filtered.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 12 }}>Ei reseptejä</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(r => {
            const catColor = CATEGORY_COLORS[r.category] || '#666';
            const catLabel = CATEGORIES.find(c => c.value === r.category)?.label || r.category;
            return (
              <div key={r.id} onClick={() => onRecipeClick(r)} style={{
                padding: '10px 12px', background: '#111', border: '1px solid #1a1a1a',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#ddd', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                  <span style={{ fontSize: 9, padding: '1px 6px', background: catColor + '22', color: catColor, border: `1px solid ${catColor}44`, flexShrink: 0 }}>{catLabel}</span>
                </div>
                {(r.description || r.allergens?.length > 0 || r.tags?.length > 0) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {r.description && <span style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{r.description}</span>}
                    {r.allergens?.map(a => (
                      <span key={a} style={{ fontSize: 9, padding: '1px 4px', background: '#c0392b22', color: '#e74c3c' }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
