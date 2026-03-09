import React, { useState } from 'react';
import RecipeList from './RecipeList';
import MenuList from './MenuList';

export default function MenusView({ recipes, menus, onRecipeClick, onMenuClick, searchQuery, onNewRecipe, onNewMenu }) {
  const [tab, setTab] = useState('menus'); // 'menus' | 'recipes'

  const tabStyle = (active) => ({
    padding: '8px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1,
    border: 'none', borderBottom: active ? '2px solid var(--c-border)' : '2px solid transparent',
    background: 'transparent', color: active ? 'var(--c-text)' : 'var(--c-text-muted)', cursor: 'pointer',
  });

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--c-border-row)', marginBottom: 8 }}>
        <button style={tabStyle(tab === 'menus')} onClick={() => setTab('menus')}>MENUT</button>
        <button style={tabStyle(tab === 'recipes')} onClick={() => setTab('recipes')}>RESEPTIT</button>
        <div style={{ flex: 1 }} />
        {tab === 'menus' ? (
          <button onClick={onNewMenu} style={{
            padding: '6px 12px', fontSize: 10, fontWeight: 700, background: 'var(--c-accent-bg)', color: 'var(--c-text-inverse)',
            border: 'none', cursor: 'pointer', letterSpacing: 0.5, marginRight: 8, marginBottom: 4,
          }}>+ MENU</button>
        ) : (
          <button onClick={onNewRecipe} style={{
            padding: '6px 12px', fontSize: 10, fontWeight: 700, background: 'var(--c-accent-bg)', color: 'var(--c-text-inverse)',
            border: 'none', cursor: 'pointer', letterSpacing: 0.5, marginRight: 8, marginBottom: 4,
          }}>+ RESEPTI</button>
        )}
      </div>

      {tab === 'menus' ? (
        <MenuList menus={menus} onMenuClick={onMenuClick} searchQuery={searchQuery} />
      ) : (
        <RecipeList recipes={recipes} onRecipeClick={onRecipeClick} searchQuery={searchQuery} />
      )}
    </div>
  );
}
