import S from '../../styles/theme';
import { PERMISSION_FEATURES, ROLES } from '../../hooks/usePermissions';

const RolePermissions = ({ permissions, onToggle, onReset }) => {
  // Group features by category
  const groups = {};
  PERMISSION_FEATURES.forEach(f => {
    if (!groups[f.group]) groups[f.group] = [];
    groups[f.group].push(f);
  });

  const checkboxStyle = (checked, locked) => ({
    width: 18, height: 18,
    border: locked ? '2px solid #444' : '2px solid #ddd',
    background: checked ? (locked ? '#555' : '#ddd') : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: locked ? 'not-allowed' : 'pointer',
    fontSize: 12, color: checked ? '#111' : 'transparent',
    flexShrink: 0,
  });

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
      <div style={{ ...S.pad, ...S.flexBetween, borderBottom: '1px solid #444' }}>
        <div style={S.label}>KÄYTTÖOIKEUDET</div>
        <button onClick={onReset} style={S.btnSmall}>PALAUTA OLETUKSET</button>
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', padding: '8px 12px', borderBottom: '2px solid #ddd', background: '#2a2a2a' }}>
        <div style={{ flex: 3, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>OMINAISUUS</div>
        {ROLES.map(r => (
          <div key={r.key} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            {r.label}
          </div>
        ))}
      </div>

      {Object.entries(groups).map(([groupName, features]) => (
        <div key={groupName}>
          {/* Group header */}
          <div style={{ padding: '6px 12px', background: '#1a1a1a', borderBottom: '1px solid #444', fontSize: 10, fontWeight: 700, color: '#666', letterSpacing: 1 }}>
            {groupName}
          </div>

          {/* Feature rows */}
          {features.map(feature => (
            <div key={feature.key} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid #333' }}>
              <div style={{ flex: 3, fontSize: 12, color: '#ddd' }}>{feature.label}</div>
              {ROLES.map(role => {
                const checked = !!permissions[role.key]?.[feature.key];
                const locked = role.key === 'admin' && feature.key === 'tab_admin';
                return (
                  <div key={role.key} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div
                      onClick={() => !locked && onToggle(role.key, feature.key)}
                      style={checkboxStyle(checked, locked)}
                      title={locked ? 'Lukittu — admin tarvitsee aina hallintapaneelin' : ''}
                    >
                      {checked ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      {/* Legend */}
      <div style={{ ...S.pad, borderTop: '1px solid #444', display: 'flex', gap: 16, fontSize: 10, color: '#666' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, border: '2px solid #ddd', background: '#ddd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#111' }}>✓</span>
          Sallittu
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, border: '2px solid #ddd', background: 'transparent', display: 'inline-block' }}></span>
          Estetty
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, border: '2px solid #444', background: '#555', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#111' }}>✓</span>
          Lukittu
        </span>
      </div>
    </div>
  );
};

export default RolePermissions;
