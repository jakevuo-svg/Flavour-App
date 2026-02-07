import { useState, useRef, useEffect } from 'react';
import S from '../../styles/theme';
import NotificationPanel from '../common/NotificationPanel';

export default function Header({
  onHome, onSave, onNewEvent, onNewPerson, onNewNote,
  notifications = [], unreadCount = 0,
  onMarkRead, onMarkAllRead, onDismiss, onClearAll,
  onEventClick, onPersonClick, events = [], persons = [],
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Close menu/notif on outside click
  useEffect(() => {
    if (!menuOpen && !notifOpen) return;
    const handleClick = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, notifOpen]);

  const handleOption = (fn) => {
    setMenuOpen(false);
    fn?.();
  };

  return (
    <div style={{ ...S.border, ...S.bg, ...S.flexBetween, ...S.pad, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ ...S.flex, ...S.gap }}>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer" }} onClick={onHome}>Typedwn</span>
        <button style={S.btnWire} onClick={onHome}>HOME</button>
      </div>
      <div style={{ ...S.flex, ...S.gap }}>
        {onSave && <button style={S.btnWire} onClick={onSave}>SAVE</button>}

        {/* Notification bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            style={{ ...S.btnWire, padding: '4px 12px', fontSize: 14, position: 'relative' }}
            onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
          >
            ◎
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#ddd', color: '#111',
                fontSize: 9, fontWeight: 800,
                width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationPanel
              notifications={notifications}
              onMarkRead={onMarkRead}
              onMarkAllRead={onMarkAllRead}
              onDismiss={onDismiss}
              onClearAll={onClearAll}
              onClose={() => setNotifOpen(false)}
              onEventClick={onEventClick}
              onPersonClick={onPersonClick}
              events={events}
              persons={persons}
            />
          )}
        </div>

        {/* + menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          style={{ ...S.btnBlack, fontSize: 18, padding: "4px 14px" }}
          onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}
        >+</button>

        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: '#1a1a1a',
            border: '2px solid #ddd',
            zIndex: 200,
            minWidth: 180,
          }}>
            <div
              onClick={() => handleOption(onNewEvent)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                borderBottom: '1px solid #444',
                color: '#ddd',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#333'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              + TAPAHTUMA
            </div>
            <div
              onClick={() => handleOption(onNewPerson)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                borderBottom: '1px solid #444',
                color: '#ddd',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#333'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              + HENKILÖ
            </div>
            <div
              onClick={() => handleOption(onNewNote)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: '#ddd',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#333'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              + MUISTIINPANO
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
