import { useState } from 'react';
import S from '../../styles/theme';

const PRIORITY_LABELS = { HIGH: 'Korkea', MEDIUM: 'Normaali', LOW: 'Matala' };
const PRIORITY_COLORS = {
  HIGH: { bg: '#3a2020', color: '#ff9999', border: '#552222' },
  MEDIUM: { bg: '#3a3a20', color: '#ffff99', border: '#555522' },
  LOW: { bg: '#203a20', color: '#99ff99', border: '#225522' },
};
const STATUS_LABELS = { TODO: 'Tekemättä', IN_PROGRESS: 'Käynnissä', DONE: 'Valmis' };

export default function EventTasks({ eventId, tasks = [], onAddTask, onUpdateTask, onDeleteTask }) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, TODO, IN_PROGRESS, DONE

  const eventTasks = tasks.filter(t => t.event_id === eventId);

  const filteredTasks = filter === 'ALL'
    ? eventTasks
    : eventTasks.filter(t => t.status === filter);

  // Sort: TODO first, then IN_PROGRESS, then DONE. Within same status: HIGH > MEDIUM > LOW
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const statusOrder = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };
    const prioOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
    if (statusDiff !== 0) return statusDiff;
    return (prioOrder[a.priority] || 1) - (prioOrder[b.priority] || 1);
  });

  const todoCount = eventTasks.filter(t => t.status === 'TODO').length;
  const inProgressCount = eventTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneCount = eventTasks.filter(t => t.status === 'DONE').length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddTask?.({
      event_id: eventId,
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      due_date: newDueDate || null,
    });
    setNewTitle('');
    setNewDescription('');
    setNewPriority('MEDIUM');
    setNewDueDate('');
    setShowForm(false);
  };

  const cycleStatus = (task) => {
    const next = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' };
    onUpdateTask?.(task.id, { status: next[task.status] || 'TODO' });
  };

  const getCheckboxStyle = (status) => ({
    width: 22,
    height: 22,
    borderRadius: 4,
    border: status === 'DONE' ? '2px solid #666' : '2px solid #ddd',
    background: status === 'DONE' ? '#444' : status === 'IN_PROGRESS' ? '#3a3a20' : 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    color: status === 'DONE' ? '#999' : '#ddd',
    flexShrink: 0,
    transition: 'all 0.15s',
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' });
  };

  const isOverdue = (task) => {
    if (task.status === 'DONE' || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  };

  return (
    <div>
      {/* Header with counts and add button */}
      <div style={{ ...S.flexBetween, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#999' }}>
            {todoCount} tekemättä
          </span>
          {inProgressCount > 0 && (
            <span style={{ fontSize: 12, color: '#ffff99' }}>
              {inProgressCount} käynnissä
            </span>
          )}
          <span style={{ fontSize: 12, color: '#666' }}>
            {doneCount} valmis
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ ...S.btnSmall, fontSize: 12 }}
        >
          {showForm ? '✕ Sulje' : '+ Lisää tehtävä'}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '3px 10px',
              fontSize: 11,
              border: '1px solid ' + (filter === f ? '#ddd' : '#444'),
              background: filter === f ? '#ddd' : 'transparent',
              color: filter === f ? '#111' : '#999',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f === 'ALL' ? `Kaikki (${eventTasks.length})` : `${STATUS_LABELS[f]} (${f === 'TODO' ? todoCount : f === 'IN_PROGRESS' ? inProgressCount : doneCount})`}
          </button>
        ))}
      </div>

      {/* Add task form */}
      {showForm && (
        <div style={{ border: '1px solid #444', padding: 12, marginBottom: 12, borderRadius: 3, background: '#1a1a1a' }}>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Tehtävän nimi..."
            style={{ ...S.inputFull, marginBottom: 8 }}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAdd()}
          />
          <textarea
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="Kuvaus (valinnainen)..."
            style={{ ...S.inputFull, minHeight: 50, fontFamily: 'inherit', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              style={{ ...S.select, flex: 1 }}
            >
              <option value="HIGH">Korkea prioriteetti</option>
              <option value="MEDIUM">Normaali prioriteetti</option>
              <option value="LOW">Matala prioriteetti</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              style={{ ...S.input, flex: 1 }}
              placeholder="Eräpäivä"
            />
            <button onClick={handleAdd} style={S.btnBlack}>Lisää</button>
          </div>
        </div>
      )}

      {/* Task list */}
      {sortedTasks.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', color: '#666', fontSize: 12 }}>
          {filter === 'ALL' ? 'Ei tehtäviä — lisää ensimmäinen!' : 'Ei tehtäviä tällä suodattimella'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sortedTasks.map(task => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '8px 10px',
                borderRadius: 3,
                background: task.status === 'DONE' ? '#1a1a1a' : isOverdue(task) ? '#2a1a1a' : '#1e1e1e',
                border: isOverdue(task) ? '1px solid #552222' : '1px solid #333',
                transition: 'all 0.15s',
              }}
            >
              {/* Status checkbox */}
              <div
                onClick={() => cycleStatus(task)}
                style={getCheckboxStyle(task.status)}
                title={`Klikkaa: ${STATUS_LABELS[task.status]} → ${STATUS_LABELS[{ TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' }[task.status]]}`}
              >
                {task.status === 'DONE' ? '✓' : task.status === 'IN_PROGRESS' ? '◐' : ''}
              </div>

              {/* Task content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                  color: task.status === 'DONE' ? '#666' : '#ddd',
                }}>
                  {task.title}
                </div>
                {task.description && (
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                    {task.description}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  {/* Priority badge */}
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 2,
                    background: PRIORITY_COLORS[task.priority]?.bg || '#2a2a2a',
                    color: PRIORITY_COLORS[task.priority]?.color || '#999',
                    border: `1px solid ${PRIORITY_COLORS[task.priority]?.border || '#444'}`,
                  }}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                  {/* Due date */}
                  {task.due_date && (
                    <span style={{
                      fontSize: 10,
                      color: isOverdue(task) ? '#ff7777' : '#888',
                      fontWeight: isOverdue(task) ? 600 : 400,
                    }}>
                      {isOverdue(task) ? '⚠ ' : ''}{formatDate(task.due_date)}
                    </span>
                  )}
                  {/* Created by */}
                  <span style={{ fontSize: 10, color: '#555' }}>
                    {task.created_by}
                  </span>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => onDeleteTask?.(task.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#555',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: '0 4px',
                  flexShrink: 0,
                }}
                title="Poista tehtävä"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
