import S from '../../styles/theme';
import { useAuth } from '../auth/AuthContext';

export default function Navigation({
  activeTab,
  onTabChange,
  searchQuery = '',
  onSearch,
  onGo,
  allowedTabs,
}) {
  const { isAdmin } = useAuth();

  // Use dynamic permissions if provided, otherwise fallback to role-based defaults
  const tabs = allowedTabs || (isAdmin
    ? ['PERSON', 'DATE', 'EVENTS', 'LOCATIONS', 'NOTES', 'ADMIN']
    : ['DATE', 'EVENTS', 'NOTES']);

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
      {/* Full-width tab bar */}
      <div style={{ ...S.flex, borderBottom: "2px solid #ddd" }}>
        {tabs.map(t => (
          <div
            key={t}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 0",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1,
              cursor: "pointer",
              background: activeTab === t ? "#ddd" : "#1e1e1e",
              color: activeTab === t ? "#111" : "#ddd",
              borderRight: "1px solid #ddd",
            }}
            onClick={() => onTabChange(t)}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ ...S.flex, ...S.pad, ...S.gap }}>
        <span style={{ fontWeight: 700, fontSize: 12 }}>SEARCH</span>
        <input
          style={{ ...S.input, flex: 1 }}
          placeholder="Search..."
          value={searchQuery}
          onChange={e => onSearch?.(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onGo?.()}
        />
        <button style={S.btnBlack} onClick={onGo}>GO</button>
      </div>
    </div>
  );
}
