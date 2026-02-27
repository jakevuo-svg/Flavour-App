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

const CATEGORY_COLORS = {
  alkuruoka: '#27ae60', pääruoka: '#e67e22', jälkiruoka: '#9b59b6',
  salaatti: '#2ecc71', keitto: '#f39c12', välipala: '#1abc9c',
  cocktailpala: '#e74c3c', leipä: '#d4a574', juoma: '#3498db', muu: '#666',
};

const TYPE_COLORS = {
  '3-ruokalajin illallinen': '#e67e22', buffet: '#27ae60', cocktailpalat: '#e74c3c',
  lounas: '#3498db', aamupala: '#f1c40f', snacks: '#1abc9c', muu: '#666',
};

export default function MenuCard({ menu, onUpdate, onDelete, onBack, recipes = [], onAddRecipeToMenu, onRemoveRecipeFromMenu }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: menu.name, description: menu.description, menu_type: menu.menu_type, tags: menu.tags || [] });
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState('');

  const inputStyle = {
    width: '100%', padding: '8px 10px', background: '#1a1a1a',
    border: '1px solid #333', color: '#ddd', fontSize: 13,
    borderRadius: 0, boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: 10, color: '#888', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4, display: 'block' };
  const sectionStyle = { marginBottom: 16, padding: 12, background: '#0d0d0d', border: '1px solid #1a1a1a' };

  const typeColor = TYPE_COLORS[menu.menu_type] || '#666';
  const menuRecipes = menu.menu_recipes || [];

  // Recipes already in menu
  const recipeIds = new Set(menuRecipes.map(mr => mr.recipe_id));

  // Available recipes to add (not already in menu)
  const availableRecipes = recipes.filter(r => !recipeIds.has(r.id));
  const filteredAvailable = recipeSearch
    ? availableRecipes.filter(r => r.name.toLowerCase().includes(recipeSearch.toLowerCase()) || r.category?.toLowerCase().includes(recipeSearch.toLowerCase()))
    : availableRecipes;

  const handleSave = async () => {
    try {
      await onUpdate(menu.id, {
        name: form.name,
        description: form.description,
        menu_type: form.menu_type,
        tags: form.tags,
      });
      setEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleAddRecipe = async (recipeId) => {
    try {
      await onAddRecipeToMenu(menu.id, recipeId, menuRecipes.length);
      setShowAddRecipe(false);
      setRecipeSearch('');
    } catch (err) {
      console.error('Add recipe failed:', err);
    }
  };

  const handleRemoveRecipe = async (recipeId) => {
    if (!window.confirm('Poista resepti menusta?')) return;
    try {
      await onRemoveRecipeFromMenu(menu.id, recipeId);
    } catch (err) {
      console.error('Remove recipe failed:', err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16, padding: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input style={{ ...inputStyle, fontSize: 16, fontWeight: 700 }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          ) : (
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ddd' }}>{menu.name}</div>
          )}
        </div>
        <span style={{ fontSize: 10, padding: '2px 8px', background: typeColor + '22', color: typeColor, border: `1px solid ${typeColor}` }}>
          {MENU_TYPES.find(t => t.value === menu.menu_type)?.label || menu.menu_type}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {editing ? (
          <>
            <button onClick={handleSave} style={{ padding: '6px 14px', background: '#ddd', color: '#111', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}>TALLENNA</button>
            <button onClick={() => { setForm({ name: menu.name, description: menu.description, menu_type: menu.menu_type, tags: menu.tags || [] }); setEditing(false); }} style={{ padding: '6px 14px', background: 'transparent', color: '#666', fontWeight: 700, fontSize: 11, border: '1px solid #333', cursor: 'pointer' }}>PERUUTA</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} style={{ padding: '6px 14px', background: '#333', color: '#ddd', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}>MUOKKAA</button>
            <button onClick={() => { if (window.confirm('Poista menu?')) { onDelete(menu.id); onBack(); } }} style={{ padding: '6px 14px', background: 'transparent', color: '#c0392b', fontWeight: 700, fontSize: 11, border: '1px solid #333', cursor: 'pointer' }}>POISTA</button>
          </>
        )}
      </div>

      {/* Description */}
      <div style={sectionStyle}>
        <label style={labelStyle}>KUVAUS</label>
        {editing ? (
          <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        ) : (
          <div style={{ color: '#ddd', fontSize: 13, whiteSpace: 'pre-wrap' }}>{menu.description || '—'}</div>
        )}
      </div>

      {/* Type */}
      {editing && (
        <div style={sectionStyle}>
          <label style={labelStyle}>TYYPPI</label>
          <select style={inputStyle} value={form.menu_type} onChange={e => setForm(p => ({ ...p, menu_type: e.target.value }))}>
            {MENU_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      )}

      {/* Tags */}
      <div style={sectionStyle}>
        <label style={labelStyle}>TAGIT</label>
        {editing ? (
          <input style={inputStyle} value={Array.isArray(form.tags) ? form.tags.join(', ') : ''} onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {menu.tags?.length ? menu.tags.map(t => (
              <span key={t} style={{ fontSize: 10, padding: '2px 6px', background: '#333', color: '#aaa' }}>{t}</span>
            )) : <span style={{ color: '#555', fontSize: 12 }}>—</span>}
          </div>
        )}
      </div>

      {/* Recipes in this menu */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>ANNOKSET ({menuRecipes.length})</label>
          <button onClick={() => setShowAddRecipe(!showAddRecipe)} style={{
            padding: '4px 10px', fontSize: 10, fontWeight: 700, border: '1px solid #333',
            background: showAddRecipe ? '#333' : 'transparent', color: showAddRecipe ? '#ddd' : '#888', cursor: 'pointer',
          }}>
            {showAddRecipe ? 'SULJE' : '+ LISÄÄ ANNOS'}
          </button>
        </div>

        {/* Add recipe picker */}
        {showAddRecipe && (
          <div style={{ marginBottom: 12, padding: 8, border: '1px solid #333', background: '#111' }}>
            <input
              style={{ ...inputStyle, marginBottom: 8 }}
              value={recipeSearch}
              onChange={e => setRecipeSearch(e.target.value)}
              placeholder="Hae reseptiä nimellä..."
              autoFocus
            />
            <div style={{ maxHeight: 200, overflow: 'auto' }}>
              {filteredAvailable.length === 0 ? (
                <div style={{ padding: 8, color: '#666', fontSize: 11, textAlign: 'center' }}>
                  {availableRecipes.length === 0 ? 'Kaikki reseptit jo menussa' : 'Ei tuloksia'}
                </div>
              ) : (
                filteredAvailable.slice(0, 20).map(r => {
                  const cc = CATEGORY_COLORS[r.category] || '#666';
                  return (
                    <div key={r.id} onClick={() => handleAddRecipe(r.id)} style={{
                      padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      borderBottom: '1px solid #1a1a1a',
                    }}>
                      <span style={{ fontSize: 12, color: '#ddd', flex: 1 }}>{r.name}</span>
                      <span style={{ fontSize: 9, padding: '1px 4px', background: cc + '22', color: cc }}>{r.category}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Existing recipes */}
        {menuRecipes.length === 0 ? (
          <div style={{ color: '#555', fontSize: 12, textAlign: 'center', padding: 12 }}>Ei annoksia vielä</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {menuRecipes
              .sort((a, b) => (a.course_order || 0) - (b.course_order || 0))
              .map((mr, idx) => {
                const r = mr.recipes || {};
                const cc = CATEGORY_COLORS[r.category] || '#666';
                return (
                  <div key={mr.id} style={{
                    padding: '8px 10px', background: '#111', border: '1px solid #1a1a1a',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 11, color: '#555', width: 20, textAlign: 'center' }}>{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#ddd' }}>{r.name || 'Tuntematon'}</div>
                      {r.description && <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{r.description}</div>}
                    </div>
                    <span style={{ fontSize: 9, padding: '1px 4px', background: cc + '22', color: cc }}>{r.category}</span>
                    <button onClick={() => handleRemoveRecipe(mr.recipe_id)} style={{
                      background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 14, padding: '0 4px',
                    }}>×</button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
