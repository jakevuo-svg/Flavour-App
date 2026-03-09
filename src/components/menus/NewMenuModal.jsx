import React, { useState } from 'react';

const MENU_TYPES = [
  { value: '3-ruokalajin illallinen', label: '3-ruokalajin illallinen' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'cocktailpalat', label: 'Cocktailpalat' },
  { value: 'lounas', label: 'Lounas' },
  { value: 'aamupala', label: 'Aamupala' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'muu', label: 'Muu' },
];

const initialForm = { name: '', description: '', menu_type: 'muu', tags: '' };

export default function NewMenuModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ ...initialForm });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      menu_type: form.menu_type,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    setForm({ ...initialForm });
  };

  const inputStyle = {
    width: '100%', padding: '8px 10px', background: 'var(--c-bg)',
    border: '1px solid var(--c-border-row)', color: 'var(--c-text)', fontSize: 13,
    borderRadius: 0, boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border-row)', padding: 24, width: '90%', maxWidth: 420, maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)', marginBottom: 20, letterSpacing: 1 }}>UUSI MENU</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>NIMI *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Menun nimi" autoFocus />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>TYYPPI</label>
            <select style={inputStyle} value={form.menu_type} onChange={e => setForm(p => ({ ...p, menu_type: e.target.value }))}>
              {MENU_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>KUVAUS</label>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Menun kuvaus" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>TAGIT (pilkulla erotettuna)</label>
            <input style={inputStyle} value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="esim. kesä, juhla, kasvis" />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--c-accent-bg)', color: 'var(--c-text-inverse)', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', letterSpacing: 1 }}>LUO MENU</button>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', color: 'var(--c-text-muted)', fontWeight: 700, fontSize: 12, border: '1px solid var(--c-border-row)', cursor: 'pointer' }}>PERUUTA</button>
          </div>
        </form>
      </div>
    </div>
  );
}
