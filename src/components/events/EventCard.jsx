import { useState, useRef } from 'react';
import S from '../../styles/theme';
import { EVENT_TYPES, STATUSES } from '../../utils/constants';

const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

// Collapsible section component (pomppuvalikko)
const Section = ({ title, children, defaultOpen = false, count }) => {
  const [open, setOpen] = useState(defaultOpen);
  const hasContent = children && (typeof children !== 'string' || children.trim());
  return (
    <div style={{ borderTop: '2px solid #444' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: open ? '#1a1a1a' : 'transparent' }}
      >
        <span style={{ ...S.label, fontSize: 11 }}>
          {open ? '▼' : '▶'} {title}
          {count != null && <span style={{ color: '#666', fontWeight: 400, marginLeft: 6 }}>({count})</span>}
        </span>
        {!hasContent && !open && <span style={{ fontSize: 10, color: '#555' }}>tyhjä</span>}
      </div>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  );
};

const TextBlock = ({ text }) => {
  if (!text) return <span style={{ color: '#555', fontSize: 12 }}>-</span>;
  return <div style={{ fontSize: 13, color: '#bbb', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{text}</div>;
};

// Inline-editable Drive link
const EditableDriveLink = ({ url, label, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(url || '');

  const save = () => {
    onSave(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="https://drive.google.com/..."
          style={{ ...S.input, flex: 1, fontSize: 11 }}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && save()}
        />
        <button onClick={save} style={{ ...S.btnSmall, fontSize: 10, padding: '3px 8px' }}>OK</button>
        <button onClick={() => { setValue(url || ''); setEditing(false); }} style={{ ...S.btnSmall, fontSize: 10, padding: '3px 8px', borderColor: '#666', color: '#666' }}>✕</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#ddd', fontSize: 12, textDecoration: 'underline', wordBreak: 'break-all' }}>
          {label || 'AVAA →'}
        </a>
      ) : (
        <span style={{ color: '#555', fontSize: 12 }}>Ei linkkiä</span>
      )}
      <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 11, padding: '2px 4px' }}>
        {url ? '✎' : '+ LINKKI'}
      </button>
    </div>
  );
};

// Material types
const MATERIAL_TYPES = [
  { key: 'seating', label: 'ISTUMAJÄRJESTYS' },
  { key: 'menu_graphic', label: 'MENU GRAFIIKKA' },
  { key: 'floorplan', label: 'POHJAPIIRROS' },
  { key: 'branding', label: 'BRÄNDIMATERIAALI' },
  { key: 'photo', label: 'KUVA' },
  { key: 'document', label: 'DOKUMENTTI' },
  { key: 'other', label: 'MUU' },
];

// Attachment types for menu/order sections
const ATTACHMENT_TYPES = [
  { key: 'menu_file', label: 'MENU' },
  { key: 'order_file', label: 'TILAUS' },
  { key: 'photo', label: 'KUVA' },
  { key: 'document', label: 'DOKUMENTTI' },
  { key: 'other', label: 'MUU' },
];

