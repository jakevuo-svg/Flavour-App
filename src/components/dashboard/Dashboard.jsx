import { useState, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import S from '../../styles/theme';

const FILTERS = [
  { key: 'ALL', label: 'KAIKKI' },
  { key: 'EVENT', label: 'TAPAHTUMAT' },
  { key: 'TASK', label: 'TEHTÄVÄT' },
  { key: 'NOTE', label: 'MUISTIINPANOT' },
  { key: 'PERSON', label: 'HENKILÖT' },
];

const Dashboard = ({ events = [], persons = [], notes = [], recentActivity = [], tasks = [], onEventClick, onPersonClick, onNoteClick, onTaskStatusChange }) => {
  const { user } = useAuth();
  const [recentFilter, setRecentFilter] = useState('ALL');
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (name) => setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));

  const isWorker = user?.role === 'worker' || user?.role === 'temporary';

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.date) >= now)
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
          <div style={{ ...S.flexBetween, padding: "4px 0", borderBottom: "1px solid #444", marginBottom: 4 }}>
            <span style={{ ...S.label, flex: 1 }}>TYYPPI</span>
            <span style={{ ...S.label, flex: 2 }}>INFO</span>
            <span style={{ ...S.label, flex: 1, textAlign: "right" }}>AIKA</span>
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
                  style={{ ...S.flexBetween, padding: "6px 0", borderBottom: "1px solid #333", fontSize: 12, cursor: isClickable ? 'pointer' : 'default' }}
                  onClick={handleClick}
                >
                  <span style={{ flex: 1, color: "#999", fontSize: 11, textTransform: "uppercase" }}>{a.action?.replace(/_/g, ' ') || 'UPDATE'}</span>
                  <span style={{ flex: 2 }}>{a.action_description}</span>
                  <span style={{ flex: 1, textAlign: "right", color: "#999", fontSize: 11 }}>
                    {new Date(a.timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Stats row */}
      {!isWorker && (
        <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
          <div style={{ ...S.flex }}>
            <div style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRight: "1px solid #444" }}>
              <div style={S.label}>TAPAHTUMIA</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{events.length}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRight: "1px solid #444" }}>
              <div style={S.label}>HENKILÖITÄ</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{persons.length}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRight: "1px solid #444" }}>
              <div style={S.label}>MUISTIINPANOJA</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{notes.length}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px 0" }}>
              <div style={S.label}>TULEVIA</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{upcomingEvents.length}</div>
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
