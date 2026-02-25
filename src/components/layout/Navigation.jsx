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
    ? ['PERSON', 'DATE', 'EVENTS', 'LOCATIONS', 'NOTES', 'ARCHIVE', 'ADMIN']
    : ['DATE', 'EVENTS', 'NOTES', 'ARCHIVE']);

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
      {/* Full-width tab bar — scrollable on mobile */}
      <div style={{ display: 'flex', borderBottom: "2px solid #ddd", overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tabs.map(tab => (
          <div
            key={tab}
            style={{
              flex: '1 0 auto',
              textAlign: "center",
              padding: "10px 8px",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 0.5,
              cursor: "pointer",
              background: activeTab === tab ? "#ddd" : "#1e1e1e",
              color: activeTab === tab ? "#111" : "#ddd",
              borderRight: "1px solid #ddd",
              whiteSpace: 'nowrap',
              minWidth: 0,
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
