import S from '../../styles/theme';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Navigation({
  activeTab,
  onTabChange,
  searchQuery = '',
  onSearch,
  onGo,
  allowedTabs,
}) {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  // Use dynamic permissions if provided, otherwise fallback to role-based defaults
  const tabs = allowedTabs || (isAdmin
    ? ['PERSON', 'DATE', 'EVENTS', 'LOCATIONS', 'NOTES', 'ADMIN']
    : ['DATE', 'EVENTS', 'NOTES']);

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
      {/* Full-width tab bar */}
      <div style={{ ...S.flex, borderBottom: "2px solid #ddd" }}>
        {tabs.map(tab => (
          <div
            key={tab}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 0",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1,
              cursor: "pointer",
              background: activeTab === tab ? "#ddd" : "#1e1e1e",
              color: activeTab === tab ? "#111" : "#ddd",
              borderRight: "1px solid #ddd",
            }}
            onClick={() => onTabChange(tab)}
          >
            {t('tab_' + tab)}
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ ...S.flex, ...S.pad, ...S.gap }}>
        <span style={{ fontWeight: 700, fontSize: 12 }}>{t('searchLabel')}</span>
        <input
          style={{ ...S.input, flex: 1 }}
          placeholder={t('search')}
          value={searchQuery}
          onChange={e => onSearch?.(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onGo?.()}
        />
        <button style={S.btnBlack} onClick={onGo}>{t('go')}</button>
      </div>
    </div>
  );
}
