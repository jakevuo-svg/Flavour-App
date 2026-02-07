import { useState } from 'react';
import S from '../../styles/theme';
import Field from '../common/Field';

export default function EventNotes({ eventId, notes = [], onAddNote }) {
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddNote = () => {
    if (formData.title.trim() || formData.content.trim()) {
      onAddNote(eventId, formData);
      setFormData({ title: '', content: '' });
      setIsAdding(false);
    }
  };

  // Sort notes by creation date, newest first
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.created || 0);
    const dateB = new Date(b.created || 0);
    return dateB - dateA;
  });

  return (
    <div>
      {/* Add note form */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          style={{ ...S.btnWire, marginBottom: 16 }}
        >
          + Lisää muistiinpano
        </button>
      )}

      {isAdding && (
        <div style={{ ...S.bg, padding: 12, borderRadius: 4, marginBottom: 16 }}>
          <Field label="Otsikko">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={S.inputFull}
              placeholder="Muistiinpanon otsikko"
            />
          </Field>

          <Field label="Sisältö">
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              style={{
                ...S.inputFull,
                minHeight: 100,
                fontFamily: 'inherit',
                marginTop: 8
              }}
              placeholder="Muistiinpanon sisältö"
            />
          </Field>

          <div style={{ ...S.flexWrap, gap: 8, marginTop: 12 }}>
            <button
              onClick={handleAddNote}
              style={S.btnBlack}
            >
              Tallenna
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setFormData({ title: '', content: '' });
              }}
              style={S.btnWire}
            >
              Peruuta
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {sortedNotes.length === 0 ? (
        <div style={{ color: '#999', fontSize: 12 }}>
          Ei muistiinpanoja
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedNotes.map((note, idx) => (
            <div
              key={idx}
              style={{
                ...S.borderThin,
                padding: 12,
                borderRadius: 4,
                backgroundColor: '#0a0a0a',
                cursor: 'pointer'
              }}
              onClick={() =>
                setExpandedId(expandedId === idx ? null : idx)
              }
            >
              <div style={{ ...S.flexBetween }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {note.title || 'Ilman otsikkoa'}
                  </div>
                  <div style={{ ...S.small }}>
                    {note.created}
                  </div>
                </div>
                <div style={{ color: '#999' }}>
                  {expandedId === idx ? '▼' : '▶'}
                </div>
              </div>

              {expandedId === idx && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid #555',
                    whiteSpace: 'pre-wrap',
                    fontSize: 12,
                    color: '#ccc'
                  }}
                >
                  {note.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
