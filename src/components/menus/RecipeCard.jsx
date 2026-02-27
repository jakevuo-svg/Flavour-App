import React, { useState } from 'react';

const CATEGORIES = [
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

const COMMON_ALLERGENS = ['Gluteeni', 'Laktoosi', 'Maito', 'Kananmuna', 'Pähkinä', 'Soija', 'Kala', 'Äyriäinen', 'Selleri', 'Sinappi', 'Seesami', 'Vegaaninen'];

const CATEGORY_COLORS = {
  alkuruoka: '#27ae60', pääruoka: '#e67e22', jälkiruoka: '#9b59b6',
  salaatti: '#2ecc71', keitto: '#f39c12', välipala: '#1abc9c',
  cocktailpala: '#e74c3c', leipä: '#d4a574', juoma: '#3498db', muu: '#666',
};

export default function RecipeCard({ recipe, onUpdate, onDelete, onBack }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...recipe, tags: recipe.tags || [], allergens: recipe.allergens || [] });

  const inputStyle = {
    width: '100%', padding: '8px 10px', background: '#1a1a1a',
    border: '1px solid #333', color: '#ddd', fontSize: 13,
    borderRadius: 0, boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: 10, color: '#888', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4, display: 'block' };
  const sectionStyle = { marginBottom: 16, padding: 12, background: '#0d0d0d', border: '1px solid #1a1a1a' };

  const handleSave = async () => {
    try {
      await onUpdate(recipe.id, {
        name: form.name,
        description: form.description,
        category: form.category,
        tags: form.tags,
        allergens: form.allergens,
        ingredients: form.ingredients || '',
        instructions: form.instructions || '',
      });
      setEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const toggleAllergen = (a) => {
    setForm(prev => ({
      ...prev,
      allergens: prev.allergens.includes(a)
        ? prev.allergens.filter(x => x !== a)
        : [...prev.allergens, a],
    }));
  };

  const catColor = CATEGORY_COLORS[recipe.category] || '#666';
  const catLabel = CATEGORIES.find(c => c.value === recipe.category)?.label || recipe.category;

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16, padding: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input style={{ ...inputStyle, fontSize: 16, fontWeight: 700 }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          ) : (
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ddd' }}>{recipe.name}</div>
          )}
        </div>
        <span style={{ fontSize: 10, padding: '2px 8px', background: catColor + '22', color: catColor, border: `1px solid ${catColor}` }}>{catLabel}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {editing ? (
          <>
            <button onClick={handleSave} style={{ padding: '6px 14px', background: '#ddd', color: '#111', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}>TALLENNA</button>
            <button onClick={() => { setForm({ ...recipe, tags: recipe.tags || [], allergens: recipe.allergens || [] }); setEditing(false); }} style={{ padding: '6px 14px', background: 'transparent', color: '#666', fontWeight: 700, fontSize: 11, border: '1px solid #333', cursor: 'pointer' }}>PERUUTA</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} style={{ padding: '6px 14px', background: '#333', color: '#ddd', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}>MUOKKAA</button>
            <button onClick={() => { if (window.confirm('Poista resepti?')) onDelete(recipe.id); onBack(); }} style={{ padding: '6px 14px', background: 'transparent', color: '#c0392b', fontWeight: 700, fontSize: 11, border: '1px solid #333', cursor: 'pointer' }}>POISTA</button>
          </>
        )}
      </div>

      {/* Details */}
      <div style={sectionStyle}>
        <label style={labelStyle}>KATEGORIA</label>
        {editing ? (
          <select style={inputStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        ) : (
          <div style={{ color: '#ddd', fontSize: 13 }}>{catLabel}</div>
        )}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>KUVAUS</label>
        {editing ? (
          <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        ) : (
          <div style={{ color: '#ddd', fontSize: 13, whiteSpace: 'pre-wrap' }}>{recipe.description || '—'}</div>
        )}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>ALLERGEENIT</label>
        {editing ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {COMMON_ALLERGENS.map(a => (
              <button key={a} type="button" onClick={() => toggleAllergen(a)} style={{
                padding: '3px 8px', fontSize: 10, border: '1px solid #333',
                background: form.allergens.includes(a) ? '#c0392b' : '#1a1a1a',
                color: form.allergens.includes(a) ? '#fff' : '#888', cursor: 'pointer',
              }}>{a}</button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {recipe.allergens?.length ? recipe.allergens.map(a => (
              <span key={a} style={{ fontSize: 10, padding: '2px 6px', background: '#c0392b22', color: '#e74c3c', border: '1px solid #c0392b44' }}>{a}</span>
            )) : <span style={{ color: '#555', fontSize: 12 }}>Ei allergeeneja merkitty</span>}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>TAGIT</label>
        {editing ? (
          <input style={inputStyle} value={Array.isArray(form.tags) ? form.tags.join(', ') : ''} onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="pilkulla erotettuna" />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {recipe.tags?.length ? recipe.tags.map(t => (
              <span key={t} style={{ fontSize: 10, padding: '2px 6px', background: '#333', color: '#aaa' }}>{t}</span>
            )) : <span style={{ color: '#555', fontSize: 12 }}>—</span>}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>AINESOSAT</label>
        {editing ? (
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.ingredients || ''} onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))} placeholder="Ainesosat" />
        ) : (
          <div style={{ color: '#ddd', fontSize: 13, whiteSpace: 'pre-wrap' }}>{recipe.ingredients || '—'}</div>
        )}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>VALMISTUSOHJE</label>
        {editing ? (
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.instructions || ''} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} placeholder="Valmistusohje" />
        ) : (
          <div style={{ color: '#ddd', fontSize: 13, whiteSpace: 'pre-wrap' }}>{recipe.instructions || '—'}</div>
        )}
      </div>
    </div>
  );
}
