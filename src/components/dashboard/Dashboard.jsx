import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import S from '../../styles/theme';

// Priority label + color for "my tasks" section
const PRIO_STYLE = {
  KORKEA: { bg: '#4a1c1c', border: '#ff4444', color: '#ff6666' },
  NORMAALI: { bg: '#1a1a1a', border: '#555', color: '#ddd' },
  MATALA: { bg: '#1a1a1a', border: '#333', color: '#888' },
};

const FILTERS = [
  { key: 'ALL', label: 'KAIKKI' },
  { key: 'EVENT', label: 'TAPAHTUMAT' },
  { key: 'TASK', label: 'TEHTÄVÄT' },
  { key: 'NOTE', label: 'MUISTIINPANOT' },
  { key: 'PERSON', label: 'HENKILÖT' },
];

const Dashboard = ({ events = [], persons = [], notes = [], recentActivity = [], tasks = [], onEventClick, onPersonClick, onNoteClick, onTaskStatusChange }) => {
  const { user, profile } = useAuth();
  const [recentFilter, setRecentFilter] = useState('ALL');
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (name) => setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));

  const isWorker = user?.role === 'worker' || user?.role === 'temporary';

  // Tasks assigned to the current user (show for ALL roles)
  const myTasks = useMemo(() => {
    if (!profile?.id) return [];
    return tasks
      .filter(t => t.assigned_to === profile.id && t.status !== 'DONE')
      .map(t => ({
        ...t,
        eventName: events.find(e => e.id === t.event_id)?.name || '',
        event: events.find(e => e.id === t.event_id),
      }))
      .sort((a, b) => {
        const prio = { KORKEA: 0, NORMAALI: 1, MATALA: 2 };
        const prioDiff = (prio[a.priority] || 1) - (prio[b.priority] || 1);
        if (prioDiff !== 0) return prioDiff;
        if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
        return 0;
      });
  }, [tasks, events, profile?.id]);

  const todaysEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return events
      .filter(e => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        return d >= today && d < tomorrow;
      })
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return events
      .filter(e => new Date(e.date) >= tomorrow)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [events]);

  const recentlyModified = useMemo(() => {
    return [...events]
      .filter(e => e.modified_at)
      .sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at))
      .slice(0, 5);
  }, [events]);

  // Filter recent activity
  const getActionCategory = (action) => {
    if (!action) return 'ALL';
    if (action.includes('TASK')) return 'TASK';
    if (action.includes('EVENT')) return 'EVENT';
    if (action.includes('PERSON')) return 'PERSON';
    if (action.includes('NOTE')) return 'NOTE';
    return 'ALL';
  };

  const filteredActivity = recentActivity.filter(a =>
    recentFilter === 'ALL' || getActionCategory(a.action) === recentFilter
  );

  // Open tasks grouped by event
  const openTasks = useMemo(() =>
    tasks
      .filter(t => t.status !== 'DONE')
      .sort((a, b) => {
        const prio = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const prioDiff = (prio[a.priority] || 1) - (prio[b.priority] || 1);
        if (prioDiff !== 0) return prioDiff;
        if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
        return 0;
      }),
    [tasks]
  );

  // Group tasks by event
  const tasksByEvent = useMemo(() => {
    const grouped = {};
    openTasks.forEach(task => {
      const eventName = events.find(e => e.id === task.event_id)?.name || 'Muut';
      if (!grouped[eventName]) grouped[eventName] = { tasks: [], event: events.find(e => e.id === task.event_id) };
      grouped[eventName].tasks.push(task);
    });
    return grouped;
  }, [openTasks, events]);

  const overdueTasks = useMemo(() =>
    tasks.filter(t => t.status !== 'DONE' && t.due_date && new Date(t.due_date) < new Date()),
    [tasks]
  );

  return (
    <div>
      {/* Recent Activity / Category filters */}
      <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
        <div style={{ ...S.pad, borderBottom: "1px solid #444" }}>
          <div style={{ ...S.label, marginBottom: 8 }}>VIIMEAIKAISET:</div>
          <div style={S.flexWrap}>
            {FILTERS.map(f => (
              <span
                key={f.key}
                style={{ ...S.tag(recentFilter === f.key), cursor: 'pointer' }}
                onClick={() => setRecentFilter(f.key)}
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>
        <div style={S.pad}>
          <div style={{ display: 'flex', padding: "4px 0", borderBottom: "1px solid #444", marginBottom: 4, gap: 4 }}>
            <span style={{ ...S.label, flex: '0 0 70px' }}>TYYPPI</span>
            <span style={{ ...S.label, flex: '1 1 0', minWidth: 0 }}>INFO</span>
            <span style={{ ...S.label, flex: '0 0 40px', textAlign: "right" }}>AIKA</span>
          </div>
          {filteredActivity.length === 0 ? (
            <div style={{ padding: "8px 0", color: "#666", fontSize: 12 }}>Ei viimeaikaisia aktiviteetteja</div>
          ) : (
            filteredActivity.map(a => {
              const handleClick = () => {
                // Notes → navigate to notes section
                if (a.action === 'ADDED_NOTE') {
                  onNoteClick?.(a);
                  return;
                }
                if (a.entity_type === 'event' && a.entity_id) {
                  const event = events.find(e => e.id === a.entity_id);
                  if (event) onEventClick?.(event);
                } else if (a.entity_type === 'person' && a.entity_id) {
                  const person = persons.find(p => p.id === a.entity_id);
                  if (person) onPersonClick?.(person);
                }
              };
              const isClickable = (a.action === 'ADDED_NOTE') || (a.entity_type && a.entity_id);
              return (
                <div
                  key={a.id}
                  style={{ display: 'flex', padding: "6px 0", borderBottom: "1px solid #333", fontSize: 12, cursor: isClickable ? 'pointer' : 'default', gap: 4, alignItems: 'center' }}
                  onClick={handleClick}
                >
                  <span style={{ flex: '0 0 70px', color: "#999", fontSize: 10, textTransform: "uppercase", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.action?.replace(/_/g, ' ') || 'UPDATE'}</span>
                  <span style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.action_description}</span>
                  <span style={{ flex: '0 0 40px', textAlign: "right", color: "#999", fontSize: 11 }}>
                    {new Date(a.timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MY TASKS — prominent reminder for assigned tasks */}
      {myTasks.length > 0 && (
        <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
          <div style={{ ...S.pad, borderBottom: "1px solid #444", background: '#1a1a1a' }}>
            <div style={{ ...S.flexBetween }}>
              <div style={{ ...S.label, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>!</span>
                SINULLE MÄÄRÄTYT TEHTÄVÄT ({myTasks.length})
              </div>
            </div>
          </div>
          {myTasks.map(task => {
            const pStyle = PRIO_STYLE[task.priority] || PRIO_STYLE.NORMAALI;
            const isOverdue = task.due_date && new Date(task.due_date) < new Date();
            return (
              <div
                key={task.id}
                style={{
                  padding: '10px 12px', borderBottom: '1px solid #333',
                  background: isOverdue ? '#2a1a1a' : pStyle.bg,
                  cursor: task.event ? 'pointer' : 'default',
                }}
                onClick={() => task.event && onEventClick?.(task.event)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <div
                        onClick={(e) => { e.stopPropagation(); onTaskStatusChange?.(task.id, { status: task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE' }); }}
                        style={{
                          width: 18, height: 18,
                          border: `2px solid ${pStyle.border}`,
                          background: task.status === 'IN_PROGRESS' ? '#333' : 'transparent',
                          cursor: 'pointer', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, color: '#ddd',
                        }}
                      >
                        {task.status === 'IN_PROGRESS' ? '◐' : ''}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: pStyle.color }}>{task.title}</span>
                    </div>
                    {task.description && (
                      <div style={{ fontSize: 11, color: '#888', marginLeft: 26, marginBottom: 2 }}>{task.description}</div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginLeft: 26, flexWrap: 'wrap', alignItems: 'center' }}>
                      {task.eventName && (
                        <span style={{ fontSize: 10, color: '#666', textTransform: 'uppercase' }}>{task.eventName}</span>
                      )}
                      <span style={{ fontSize: 10, padding: '1px 6px', border: `1px solid ${pStyle.border}`, color: pStyle.color }}>{task.priority}</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', border: '1px solid #555', color: '#999' }}>{task.status === 'IN_PROGRESS' ? 'KESKEN' : 'TODO'}</span>
                    </div>
                  </div>
                  {task.due_date && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: isOverdue ? '#ff6666' : '#888', fontWeight: isOverdue ? 700 : 400 }}>
                        {isOverdue ? 'MYÖHÄSSÄ' : 'DL'}
                      </div>
                      <div style={{ fontSize: 12, color: isOverdue ? '#ff6666' : '#999' }}>
                        {new Date(task.due_date).toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats row */}
      {!isWorker && (
        <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 80px', textAlign: "center", padding: "12px 4px", borderRight: "1px solid #444", borderBottom: "1px solid #444" }}>
              <div style={{ ...S.label, fontSize: 9 }}>TAPAHTUMIA</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{events.length}</div>
            </div>
            <div style={{ flex: '1 1 80px', textAlign: "center", padding: "12px 4px", borderRight: "1px solid #444", borderBottom: "1px solid #444" }}>
              <div style={{ ...S.label, fontSize: 9 }}>HENKILÖITÄ</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{persons.length}</div>
            </div>
            <div style={{ flex: '1 1 80px', textAlign: "center", padding: "12px 4px", borderRight: "1px solid #444", borderBottom: "1px solid #444" }}>
              <div style={{ ...S.label, fontSize: 9 }}>MUISTIINPANOJA</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{notes.length}</div>
            </div>
            <div style={{ flex: '1 1 80px', textAlign: "center", padding: "12px 4px", borderBottom: "1px solid #444" }}>
              <div style={{ ...S.label, fontSize: 9 }}>TULEVIA</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{upcomingEvents.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recently Modified Events */}
      {recentlyModified.length > 0 && (
        <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
          <div style={{ ...S.pad, borderBottom: "1px solid #444" }}>
            <div style={S.label}>VIIMEKSI MUOKATUT</div>
          </div>
          {recentlyModified.map(event => (
            <div
              key={event.id}
              style={{ ...S.row, cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch', gap: 2 }}
              onClick={() => onEventClick?.(event)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, flex: 2 }}>{event.name}</span>
                <span style={{ flex: 1, fontSize: 11, color: '#999' }}>{event.status || ''}</span>
                <span style={{ fontSize: 10, color: '#666', textAlign: 'right' }}>
                  {new Date(event.modified_at).toLocaleDateString('fi-FI')}{' '}
                  {new Date(event.modified_at).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {event.last_change && (
                <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.last_change}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Open Tasks — grouped by event */}
      {openTasks.length > 0 && (
        <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
          <div style={{ ...S.pad, borderBottom: "1px solid #444" }}>
            <div style={{ ...S.flexBetween }}>
              <div style={S.label}>AVOIMET TEHTÄVÄT ({openTasks.length})</div>
              {overdueTasks.length > 0 && (
                <span style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>! {overdueTasks.length} MYÖHÄSSÄ</span>
              )}
            </div>
          </div>
          {Object.entries(tasksByEvent).map(([eventName, { tasks: eventTasks, event }]) => {
            const isOpen = !!expandedGroups[eventName];
            return (
              <div key={eventName}>
                {/* Collapsible event header */}
                <div
                  style={{ ...S.flexBetween, padding: '8px 12px', borderBottom: '1px solid #333', background: '#1a1a1a', cursor: 'pointer' }}
                  onClick={() => toggleGroup(eventName)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#666' }}>{isOpen ? '▼' : '▶'}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#ddd' }}>{eventName}</span>
                    <span style={{ fontSize: 10, color: '#666' }}>({eventTasks.length})</span>
                  </div>
                  {event && (
                    <span
                      style={{ fontSize: 10, color: '#666', textTransform: 'uppercase' }}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                    >
                      AVAA →
                    </span>
                  )}
                </div>
                {/* Tasks — visible only when expanded */}
                {isOpen && eventTasks.map(task => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                  return (
                    <div key={task.id} style={S.row}>
                      <div
                        onClick={() => onTaskStatusChange?.(task.id, { status: task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE' })}
                        style={{
                          width: 16, height: 16,
                          border: '2px solid #ddd',
                          background: task.status === 'IN_PROGRESS' ? '#333' : 'transparent',
                          cursor: 'pointer', flexShrink: 0, marginRight: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, color: '#ddd',
                        }}
                      >
                        {task.status === 'IN_PROGRESS' ? '◐' : ''}
                      </div>
                      <span style={S.col(3)}>{task.title}</span>
                      <span style={{
                        fontSize: 10, padding: "1px 6px",
                        border: '1px solid #ddd',
                        color: '#ddd',
                        background: 'transparent',
                      }}>{task.priority}</span>
                      {task.due_date && (
                        <span style={{ fontSize: 11, color: isOverdue ? '#999' : '#666', marginLeft: 8, width: 50, textAlign: "right" }}>
                          {isOverdue ? '! ' : ''}{new Date(task.due_date).toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Today's events */}
      <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
        <div style={{ ...S.pad, borderBottom: "1px solid #444", background: todaysEvents.length > 0 ? '#1a2a1a' : 'transparent' }}>
          <div style={{ ...S.label, display: 'flex', alignItems: 'center', gap: 8 }}>
            TÄNÄÄN
            <span style={{ fontSize: 10, color: todaysEvents.length > 0 ? '#8fd68f' : '#666', fontWeight: 700 }}>
              {new Date().toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'numeric' }).toUpperCase()}
            </span>
            {todaysEvents.length > 0 && (
              <span style={{ fontSize: 11, color: '#8fd68f', fontWeight: 700 }}>({todaysEvents.length})</span>
            )}
          </div>
        </div>
        {todaysEvents.length === 0 ? (
          <div style={{ padding: "12px", color: "#666", fontSize: 12 }}>Ei tapahtumia tänään</div>
        ) : (
          todaysEvents.map(event => (
            <div
              key={event.id}
              style={{ ...S.row, cursor: 'pointer', background: '#0a1a0a' }}
              onClick={() => onEventClick?.(event)}
            >
              <span style={{ ...S.col(2), fontWeight: 700, color: '#ddd' }}>{event.name}</span>
              <span style={S.col(1)}>{event.start_time || ''}{event.end_time ? ` – ${event.end_time}` : ''}</span>
              <span style={S.col(1)}>{event.location_name || ''}</span>
              <span style={S.col(1)}>{event.guest_count ? `${event.guest_count} hlö` : ''}</span>
              <span style={{ fontSize: 10, padding: '1px 6px', border: '1px solid #555', color: '#999' }}>{event.status || ''}</span>
            </div>
          ))
        )}
      </div>

      {/* Upcoming events table */}
      <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
        <div style={{ ...S.pad, borderBottom: "1px solid #444" }}>
          <div style={S.label}>{isWorker ? 'OMAT TAPAHTUMAT' : 'TULEVAT TAPAHTUMAT'}</div>
        </div>
        <div style={S.rowHeader}>
          <span style={S.col(2)}>NIMI</span>
          <span style={S.col(1)}>PVM</span>
          <span style={S.col(1)}>AIKA</span>
          <span style={S.col(1)}>PAIKKA</span>
          <span style={S.col(1)}>VIERAAT</span>
        </div>
        {upcomingEvents.length === 0 ? (
          <div style={{ padding: "12px", color: "#666", fontSize: 12 }}>Ei tulevia tapahtumia</div>
        ) : (
          upcomingEvents.map(event => (
            <div
              key={event.id}
              style={{ ...S.row, cursor: 'pointer' }}
              onClick={() => onEventClick?.(event)}
            >
              <span style={{ ...S.col(2), fontWeight: 600 }}>{event.name}</span>
              <span style={S.col(1)}>{new Date(event.date).toLocaleDateString('fi-FI')}</span>
              <span style={S.col(1)}>{event.start_time || ''}</span>
              <span style={S.col(1)}>{event.location_name || ''}</span>
              <span style={S.col(1)}>{event.guest_count || ''}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