// Reusable attachment list + add controls
const AttachmentSection = ({ attachments = [], onAdd, onRemove, onUpload, fileInputRef, types = ATTACHMENT_TYPES }) => {
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', type: 'other', driveLink: '' });

  const handleAdd = () => {
    if (!newItem.name.trim()) return;
    onAdd({ ...newItem });
    setNewItem({ name: '', type: 'other', driveLink: '' });
    setShowForm(false);
  };

  return (
    <div>
      {attachments.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {attachments.map(att => (
            <div key={att.id} style={{ border: '1px solid #333', padding: 8, marginBottom: 4, background: '#1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{att.name}</span>
                {att.fileSize && <span style={{ fontSize: 10, color: '#555' }}>{att.fileSize < 1048576 ? `${(att.fileSize/1024).toFixed(0)} KB` : `${(att.fileSize/1048576).toFixed(1)} MB`}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {att.driveLink && (
                  <a href={att.driveLink} target="_blank" rel="noopener noreferrer" style={{ ...S.btnSmall, textDecoration: 'none', fontSize: 10 }}>DRIVE →</a>
                )}
                {att.fileData && att.fileType?.startsWith('image/') && (
                  <img src={att.fileData} alt={att.name} style={{ width: 32, height: 32, objectFit: 'cover', border: '1px solid #444' }} />
                )}
                {att.fileData && (
                  <a href={att.fileData} download={att.fileName || att.name} style={{ ...S.btnSmall, textDecoration: 'none', fontSize: 10 }}>LATAA</a>
                )}
                <button onClick={() => onRemove(att.id)} style={{ ...S.btnSmall, fontSize: 10, padding: '2px 6px' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setShowForm(!showForm)} style={S.btnSmall}>
          {showForm ? 'PERUUTA' : '+ LISÄÄ LINKKI'}
        </button>
        <button onClick={() => fileInputRef.current?.click()} style={S.btnSmall}>
          + LATAA TIEDOSTO
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #444', padding: 12, marginTop: 8, background: '#1a1a1a' }}>
          <input
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Nimi"
            style={{ ...S.input, width: '100%', boxSizing: 'border-box', marginBottom: 8 }}
          />
          <input
            value={newItem.driveLink}
            onChange={e => setNewItem({ ...newItem, driveLink: e.target.value })}
            placeholder="Google Drive linkki"
            style={{ ...S.input, width: '100%', boxSizing: 'border-box', marginBottom: 8 }}
            type="url"
          />
          <button onClick={handleAdd} style={S.btnBlack}>LISÄÄ</button>
        </div>
      )}
    </div>
  );
};

export default function EventCard({ event, onUpdate, onDelete, onBack, locations = [], persons = [], tasks = [], onAddTask, onUpdateTask, onDeleteTask, notes = [], onAddNote, onDeleteNote }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...event });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'MEDIUM', description: '', assigned_to: '' });
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', type: 'other', driveLink: '' });
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteMentionId, setNoteMentionId] = useState('');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const fileInputRef = useRef(null);
  const menuFileRef = useRef(null);
  const orderFileRef = useRef(null);

  const handleInputChange = (field, value) => setFormData({ ...formData, [field]: value });
  const handleSave = () => { onUpdate?.(event.id, formData); setIsEditing(false); };
  const handleCancel = () => { setFormData({ ...event }); setIsEditing(false); };

  const total = (parseFloat(formData.foodPrice) || 0) + (parseFloat(formData.drinksPrice) || 0) + (parseFloat(formData.techPrice) || 0) + (parseFloat(formData.programPrice) || 0);
  const eventTasks = (tasks || []).filter(t => t.event_id === event?.id);
  const materials = formData.materials || [];
  const menuAttachments = formData.menuAttachments || [];
  const orderAttachments = formData.orderAttachments || [];

  // Workers assigned to this event
  const eventWorkers = formData.workers || [];
  const availableWorkers = persons.filter(p => !eventWorkers.includes(p.id));

  const addWorker = (personId) => {
    if (!personId || eventWorkers.includes(personId)) return;
    const updated = { ...formData, workers: [...eventWorkers, personId] };
    setFormData(updated);
    onUpdate?.(event.id, updated);
    setShowAddWorker(false);
  };

  const removeWorker = (personId) => {
    const updated = { ...formData, workers: eventWorkers.filter(id => id !== personId) };
    setFormData(updated);
    onUpdate?.(event.id, updated);
  };

  // Helper to get person name
  const getPersonName = (personId) => {
    const p = persons.find(p => p.id === personId);
    return p ? `${p.first_name} ${p.last_name}` : 'Tuntematon';
  };

  const getPersonRole = (personId) => {
    const p = persons.find(p => p.id === personId);
    return p?.role || '';
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    onAddTask?.({ ...newTask, event_id: event.id, assigned_to: newTask.assigned_to || null });
    setNewTask({ title: '', priority: 'MEDIUM', description: '', assigned_to: '' });
    setShowAddTask(false);
  };

  const cycleStatus = (task) => {
    const order = ['TODO', 'IN_PROGRESS', 'DONE'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    onUpdateTask?.(task.id, { status: next });
  };

  const handleLocationChange = (locName) => {
    const loc = locations.find(l => l.name === locName);
    setFormData({ ...formData, location_name: locName, location_id: loc?.id || '' });
  };

  // Save field directly (for inline edits without full edit mode)
  const saveField = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate?.(event.id, updated);
  };

  // Materials management
  const addMaterialLink = () => {
    if (!newMaterial.name.trim()) return;
    const mat = {
      id: `mat-${Date.now()}`,
      name: newMaterial.name,
      type: newMaterial.type,
      driveLink: newMaterial.driveLink || null,
      fileData: null,
      fileName: null,
      fileType: null,
      addedAt: new Date().toISOString(),
    };
    const updated = { ...formData, materials: [...materials, mat] };
    setFormData(updated);
    onUpdate?.(event.id, updated);
    setNewMaterial({ name: '', type: 'other', driveLink: '' });
    setShowAddMaterial(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const mat = {
        id: `mat-${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        type: file.type.startsWith('image/') ? 'photo' : 'document',
        driveLink: null,
        fileData: ev.target.result,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        addedAt: new Date().toISOString(),
      };
      const updated = { ...formData, materials: [...materials, mat] };
      setFormData(updated);
      onUpdate?.(event.id, updated);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeMaterial = (matId) => {
    const updated = { ...formData, materials: materials.filter(m => m.id !== matId) };
    setFormData(updated);
    onUpdate?.(event.id, updated);
  };

  // Generic attachment helpers for menu/order sections
  const addAttachment = (field, data) => {
    const att = {
      id: `att-${Date.now()}`,
      name: data.name,
      driveLink: data.driveLink || null,
      fileData: null,
      fileName: null,
      fileType: null,
      addedAt: new Date().toISOString(),
    };
    const arr = formData[field] || [];
    const updated = { ...formData, [field]: [...arr, att] };
    setFormData(updated);
    onUpdate?.(event.id, updated);
  };

  const removeAttachment = (field, attId) => {
    const arr = (formData[field] || []).filter(a => a.id !== attId);
    const updated = { ...formData, [field]: arr };
    setFormData(updated);
    onUpdate?.(event.id, updated);
  };

  const handleAttachmentUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const att = {
        id: `att-${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        driveLink: null,
        fileData: ev.target.result,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        addedAt: new Date().toISOString(),
      };
      const arr = formData[field] || [];
      const updated = { ...formData, [field]: [...arr, att] };
      setFormData(updated);
      onUpdate?.(event.id, updated);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Notes management — uses global notes system
  const addNoteToEvent = () => {
    if (!newNoteText.trim()) return;
    let content = newNoteText.trim();
    // Prepend @mention if selected
    if (noteMentionId) {
      const mentionName = getPersonName(noteMentionId);
      content = `@${mentionName}: ${content}`;
    }
    onAddNote?.({ event_id: event.id, content, mentioned_person_id: noteMentionId || null });
    setNewNoteText('');
    setNoteMentionId('');
    setShowAddNote(false);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Edit field helper
  const EF = ({ label, field, type = 'text', options, textarea }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ ...S.label, marginBottom: 4 }}>{label}</div>
      {options ? (
        <select value={formData[field] || ''} onChange={e => handleInputChange(field, e.target.value)} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
          <option value="">Valitse</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : textarea ? (
        <textarea value={formData[field] || ''} onChange={e => handleInputChange(field, e.target.value)} style={{ ...S.input, width: '100%', minHeight: 80, boxSizing: 'border-box', fontFamily: 'inherit' }} />
      ) : (
        <input type={type} value={formData[field] || ''} onChange={e => handleInputChange(field, e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
      )}
    </div>
  );

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
      {/* Back + Header */}
      <div style={{ padding: '12px 16px' }}>
        <button onClick={onBack} style={{ ...S.btnSmall, marginBottom: 12 }}>← TAKAISIN</button>
        <div style={{ ...S.flexBetween, paddingBottom: 12, borderBottom: '2px solid #444' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{event?.name}</div>
            <div style={{ ...S.flex, ...S.gap, flexWrap: 'wrap' }}>
              <span style={{ ...S.tag(false), fontSize: 10 }}>{event?.status}</span>
              <span style={{ ...S.tag(false), fontSize: 10 }}>{event?.type}</span>
              <span style={{ color: '#999', fontSize: 12 }}>
                {event?.date ? new Date(event.date).toLocaleDateString('fi-FI') : ''} • {event?.start_time || ''}{event?.end_time ? `-${event.end_time}` : ''}
              </span>
              <span style={{ color: '#999', fontSize: 12 }}>Pax: {event?.guest_count || '-'}</span>
              {event?.language && <span style={{ color: '#666', fontSize: 11 }}>({event.language})</span>}
            </div>
          </div>
          <div style={{ ...S.flex, ...S.gap }}>
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} style={S.btnWire}>MUOKKAA</button>
                <button onClick={() => onDelete?.(event.id)} style={S.btnDanger}>POISTA</button>
              </>
            ) : (
              <>
                <button onClick={handleSave} style={S.btnBlack}>TALLENNA</button>
                <button onClick={handleCancel} style={S.btnWire}>PERUUTA</button>
              </>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        /* ===== EDIT MODE — collapsible sections ===== */
        <div>
          <Section title="PERUSTIEDOT" defaultOpen={true}>
            {EF({ label: "Nimi", field: "name" })}
            <div style={S.formGrid}>{EF({ label: "Tyyppi", field: "type", options: EVENT_TYPES })}{EF({ label: "Status", field: "status", options: STATUSES })}</div>
            <div style={S.formGrid}>{EF({ label: "Päivämäärä", field: "date", type: "date" })}<div style={S.formGrid}>{EF({ label: "Alkaa", field: "start_time", type: "time" })}{EF({ label: "Päättyy", field: "end_time", type: "time" })}</div></div>
            <div style={S.formGrid}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ ...S.label, marginBottom: 4 }}>Sijainti</div>
                <select value={formData.location_name || ''} onChange={e => handleLocationChange(e.target.value)} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                  <option value="">Valitse</option>
                  {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              {EF({ label: "Pax", field: "guest_count", type: "number" })}
            </div>
            <div style={S.formGrid}>{EF({ label: "Kieli", field: "language" })}{EF({ label: "Yritys", field: "company" })}</div>
            <div style={S.formGrid}>{EF({ label: "Yhteystieto", field: "contact" })}{EF({ label: "Varaaja", field: "booker" })}</div>
          </Section>
          <Section title="TAVOITE" defaultOpen={!!formData.goal}>{EF({ label: "", field: "goal", textarea: true })}</Section>
          <Section title="HUOMIOITAVAA" defaultOpen={!!formData.attentionNotes}>{EF({ label: "", field: "attentionNotes", textarea: true })}</Section>
          <Section title="ERV (ALLERGIAT/DIEETIT)" defaultOpen={!!formData.erv}>{EF({ label: "", field: "erv", textarea: true })}</Section>
          <Section title="AIKATAULU" defaultOpen={!!formData.schedule}>{EF({ label: "", field: "schedule", textarea: true })}</Section>
          <Section title="MENU" defaultOpen={!!formData.menu}>
            {EF({ label: "", field: "menu", textarea: true })}
            {EF({ label: "Menu Drive linkki", field: "menuLink", type: "url" })}
          </Section>
          <Section title="DEKORAATIOT" defaultOpen={!!formData.decorations}>{EF({ label: "", field: "decorations", textarea: true })}</Section>
          <Section title="LOGISTIIKKA" defaultOpen={!!formData.logistics}>{EF({ label: "", field: "logistics", textarea: true })}</Section>
          <Section title="ORDER / TILAUS" defaultOpen={!!formData.orderLink}>
            {EF({ label: "Google Drive linkki", field: "orderLink", type: "url" })}
            {EF({ label: "Tilauksen lisätiedot", field: "orderNotes", textarea: true })}
          </Section>
          <Section title="HINNOITTELU" defaultOpen={true}>
            {[['Ruoka', 'food', 'foodPrice'], ['Juomat', 'drinks', 'drinksPrice'], ['Tekniikka', 'tech', 'techPrice'], ['Ohjelma', 'program', 'programPrice']].map(([label, desc, price]) => (
              <div key={desc} style={S.formGrid}>{EF({ label, field: desc })}{EF({ label: `${label} hinta (€)`, field: price, type: "number" })}</div>
            ))}
          </Section>
          <Section title="MUISTIINPANOT" defaultOpen={!!formData.notes || notes.length > 0} count={notes.length + (formData.notes ? 1 : 0)}>
            {EF({ label: "Yleiset muistiinpanot", field: "notes", textarea: true })}

            {/* Global notes for this event — same as view mode */}
            {notes.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #333' }}>
                <div style={{ ...S.label, marginBottom: 6 }}>TAPAHTUMAMUISTIINPANOT</div>
                {notes.map(note => (
                  <div key={note.id} style={{ border: '1px solid #333', padding: 10, marginBottom: 6, background: '#1a1a1a' }}>
                    <div style={{ ...S.flexBetween, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: '#666' }}>
                        {note.author && <span style={{ marginRight: 8 }}>{note.author}</span>}
                        {new Date(note.created_at).toLocaleDateString('fi-FI')} {new Date(note.created_at).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button onClick={() => onDeleteNote?.(note.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 11 }}>✕</button>
                    </div>
                    <div style={{ fontSize: 13, color: '#bbb', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{note.content}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Add note form in edit mode */}
            {showAddNote ? (
              <div style={{ border: '1px solid #444', padding: 12, marginTop: 8, background: '#1a1a1a' }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ ...S.label, marginBottom: 4 }}>MAINITSE HENKILÖ</div>
                  <select value={noteMentionId} onChange={e => setNoteMentionId(e.target.value)} style={S.selectFull}>
                    <option value="">Ei mainintaa</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id}>@{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
                </div>
                <textarea value={newNoteText} onChange={e => setNewNoteText(e.target.value)} placeholder="Kirjoita muistiinpano..." style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 8 }} autoFocus />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addNoteToEvent} style={S.btnBlack}>LISÄÄ</button>
                  <button onClick={() => { setShowAddNote(false); setNewNoteText(''); setNoteMentionId(''); }} style={S.btnWire}>PERUUTA</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddNote(true)} style={{ ...S.btnSmall, marginTop: 8 }}>+ LISÄÄ MUISTIINPANO</button>
            )}
          </Section>
        </div>
      ) : (
        /* ===== VIEW MODE — collapsible sections ===== */
        <div>
          <Section title="PERUSTIEDOT" defaultOpen={true}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Nimi', event?.name], ['Tyyppi', event?.type], ['Status', event?.status],
                ['Päivämäärä', event?.date ? new Date(event.date).toLocaleDateString('fi-FI') : '-'],
                ['Aika', `${event?.start_time || ''}${event?.end_time ? ' - ' + event.end_time : ''}`],
                ['Sijainti', event?.location_name], ['Pax', event?.guest_count],
                ['Kieli', event?.language], ['Yritys', event?.company],
                ['Yhteystieto', event?.contact], ['Varaaja', event?.booker],
              ].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 6 }}>
                  <div style={S.label}>{label}</div>
                  <div style={{ fontSize: 13 }}>{val || '-'}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* TYÖNTEKIJÄT */}
          <Section title="TYÖNTEKIJÄT" defaultOpen={true} count={eventWorkers.length}>
            {eventWorkers.length === 0 && !showAddWorker && (
              <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Ei lisättyjä työntekijöitä</div>
            )}
            {eventWorkers.map(wId => {
              const worker = persons.find(p => p.id === wId);
              if (!worker) return null;
              return (
                <div key={wId} style={{ ...S.row, alignItems: 'center', padding: '6px 0' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{worker.first_name} {worker.last_name}</span>
                    {worker.role && <span style={{ fontSize: 11, color: '#777', marginLeft: 8 }}>{worker.role}</span>}
                    {worker.phone && <span style={{ fontSize: 11, color: '#555', marginLeft: 8 }}>{worker.phone}</span>}
                  </div>
                  <button onClick={() => removeWorker(wId)} style={{ ...S.btnSmall, fontSize: 10, padding: '2px 6px' }}>✕</button>
                </div>
              );
            })}

            {showAddWorker ? (
              <div style={{ border: '1px solid #444', padding: 12, marginTop: 8, background: '#1a1a1a' }}>
                <div style={{ ...S.label, marginBottom: 6 }}>LISÄÄ TYÖNTEKIJÄ</div>
                {availableWorkers.length === 0 ? (
                  <div style={{ color: '#666', fontSize: 12 }}>Kaikki henkilöt on jo lisätty</div>
                ) : (
                  <select
                    onChange={e => { if (e.target.value) addWorker(e.target.value); }}
                    style={{ ...S.selectFull, marginBottom: 8 }}
                    defaultValue=""
                  >
                    <option value="">Valitse henkilö...</option>
                    {availableWorkers.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name}{p.role ? ` — ${p.role}` : ''}</option>
                    ))}
                  </select>
                )}
                <button onClick={() => setShowAddWorker(false)} style={S.btnWire}>PERUUTA</button>
              </div>
            ) : (
              <button onClick={() => setShowAddWorker(true)} style={{ ...S.btnSmall, marginTop: 8 }}>+ LISÄÄ TYÖNTEKIJÄ</button>
            )}
          </Section>

          <Section title="TAVOITE" defaultOpen={!!event?.goal}><TextBlock text={event?.goal} /></Section>
          <Section title="HUOMIOITAVAA" defaultOpen={!!event?.attentionNotes}><TextBlock text={event?.attentionNotes} /></Section>
          <Section title="ERV (ALLERGIAT/DIEETIT)" defaultOpen={!!event?.erv}><TextBlock text={event?.erv} /></Section>
          <Section title="AIKATAULU" defaultOpen={!!event?.schedule}><TextBlock text={event?.schedule} /></Section>

          {/* MENU — with editable link + attachments */}
          <Section title="MENU" defaultOpen={!!event?.menu || menuAttachments.length > 0}>
            <TextBlock text={event?.menu} />
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #333' }}>
              <div style={{ ...S.label, marginBottom: 4 }}>DRIVE-LINKKI</div>
              <EditableDriveLink url={formData.menuLink} label="Menu Drive →" onSave={(val) => saveField('menuLink', val)} />
            </div>
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #333' }}>
              <div style={{ ...S.label, marginBottom: 6 }}>LIITTEET</div>
              <AttachmentSection
                attachments={menuAttachments}
                onAdd={(data) => addAttachment('menuAttachments', data)}
                onRemove={(id) => removeAttachment('menuAttachments', id)}
                onUpload={(e) => handleAttachmentUpload('menuAttachments', e)}
                fileInputRef={menuFileRef}
              />
              <input ref={menuFileRef} type="file" style={{ display: 'none' }} onChange={(e) => handleAttachmentUpload('menuAttachments', e)} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
            </div>
          </Section>

          <Section title="DEKORAATIOT" defaultOpen={!!event?.decorations}><TextBlock text={event?.decorations} /></Section>
          <Section title="LOGISTIIKKA" defaultOpen={!!event?.logistics}><TextBlock text={event?.logistics} /></Section>

          {/* ORDER — with editable link + attachments */}
          <Section title="ORDER / TILAUS" defaultOpen={!!event?.orderLink || orderAttachments.length > 0}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ ...S.label, marginBottom: 4 }}>DRIVE-LINKKI</div>
              <EditableDriveLink url={formData.orderLink} label="Order Drive →" onSave={(val) => saveField('orderLink', val)} />
            </div>
            {event?.orderNotes && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...S.label, marginBottom: 4 }}>LISÄTIEDOT</div>
                <TextBlock text={event.orderNotes} />
              </div>
            )}
            <div style={{ paddingTop: 8, borderTop: '1px solid #333' }}>
              <div style={{ ...S.label, marginBottom: 6 }}>LIITTEET</div>
              <AttachmentSection
                attachments={orderAttachments}
                onAdd={(data) => addAttachment('orderAttachments', data)}
                onRemove={(id) => removeAttachment('orderAttachments', id)}
                onUpload={(e) => handleAttachmentUpload('orderAttachments', e)}
                fileInputRef={orderFileRef}
              />
              <input ref={orderFileRef} type="file" style={{ display: 'none' }} onChange={(e) => handleAttachmentUpload('orderAttachments', e)} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
            </div>
          </Section>

          <Section title="MATERIAALIT / LIITTEET" defaultOpen={materials.length > 0} count={materials.length}>
            {/* Existing materials */}
            {materials.length === 0 && !showAddMaterial && (
              <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Ei materiaaleja</div>
            )}
            {materials.map(mat => {
              const typeLabel = MATERIAL_TYPES.find(t => t.key === mat.type)?.label || mat.type;
              const isImage = mat.fileType?.startsWith('image/');
              return (
                <div key={mat.id} style={{ border: '1px solid #333', padding: 10, marginBottom: 8, background: '#1a1a1a' }}>
                  <div style={{ ...S.flexBetween, marginBottom: isImage && mat.fileData ? 8 : 0 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#ddd' }}>{mat.name}</span>
                      <span style={{ fontSize: 10, color: '#666', marginLeft: 8, textTransform: 'uppercase' }}>{typeLabel}</span>
                      {mat.fileSize && <span style={{ fontSize: 10, color: '#555', marginLeft: 6 }}>{formatFileSize(mat.fileSize)}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {mat.driveLink && (
                        <a href={mat.driveLink} target="_blank" rel="noopener noreferrer" style={{ ...S.btnSmall, textDecoration: 'none', fontSize: 10 }}>DRIVE →</a>
                      )}
                      {mat.fileData && (
                        <a href={mat.fileData} download={mat.fileName} style={{ ...S.btnSmall, textDecoration: 'none', fontSize: 10 }}>LATAA</a>
                      )}
                      <button onClick={() => removeMaterial(mat.id)} style={{ ...S.btnSmall, fontSize: 10, padding: '2px 6px' }}>✕</button>
                    </div>
                  </div>
                  {isImage && mat.fileData && (
                    <img src={mat.fileData} alt={mat.name} style={{ maxWidth: '100%', maxHeight: 200, border: '1px solid #333', marginTop: 4 }} />
                  )}
                </div>
              );
            })}

            {/* Add material controls */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => setShowAddMaterial(!showAddMaterial)} style={S.btnSmall}>
                {showAddMaterial ? 'PERUUTA' : '+ LISÄÄ LINKKI'}
              </button>
              <button onClick={() => fileInputRef.current?.click()} style={S.btnSmall}>
                + LATAA TIEDOSTO
              </button>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
            </div>

            {showAddMaterial && (
              <div style={{ border: '1px solid #444', padding: 12, marginTop: 8, background: '#1a1a1a' }}>
                <div style={{ ...S.label, marginBottom: 8 }}>LISÄÄ MATERIAALI</div>
                <input
                  value={newMaterial.name}
                  onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  placeholder="Nimi (esim. Istumajärjestys)"
                  style={{ ...S.input, width: '100%', boxSizing: 'border-box', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <select
                    value={newMaterial.type}
                    onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}
                    style={{ ...S.select, flex: 1 }}
                  >
                    {MATERIAL_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
                <input
                  value={newMaterial.driveLink}
                  onChange={e => setNewMaterial({ ...newMaterial, driveLink: e.target.value })}
                  placeholder="Google Drive linkki (valinnainen)"
                  style={{ ...S.input, width: '100%', boxSizing: 'border-box', marginBottom: 8 }}
                  type="url"
                />
                <button onClick={addMaterialLink} style={S.btnBlack}>LISÄÄ</button>
              </div>
            )}
          </Section>

          <Section title="HINNOITTELU" defaultOpen={total > 0}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <tbody>
                {[['Ruoka', event?.food, event?.foodPrice], ['Juomat', event?.drinks, event?.drinksPrice], ['Tekniikka', event?.tech, event?.techPrice], ['Ohjelma', event?.program, event?.programPrice]].map(([label, desc, price]) => (
                  <tr key={label} style={{ borderBottom: '1px solid #444' }}>
                    <td style={{ padding: '4px 0', fontWeight: 600 }}>{label}</td>
                    <td style={{ padding: '4px 0', color: '#999' }}>{desc || ''}</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>{price ? `${price} €` : ''}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #ddd' }}>
                  <td style={{ padding: '6px 0', fontWeight: 700 }}>YHTEENSÄ</td>
                  <td></td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700 }}>{total.toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="TEHTÄVÄT" defaultOpen={true} count={eventTasks.length}>
            <div style={{ ...S.flexBetween, marginBottom: 8 }}>
              <span></span>
              <button onClick={() => setShowAddTask(!showAddTask)} style={S.btnSmall}>
                {showAddTask ? 'PERUUTA' : '+ LISÄÄ TEHTÄVÄ'}
              </button>
            </div>
            {showAddTask && (
              <div style={{ border: '1px solid #444', padding: 12, marginBottom: 12, background: '#1a1a1a' }}>
                <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Tehtävän nimi" style={{ ...S.input, width: '100%', boxSizing: 'border-box', marginBottom: 8 }} onKeyDown={e => e.key === 'Enter' && handleAddTask()} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={{ ...S.select, flex: 1 }}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Kuvaus" style={{ ...S.input, flex: 2 }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ ...S.label, marginBottom: 4 }}>VASTUUHENKILÖ</div>
                  <select value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })} style={{ ...S.selectFull }}>
                    <option value="">Ei vastuuhenkilöä</option>
                    {eventWorkers.map(wId => {
                      const w = persons.find(p => p.id === wId);
                      return w ? <option key={wId} value={wId}>{w.first_name} {w.last_name}</option> : null;
                    })}
                    {/* Also show all persons if not in workers list */}
                    {persons.filter(p => !eventWorkers.includes(p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleAddTask} style={S.btnBlack}>LISÄÄ</button>
              </div>
            )}
            {eventTasks.length === 0 && !showAddTask && <div style={{ color: '#666', fontSize: 12 }}>Ei tehtäviä</div>}
            {eventTasks.map(task => (
              <div key={task.id} style={{ ...S.row, alignItems: 'center' }}>
                <button onClick={() => cycleStatus(task)} style={{ ...S.btnSmall, width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 8, background: task.status === 'DONE' ? '#333' : 'transparent' }} title={task.status}>
                  {task.status === 'DONE' ? '✓' : task.status === 'IN_PROGRESS' ? '◐' : '○'}
                </button>
                <div style={{ ...S.col(3), display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: task.status === 'DONE' ? 400 : 600, textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? '#666' : '#ddd' }}>
                    {task.title}
                    {task.description && <span style={{ color: '#777', fontSize: 11, marginLeft: 8 }}>{task.description}</span>}
                  </span>
                  {task.assigned_to && (
                    <span style={{ fontSize: 10, color: '#888', marginTop: 2 }}>→ {getPersonName(task.assigned_to)}</span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: '#999', marginRight: 8 }}>{task.priority}</span>
                <span style={{ fontSize: 10, color: '#999', marginRight: 8 }}>{task.status}</span>
                <button onClick={() => onDeleteTask?.(task.id)} style={{ ...S.btnSmall, fontSize: 10, padding: '2px 6px', flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </Section>

          {/* MUISTIINPANOT — uses global notes system */}
          <Section title="MUISTIINPANOT" defaultOpen={true} count={notes.length + (event?.notes ? 1 : 0)}>
            {/* Legacy notes text */}
            {event?.notes && (
              <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #333' }}>
                <TextBlock text={event.notes} />
              </div>
            )}

            {/* Global notes for this event */}
            {notes.map(note => (
              <div key={note.id} style={{ border: '1px solid #333', padding: 10, marginBottom: 6, background: '#1a1a1a' }}>
                <div style={{ ...S.flexBetween, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#666' }}>
                    {note.author && <span style={{ marginRight: 8 }}>{note.author}</span>}
                    {new Date(note.created_at).toLocaleDateString('fi-FI')} {new Date(note.created_at).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button onClick={() => onDeleteNote?.(note.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 11 }}>✕</button>
                </div>
                <div style={{ fontSize: 13, color: '#bbb', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{note.content}</div>
              </div>
            ))}

            {/* Add note form */}
            {showAddNote ? (
              <div style={{ border: '1px solid #444', padding: 12, marginTop: 8, background: '#1a1a1a' }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ ...S.label, marginBottom: 4 }}>MAINITSE HENKILÖ</div>
                  <select
                    value={noteMentionId}
                    onChange={e => setNoteMentionId(e.target.value)}
                    style={S.selectFull}
                  >
                    <option value="">Ei mainintaa</option>
                    {eventWorkers.map(wId => {
                      const w = persons.find(p => p.id === wId);
                      return w ? <option key={wId} value={wId}>@{w.first_name} {w.last_name}</option> : null;
                    })}
                    {persons.filter(p => !eventWorkers.includes(p.id)).map(p => (
                      <option key={p.id} value={p.id}>@{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Kirjoita muistiinpano..."
                  style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 8 }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addNoteToEvent} style={S.btnBlack}>LISÄÄ</button>
                  <button onClick={() => { setShowAddNote(false); setNewNoteText(''); setNoteMentionId(''); }} style={S.btnWire}>PERUUTA</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddNote(true)} style={{ ...S.btnSmall, marginTop: 8 }}>+ LISÄÄ MUISTIINPANO</button>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
