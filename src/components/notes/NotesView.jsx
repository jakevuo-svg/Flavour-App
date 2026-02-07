import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import S from '../../styles/theme';

const NotesView = ({ notes = [], events = [], persons = [], onAddNote, onDeleteNote }) => {
  const { user } = useAuth();
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    event_id: '',
    person_id: '',
  });

  const isAdmin = user?.role === 'admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      onAddNote?.({
        ...formData,
        author: user?.id || 'anonymous',
        created_at: new Date().toISOString(),
      });
      setFormData({ title: '', content: '', event_id: '', person_id: '' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0)
  );

  const getEventName = (eventId) => events.find(e => e.id === eventId)?.name || '';
  const getPersonName = (personId) => {
    const p = persons.find(p => p.id === personId);
    return p ? `${p.first_name} ${p.last_name}` : '';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fi-FI');
  };

  return (
    <div>
      {/* New note form */}
      <div style={{ ...S.border, ...S.bg, borderTop: "none", padding: 20 }}>
        <div style={{ ...S.label, marginBottom: 12 }}>UUSI MUISTIINPANO</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 6 }}>Otsikko</div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Otsikko..."
              style={{ ...S.input, width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 6 }}>Sisältö</div>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Kirjoita muistiinpano..."
              style={{ ...S.input, width: '100%', minHeight: 100, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ ...S.label, marginBottom: 6 }}>Tapahtuma (valinnainen)</div>
              <select name="event_id" value={formData.event_id} onChange={handleChange} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                <option value="">Valitse tapahtuma...</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ ...S.label, marginBottom: 6 }}>Henkilö (valinnainen)</div>
              <select name="person_id" value={formData.person_id} onChange={handleChange} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                <option value="">Valitse henkilö...</option>
                {persons.map(person => (
                  <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" style={S.btnBlack}>Lisää muistiinpano</button>
        </form>
      </div>

      {/* Notes list */}
      <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
        <div style={{ ...S.pad, borderBottom: "1px solid #444" }}>
          <div style={S.label}>MUISTIINPANOT ({notes.length})</div>
        </div>

        {sortedNotes.length === 0 ? (
          <div style={{ padding: 12, color: '#666', fontSize: 12 }}>Ei muistiinpanoja</div>
        ) : (
          sortedNotes.map(note => (
            <div key={note.id}>
              <div
                onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
                style={{ ...S.row, flexDirection: 'column', alignItems: 'stretch' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{note.title}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#999' }}>
                      <span>{formatDate(note.created_at || note.date)}</span>
                      {note.event_id && <span>Tapahtuma: {getEventName(note.event_id)}</span>}
                      {note.person_id && <span>Henkilö: {getPersonName(note.person_id)}</span>}
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteNote?.(note.id); }}
                      style={{ ...S.btnSmall, marginLeft: 10 }}
                    >
                      Poista
                    </button>
                  )}
                </div>
              </div>

              {expandedNoteId === note.id && (
                <div style={{ padding: '8px 12px 12px 24px', borderBottom: '1px solid #333', background: '#1a1a1a' }}>
                  <p style={{ color: '#999', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: 12, margin: 0 }}>
                    {note.content}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesView;
