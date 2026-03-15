import { useState } from 'react';
import S from '../../styles/theme';

import { PROFILES } from '../../utils/constants';

export default function PersonCard({ person, onUpdate, onDelete, onBack, events = [], notes = [], onEventClick, onAddNote, onDeleteNote, onUpdateNote }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('NOTES');
  const [formData, setFormData] = useState({ ...person });
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [showAddFeedback, setShowAddFeedback] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ text: '', rating: 5, eventName: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (field, value) => setFormData({ ...formData, [field]: value });

  // Only send DB-safe fields to Supabase (exclude feedback, id, created_at etc.)
  const DB_FIELDS = ['first_name', 'last_name', 'company', 'role', 'email', 'phone', 'website', 'type', 'next_action', 'notes', 'feedback'];
  const getDbData = (data) => {
    const clean = {};
    DB_FIELDS.forEach(f => { if (data[f] !== undefined) clean[f] = data[f]; });
    return clean;
  };

  const handleSave = async () => {
    try {
      await onUpdate?.(person.id, getDbData(formData));
      setIsEditing(false);
    } catch (err) {
      console.error('Person save failed:', err);
      alert('Tallennus epäonnistui: ' + (err.message || 'tuntematon virhe'));
    }
  };
  const handleCancel = () => { setFormData({ ...person }); setIsEditing(false); };

  // Match events by booker or contact name (text fields, not IDs)
  const personFullName = `${person?.first_name || ''} ${person?.last_name || ''}`.trim().toLowerCase();
  const personEvents = events.filter(e => {
    if (!personFullName) return false;
    const booker = (e.booker || '').trim().toLowerCase();
    const contact = (e.contact || '').trim().toLowerCase();
    return booker === personFullName || contact === personFullName;
  });
  const personNotes = notes.filter(n => n.person_id === person?.id);
  const feedbackList = formData.feedback || [];

  // Save field directly (inline, no full edit mode)
  const saveField = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate?.(person.id, getDbData(updated));
  };

  // Add note via global notes system
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    onAddNote?.({ person_id: person.id, event_id: null, content: newNoteText.trim() });
    setNewNoteText('');
    setShowAddNote(false);
  };

  // Add feedback (stored on person object)
  const handleAddFeedback = () => {
    if (!newFeedback.text.trim()) return;
    const fb = {
      id: `fb-${Date.now()}`,
      text: newFeedback.text.trim(),
      rating: newFeedback.rating,
      eventName: newFeedback.eventName || '',
      createdAt: new Date().toISOString(),
    };
    const updated = { ...formData, feedback: [...feedbackList, fb] };
    setFormData(updated);
    onUpdate?.(person.id, getDbData(updated));
    setNewFeedback({ text: '', rating: 5, eventName: '' });
    setShowAddFeedback(false);
  };

  const removeFeedback = (fbId) => {
    const updated = { ...formData, feedback: feedbackList.filter(f => f.id !== fbId) };
    setFormData(updated);
    onUpdate?.(person.id, getDbData(updated));
  };

  // Star rating helper
  const StarRating = ({ value, onChange, readOnly }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readOnly && onChange?.(star)}
          style={{
            cursor: readOnly ? 'default' : 'pointer',
            fontSize: 18,
            color: star <= value ? 'var(--c-text)' : 'var(--c-border-row)',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: "none", padding: 20 }}>
      <button onClick={onBack} style={{ ...S.btnSmall, marginBottom: 12 }}>← TAKAISIN</button>

      <div style={{ ...S.flexBetween, marginBottom: 20 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{formData.first_name} {formData.last_name}</span>
        <div style={{ ...S.flex, ...S.gap }}>
          {!isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} style={S.btnWire}>MUOKKAA</button>
              <button onClick={() => setShowDeleteConfirm(true)} style={S.btnDanger}>POISTA</button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div>
          <div style={S.formGrid}>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 4 }}>Etunimi</div>
              <input value={formData.first_name || ''} onChange={e => handleInputChange('first_name', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 4 }}>Sukunimi</div>
              <input value={formData.last_name || ''} onChange={e => handleInputChange('last_name', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={S.formGrid}>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 4 }}>Yritys</div>
              <input value={formData.company || ''} onChange={e => handleInputChange('company', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 4 }}>Työnimike</div>
              <input value={formData.role || ''} onChange={e => handleInputChange('role', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={S.formGrid}>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 4 }}>Sähköposti</div>
              <input type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 4 }}>Puhelin</div>
              <input value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={S.formGrid}>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 4 }}>Verkkosivusto</div>
              <input value={formData.website || ''} onChange={e => handleInputChange('website', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 4 }}>Profiili</div>
              <select value={formData.type || ''} onChange={e => handleInputChange('type', e.target.value)} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                <option value="">Valitse</option>
                {PROFILES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ ...S.flex, ...S.gap, marginTop: 16 }}>
            <button onClick={handleSave} style={S.btnBlack}>TALLENNA</button>
            <button onClick={handleCancel} style={S.btnWire}>PERUUTA</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={S.formGrid}>
            {[['Etunimi', person?.first_name], ['Sukunimi', person?.last_name], ['Yritys', person?.company], ['Työnimike', person?.role], ['Sähköposti', person?.email], ['Puhelin', person?.phone], ['Verkkosivusto', person?.website], ['Profiili', PROFILES.find(p => p.value === person?.type)?.label || person?.type]].map(([label, val]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={S.label}>{label}</div>
                <div style={{ fontSize: 13 }}>{val || '-'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ ...S.flex, borderBottom: '2px solid var(--c-border)', marginTop: 20, marginBottom: 16 }}>
        {[
          { key: 'NOTES', label: 'MUISTIINPANOT', count: personNotes.length },
          { key: 'TAPAHTUMAT', label: 'TAPAHTUMAT', count: personEvents.length },
          { key: 'FEEDBACK', label: 'PALAUTE', count: feedbackList.length },
        ].map(tab => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 1,
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '2px solid var(--c-border)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--c-text)' : 'var(--c-text-muted)',
            }}
          >
            {tab.label} {tab.count > 0 && <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>({tab.count})</span>}
          </div>
        ))}
      </div>

      {/* NOTES TAB */}
      {activeTab === 'NOTES' && (
        <div>
          {personNotes.length === 0 && !showAddNote && (
            <div style={{ color: 'var(--c-text-muted)', fontSize: 12, marginBottom: 8 }}>Ei muistiinpanoja</div>
          )}
          {personNotes.map(note => (
            <div key={note.id} style={{ border: '1px solid var(--c-border-row)', padding: 10, marginBottom: 6, background: 'var(--c-bg)' }}>
              <div style={{ ...S.flexBetween, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>
                  {note.author && <span style={{ marginRight: 8 }}>{note.author}</span>}
                  {note.created_at && new Date(note.created_at).toLocaleDateString('fi-FI')} {note.created_at && new Date(note.created_at).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                  {note.modified_at && note.modified_at !== note.created_at && <span style={{ marginLeft: 6, color: 'var(--c-text-muted)', fontStyle: 'italic' }}>(muokattu)</span>}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.content); }} style={{ background: 'none', border: 'none', color: 'var(--c-text-muted)', cursor: 'pointer', fontSize: 11 }}>✎</button>
                  <button onClick={() => onDeleteNote?.(note.id)} style={{ background: 'none', border: 'none', color: 'var(--c-text-muted)', cursor: 'pointer', fontSize: 11 }}>✕</button>
                </div>
              </div>
              {note.title && <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{note.title}</div>}
              {editingNoteId === note.id ? (
                <div>
                  <textarea
                    value={editingNoteText}
                    onChange={e => setEditingNoteText(e.target.value)}
                    style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 8 }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { onUpdateNote?.(note.id, { content: editingNoteText }); setEditingNoteId(null); setEditingNoteText(''); }} style={S.btnBlack}>TALLENNA</button>
                    <button onClick={() => { setEditingNoteId(null); setEditingNoteText(''); }} style={S.btnWire}>PERUUTA</button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--c-text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{note.content}</div>
              )}
            </div>
          ))}

          {showAddNote ? (
            <div style={{ border: '1px solid var(--c-border-soft)', padding: 12, marginTop: 8, background: 'var(--c-bg)' }}>
              <textarea
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Kirjoita muistiinpano..."
                style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 8 }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAddNote} style={S.btnBlack}>LISÄÄ</button>
                <button onClick={() => { setShowAddNote(false); setNewNoteText(''); }} style={S.btnWire}>PERUUTA</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddNote(true)} style={{ ...S.btnSmall, marginTop: 8 }}>+ LISÄÄ MUISTIINPANO</button>
          )}
        </div>
      )}

      {/* EVENTS TAB */}
      {activeTab === 'TAPAHTUMAT' && (
        <div>
          {personEvents.length === 0 ? (
            <div style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>Ei tapahtumia</div>
          ) : (
            <>
              <div style={S.rowHeader}>
                <span style={S.col(2)}>NIMI</span>
                <span style={S.col(1)}>PVM</span>
                <span style={S.col(1)}>TYYPPI</span>
                <span style={S.col(1)}>STATUS</span>
              </div>
              {personEvents.map(event => (
                <div key={event.id} onClick={() => onEventClick?.(event)} style={{ ...S.row, cursor: 'pointer' }}>
                  <span style={{ ...S.col(2), fontWeight: 600 }}>{event.name}</span>
                  <span style={{ ...S.col(1), color: 'var(--c-text-muted)', fontSize: 12 }}>{event.date ? new Date(event.date).toLocaleDateString('fi-FI') : ''}</span>
                  <span style={{ ...S.col(1), fontSize: 11 }}>{event.type || ''}</span>
                  <span style={S.col(1)}>
                    <span style={{ ...S.tag(false), fontSize: 9, padding: '1px 6px' }}>{event.status || ''}</span>
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === 'FEEDBACK' && (
        <div>
          {feedbackList.length === 0 && !showAddFeedback && (
            <div style={{ color: 'var(--c-text-muted)', fontSize: 12, marginBottom: 8 }}>Ei palautetta</div>
          )}

          {feedbackList.map(fb => (
            <div key={fb.id} style={{ border: '1px solid var(--c-border-row)', padding: 12, marginBottom: 6, background: 'var(--c-bg)' }}>
              <div style={{ ...S.flexBetween, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StarRating value={fb.rating} readOnly />
                  {fb.eventName && <span style={{ fontSize: 11, color: 'var(--c-text-muted)', textTransform: 'uppercase' }}>{fb.eventName}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>
                    {new Date(fb.createdAt).toLocaleDateString('fi-FI')}
                  </span>
                  <button onClick={() => removeFeedback(fb.id)} style={{ background: 'none', border: 'none', color: 'var(--c-text-muted)', cursor: 'pointer', fontSize: 11 }}>✕</button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--c-text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{fb.text}</div>
            </div>
          ))}

          {showAddFeedback ? (
            <div style={{ border: '1px solid var(--c-border-soft)', padding: 12, marginTop: 8, background: 'var(--c-bg)' }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...S.label, marginBottom: 4 }}>ARVOSANA</div>
                <StarRating value={newFeedback.rating} onChange={(val) => setNewFeedback({ ...newFeedback, rating: val })} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ ...S.label, marginBottom: 4 }}>TAPAHTUMA (valinnainen)</div>
                <input
                  value={newFeedback.eventName}
                  onChange={e => setNewFeedback({ ...newFeedback, eventName: e.target.value })}
                  placeholder="Minkä tapahtuman palaute"
                  style={{ ...S.input, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ ...S.label, marginBottom: 4 }}>PALAUTE</div>
                <textarea
                  value={newFeedback.text}
                  onChange={e => setNewFeedback({ ...newFeedback, text: e.target.value })}
                  placeholder="Kirjoita palaute..."
                  style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit' }}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAddFeedback} style={S.btnBlack}>LISÄÄ</button>
                <button onClick={() => { setShowAddFeedback(false); setNewFeedback({ text: '', rating: 5, eventName: '' }); }} style={S.btnWire}>PERUUTA</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddFeedback(true)} style={{ ...S.btnSmall, marginTop: 8 }}>+ LISÄÄ PALAUTE</button>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            background: 'var(--c-bg)', border: '2px solid #ff4444', padding: 24,
            maxWidth: 400, width: '90%',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-danger)', marginBottom: 12 }}>
              POISTA HENKILÖ?
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-text)', marginBottom: 8 }}>
              Oletko varma, että haluat poistaa henkilön:
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text-inverse)', marginBottom: 4 }}>
              {person?.first_name} {person?.last_name}
            </div>
            {person?.company && <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 16 }}>{person.company}</div>}
            <div style={{
              fontSize: 11, color: 'var(--c-danger)', marginBottom: 16, padding: '8px 10px',
              background: 'var(--c-danger-bg)', border: '1px solid var(--c-error-border)',
            }}>
              Tätä toimintoa ei voi peruuttaa.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); onDelete?.(person.id); }}
                style={{
                  background: 'var(--c-danger)', color: 'var(--c-text-inverse)', border: 'none',
                  padding: '8px 20px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: 1,
                }}
              >
                KYLLÄ, POISTA
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: 'transparent', color: 'var(--c-text)', border: '1px solid var(--c-border-soft)',
                  padding: '8px 20px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                PERUUTA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
