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

const initialForm = {
  name: '', description: '', category: 'muu',
  tags: '', allergens: [],
  ingredients: '', instructions: '',
};

export default function NewRecipeModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ ...initialForm });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      allergens: form.allergens,
      ingredients: form.ingredients.trim(),
      instructions: form.instructions.trim(),
    });
    setForm({ ...initialForm });
  };

  const toggleAllergen = (a) => {
    setForm(prev => ({
      ...prev,
      allergens: prev.allergens.includes(a)
        ? prev.allergens.filter(x => x !== a)
        : [...prev.allergens, a],
    }));
  };

  const inputStyle = {
    width: '100%', padding: '8px 10px', background: '#1a1a1a',
    border: '1px solid #333', color: '#ddd', fontSize: 13,
    borderRadius: 0, boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: 10, color: '#888', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid #333', padding: 24, width: '90%', maxWidth: 500, maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#ddd', marginBottom: 20, letterSpacing: 1 }}>UUSI RESEPTI</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>NIMI *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Annoksen nimi" autoFocus />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>KATEGORIA</label>
            <select style={inputStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>KUVAUS</label>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Lyhyt kuvaus annoksesta" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>ALLERGEENIT</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {COMMON_ALLERGENS.map(a => (
                <button key={a} type="button" onClick={() => toggleAllergen(a)} style={{
                  padding: '3px 8px', fontSize: 10, border: '1px solid #333',
                  background: form.allergens.includes(a) ? '#c0392b' : '#1a1a1a',
                  color: form.allergens.includes(a) ? '#fff' : '#888', cursor: 'pointer',
                }}>{a}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>TAGIT (pilkulla erotettuna)</label>
            <input style={inputStyle} value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="esim. kasvis, kevyt, juhla" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>AINESOSAT (vapaaehtoinen)</label>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.ingredients} onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))} placeholder="Ainesosat, yksi per rivi" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>VALMISTUSOHJE (vapaaehtoinen)</label>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} placeholder="Valmistusohjeet" />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#ddd', color: '#111', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', letterSpacing: 1 }}>LISÄÄ RESEPTI</button>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', color: '#666', fontWeight: 700, fontSize: 12, border: '1px solid #333', cursor: 'pointer' }}>PERUUTA</button>
          </div>
        </form>
      </div>
    </div>
  );
}
