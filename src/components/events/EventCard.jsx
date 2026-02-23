import { useState, useRef, useEffect } from 'react';
import S from '../../styles/theme';
import { EVENT_TYPES, STATUSES, LOCATION_ORDER } from '../../utils/constants';
import { supabase } from '../../services/supabaseClient';

const PRIORITIES = ['KORKEA', 'NORMAALI', 'MATALA'];

const COMMON_ALLERGENS = [
  'Gluteeniton', 'Laktoositon', 'Maidoton', 'Munaton',
  'Pähkinätön', 'Kala', 'Äyriäiset', 'Soijaton',
  'Vegaaninen', 'Kasvis', 'Sianlihaton',
];

// Parse erv text field into { allergens: string[], notes: string }
const parseErv = (erv) => {
  if (!erv) return { allergens: [], notes: '' };
  const parts = erv.split(' — ');
  const allergenPart = parts[0] || '';
  const notesPart = parts.slice(1).join(' — ');
  const allergens = COMMON_ALLERGENS.filter(a => allergenPart.includes(a));
  // Notes = anything that's not a known allergen
  const knownText = allergens.join(', ');
  const extraAllergenText = allergenPart.replace(knownText, '').replace(/^[, ]+|[, ]+$/g, '').trim();
  const notes = [extraAllergenText, notesPart].filter(Boolean).join(' — ');
  return { allergens, notes };
};

// Combine allergens + notes back into erv text
const buildErv = (allergens, notes) => {
  const allergenText = allergens.join(', ');
  return [allergenText, notes].filter(Boolean).join(' — ');
};

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

// Drink service options
const DRINK_OPTIONS = [
  'Open Bar', 'Viinit ruoan kanssa', 'Drinkkilippuja', 'Kuohuviini',
  'Cocktails', 'Olutpaketti', 'Alkoholiton', 'Kahvi & tee',
];

// Parse drinkService field (stored as JSON string or array)
const parseDrinkService = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
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

export default function EventCard({ event, onUpdate, onDelete, onBack, locations = [], persons = [], tasks = [], onAddTask, onUpdateTask, onDeleteTask, notes = [], onAddNote, onDeleteNote, can = () => true, onAssignWorker, onRemoveWorker }) {
  // Sort locations by preferred order (uses includes for flexible matching)
  const sortedLocations = [...locations].sort((a, b) => {
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    const aIdx = LOCATION_ORDER.findIndex(keyword => aName.includes(keyword));
    const bIdx = LOCATION_ORDER.findIndex(keyword => bName.includes(keyword));
    return (aIdx >= 0 ? aIdx : 999) - (bIdx >= 0 ? bIdx : 999);
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...event });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'NORMAALI', description: '', assigned_to: '' });
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', type: 'other', driveLink: '' });
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteMentionId, setNoteMentionId] = useState('');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newShift, setNewShift] = useState({ userId: '', start_time: '', end_time: '', role: 'staff', notes: '' });
  const fileInputRef = useRef(null);
  const menuFileRef = useRef(null);
  const orderFileRef = useRef(null);

  const handleInputChange = (field, value) => setFormData({ ...formData, [field]: value });

  // Finnish labels for change tracking
  const FIELD_LABELS = {
    name: 'Nimi', type: 'Tyyppi', date: 'Päivämäärä', end_date: 'Loppupäivä',
    start_time: 'Alkamisaika', end_time: 'Loppumisaika', location_name: 'Paikka',
    guest_count: 'Vierasmäärä', language: 'Kieli', company: 'Yritys',
    booker: 'Varaaja', contact: 'Yhteystieto', status: 'Tila', goal: 'Tavoite',
    attentionNotes: 'Huomioitavaa', erv: 'ERV', schedule: 'Aikataulu',
    menu: 'Menu', decorations: 'Koristelu', logistics: 'Logistiikka',
    duringEvent: 'Tapahtuman aikana', feedback: 'Palaute',
    drinkService: 'Juomatapa', drinkNotes: 'Juomien lisätiedot', drinkTicketSource: 'Drinkkilippujen lähde',
    food: 'Ruoka', foodPrice: 'Ruoan hinta', drinks: 'Juomat', drinksPrice: 'Juomien hinta',
    tech: 'Tekniikka', techPrice: 'Tekniikan hinta', program: 'Ohjelma', programPrice: 'Ohjelman hinta',
    orderNotes: 'Tilauksen muistiinpanot', notes: 'Muistiinpanot',
  };

  const handleSave = async () => {
    try {
      const { id, created_at, created_by, ...updateFields } = formData;

      // Compute what changed for the change log
      const changedFields = [];
      for (const key of Object.keys(FIELD_LABELS)) {
        const oldVal = (event[key] ?? '').toString();
        const newVal = (updateFields[key] ?? '').toString();
        if (oldVal !== newVal) {
          const label = FIELD_LABELS[key];
          const snippet = typeof updateFields[key] === 'string' && updateFields[key].length > 40
            ? updateFields[key].slice(0, 40) + '…'
            : updateFields[key];
          changedFields.push(`${label}: ${snippet || '(tyhjennetty)'}`);
        }
      }
      updateFields.last_change = changedFields.length > 0
        ? changedFields.slice(0, 3).join(', ')
        : '';

      await onUpdate?.(event.id, updateFields);
      setIsEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
      // Stay in edit mode so user doesn't lose their changes
    }
  };
  const handleCancel = () => { setFormData({ ...event }); setIsEditing(false); };

  // Keep formData in sync with event prop (e.g. after save completes)
  useEffect(() => {
    if (!isEditing) {
      setFormData({ ...event });
    }
  }, [event]);

  const total = (parseFloat(formData.foodPrice) || 0) + (parseFloat(formData.drinksPrice) || 0) + (parseFloat(formData.techPrice) || 0) + (parseFloat(formData.programPrice) || 0);
  const eventTasks = (tasks || []).filter(t => t.event_id === event?.id);
  const materials = formData.materials || [];
  const menuAttachments = formData.menuAttachments || [];
  const orderAttachments = formData.orderAttachments || [];

  // Workers assigned to this event (from event_assignments + users table)
  const [assignedWorkers, setAssignedWorkers] = useState([]);
  const [allSystemUsers, setAllSystemUsers] = useState([]);

  useEffect(() => {
    if (!event?.id) return;
    let cancelled = false;
    const abortController = new AbortController();

    // Fetch assigned workers via SECURITY DEFINER function
    const fetchWorkers = async () => {
      const { data } = await supabase.rpc('get_event_workers', { p_event_id: event.id });
      if (!cancelled) setAssignedWorkers(data || []);
    };
    // Fetch all system users for the add-worker dropdown (admin only)
    const fetchAllUsers = async () => {
      const { data } = await supabase.from('users').select('id, first_name, last_name, email, role').eq('is_active', true).order('first_name');
      if (!cancelled) setAllSystemUsers(data || []);
    };
    fetchWorkers();
    fetchAllUsers();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [event?.id]);

  const assignedIds = new Set(assignedWorkers.map(w => w.id));
  const availableWorkers = allSystemUsers.filter(u => !assignedIds.has(u.id));

  const addWorker = async (shiftData) => {
    const userId = shiftData?.userId || shiftData;
    if (!userId || assignedIds.has(userId)) return;
    try {
      const assignmentData = {
        event_id: event.id,
        user_id: userId,
        ...(shiftData.start_time ? { start_time: shiftData.start_time } : {}),
        ...(shiftData.end_time ? { end_time: shiftData.end_time } : {}),
        ...(shiftData.role ? { role: shiftData.role } : {}),
        ...(shiftData.notes ? { notes: shiftData.notes } : {}),
      };
      if (onAssignWorker) {
        await onAssignWorker(event.id, userId, assignmentData);
      } else {
        const { error } = await supabase.from('event_assignments').insert(assignmentData);
        if (error) throw error;
      }
      const user = allSystemUsers.find(u => u.id === userId);
      if (user) setAssignedWorkers(prev => [...prev, {
        ...user,
        assignment_role: shiftData.role || 'staff',
        start_time: shiftData.start_time || null,
        end_time: shiftData.end_time || null,
        assignment_notes: shiftData.notes || null,
      }]);
    } catch (err) {
      console.error('Failed to assign worker:', err);
    }
    setShowAddWorker(false);
    setNewShift({ userId: '', start_time: '', end_time: '', role: 'staff', notes: '' });
  };

  const removeWorker = async (userId) => {
    try {
      if (onRemoveWorker) {
        await onRemoveWorker(event.id, userId);
      } else {
        const { error } = await supabase.from('event_assignments').delete().eq('event_id', event.id).eq('user_id', userId);
        if (error) throw error;
      }
      setAssignedWorkers(prev => prev.filter(w => w.id !== userId));
    } catch (err) {
      console.error('Failed to remove worker:', err);
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    onAddTask?.({ ...newTask, event_id: event.id, assigned_to: newTask.assigned_to || null });
    setNewTask({ title: '', priority: 'NORMAALI', description: '', assigned_to: '' });
    setShowAddTask(false);
  };

  const cycleStatus = (task) => {
    const order = ['TODO', 'IN_PROGRESS', 'DONE'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    onUpdateTask?.(task.id, { status: next });
  };

  const handleLocationChange = (locName) => {
    const loc = locations.find(l => l.name === locName);
    setFormData(prev => ({ ...prev, location_name: locName, location_id: loc?.id || '' }));
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
      const mentioned = assignedWorkers.find(w => w.id === noteMentionId) || persons.find(p => p.id === noteMentionId);
      const mentionName = mentioned ? `${mentioned.first_name} ${mentioned.last_name}` : 'Tuntematon';
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
                {event?.date ? new Date(event.date).toLocaleDateString('fi-FI') : ''}{event?.end_date ? ` – ${new Date(event.end_date).toLocaleDateString('fi-FI')}` : ''} • {event?.start_time || ''}{event?.end_time ? `–${event.end_time}` : ''}
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
            <div style={S.formGrid}>{EF({ label: "Alkupäivä", field: "date", type: "date" })}{EF({ label: "Loppupäivä", field: "end_date", type: "date" })}</div>
            <div style={S.formGrid}>{EF({ label: "Alkaa", field: "start_time", type: "time" })}{EF({ label: "Päättyy", field: "end_time", type: "time" })}</div>
            <div style={S.formGrid}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ ...S.label, marginBottom: 4 }}>Sijainti</div>
                <select value={formData.location_name || ''} onChange={e => handleLocationChange(e.target.value)} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                  <option value="">Valitse</option>
                  {sortedLocations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              {EF({ label: "Pax", field: "guest_count", type: "number" })}
            </div>
            {can('card_contacts') && <>
              <div style={S.formGrid}>{EF({ label: "Kieli", field: "language", options: ['Suomi', 'Englanti'] })}{EF({ label: "Yritys", field: "company" })}</div>
              <div style={S.formGrid}>{EF({ label: "Yhteystieto", field: "contact" })}{EF({ label: "Varaaja", field: "booker" })}</div>
            </>}
          </Section>
          {can('card_goal') && <Section title="TAVOITE" defaultOpen={!!formData.goal}>{EF({ label: "", field: "goal", textarea: true })}</Section>}
          {can('card_attention') && <Section title="HUOMIOITAVAA" defaultOpen={!!formData.attentionNotes}>{EF({ label: "", field: "attentionNotes", textarea: true })}</Section>}
          {can('card_erv') && <Section title="ERV (ALLERGIAT/DIEETIT)" defaultOpen={!!formData.erv}>
            {(() => {
              const parsed = parseErv(formData.erv);
              const toggleAllergen = (allergen) => {
                const newAllergens = parsed.allergens.includes(allergen)
                  ? parsed.allergens.filter(a => a !== allergen)
                  : [...parsed.allergens, allergen];
                handleInputChange('erv', buildErv(newAllergens, parsed.notes));
              };
              return (
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {COMMON_ALLERGENS.map(a => {
                      const active = parsed.allergens.includes(a);
                      return (
                        <div key={a} onClick={() => toggleAllergen(a)} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          border: active ? '2px solid #ddd' : '1px solid #555',
                          background: active ? '#ddd' : '#1e1e1e',
                          color: active ? '#111' : '#999',
                          padding: '4px 10px', cursor: 'pointer',
                          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                          transition: 'all 0.15s',
                        }}>
                          <span style={{
                            width: 14, height: 14,
                            border: active ? '2px solid #111' : '2px solid #666',
                            background: active ? '#111' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, color: active ? '#ddd' : 'transparent', flexShrink: 0,
                          }}>{active ? '✓' : ''}</span>
                          {a}
                        </div>
                      );
                    })}
                  </div>
                  {parsed.allergens.length > 0 && (
                    <div style={{ marginBottom: 6, fontSize: 11, color: '#999' }}>Valittu: {parsed.allergens.join(', ')}</div>
                  )}
                  <div style={{ ...S.label, marginBottom: 4 }}>Lisätiedot allergioista</div>
                  <textarea
                    value={parsed.notes}
                    onChange={e => handleInputChange('erv', buildErv(parsed.allergens, e.target.value))}
                    style={{ ...S.input, width: '100%', minHeight: 50, boxSizing: 'border-box', fontFamily: 'inherit' }}
                    placeholder="Muut allergiat tai erityisruokavaliot..."
                  />
                </div>
              );
            })()}
          </Section>}
          {can('card_schedule') && <Section title="AIKATAULU" defaultOpen={!!formData.schedule}>{EF({ label: "", field: "schedule", textarea: true })}</Section>}
          {can('card_menu') && <Section title="MENU" defaultOpen={!!formData.menu}>
            {EF({ label: "", field: "menu", textarea: true })}
            {EF({ label: "Menu Drive linkki", field: "menuLink", type: "url" })}
          </Section>}
          {can('card_menu') && <Section title="JUOMAT" defaultOpen={parseDrinkService(formData.drinkService).length > 0 || !!formData.drinkNotes}>
            {(() => {
              const selected = parseDrinkService(formData.drinkService);
              const toggleDrink = (opt) => {
                const newList = selected.includes(opt)
                  ? selected.filter(d => d !== opt)
                  : [...selected, opt];
                handleInputChange('drinkService', newList);
              };
              return (
                <div>
                  <div style={{ ...S.label, marginBottom: 6 }}>JUOMATAPA</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {DRINK_OPTIONS.map(opt => {
                      const active = selected.includes(opt);
                      return (
                        <div key={opt} onClick={() => toggleDrink(opt)} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          border: active ? '2px solid #ddd' : '1px solid #555',
                          background: active ? '#ddd' : '#1e1e1e',
                          color: active ? '#111' : '#999',
                          padding: '4px 10px', cursor: 'pointer',
                          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                          transition: 'all 0.15s',
                        }}>
                          <span style={{
                            width: 14, height: 14,
                            border: active ? '2px solid #111' : '2px solid #666',
                            background: active ? '#111' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, color: active ? '#ddd' : 'transparent', flexShrink: 0,
                          }}>{active ? '✓' : ''}</span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                  {selected.includes('Drinkkilippuja') && (
                    <div style={{ border: '1px solid #444', padding: 10, marginBottom: 8, background: '#111' }}>
                      <div style={{ ...S.label, marginBottom: 6 }}>DRINKKILIPPUJEN LÄHDE</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[{ value: 'asiakas', label: 'ASIAKKAALTA' }, { value: 'me', label: 'MEILTÄ' }].map(opt => {
                          const active = formData.drinkTicketSource === opt.value;
                          return (
                            <div key={opt.value} onClick={() => handleInputChange('drinkTicketSource', opt.value)} style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              border: active ? '2px solid #ddd' : '1px solid #555',
                              background: active ? '#ddd' : '#1e1e1e',
                              color: active ? '#111' : '#999',
                              padding: '6px 14px', cursor: 'pointer',
                              fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                            }}>
                              <span style={{
                                width: 12, height: 12, borderRadius: '50%',
                                border: active ? '2px solid #111' : '2px solid #666',
                                background: active ? '#111' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#ddd' }} />}
                              </span>
                              {opt.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selected.length > 0 && (
                    <div style={{ marginBottom: 6, fontSize: 11, color: '#999' }}>Valittu: {selected.join(', ')}</div>
                  )}
                  <div style={{ ...S.label, marginBottom: 4 }}>JUOMIEN LISÄTIEDOT</div>
                  <textarea
                    value={formData.drinkNotes || ''}
                    onChange={e => handleInputChange('drinkNotes', e.target.value)}
                    style={{ ...S.input, width: '100%', minHeight: 50, boxSizing: 'border-box', fontFamily: 'inherit' }}
                    placeholder="Esim. drinkkilippujen määrä, erityistoiveet, alkoholittomat vaihtoehdot..."
                  />
                </div>
              );
            })()}
          </Section>}
          {can('card_decorations') && <Section title="DEKORAATIOT" defaultOpen={!!formData.decorations}>{EF({ label: "", field: "decorations", textarea: true })}</Section>}
          {can('card_logistics') && <Section title="LOGISTIIKKA" defaultOpen={!!formData.logistics}>{EF({ label: "", field: "logistics", textarea: true })}</Section>}
          {can('card_order') && <Section title="TILAUS" defaultOpen={!!formData.orderLink}>
            {EF({ label: "Google Drive linkki", field: "orderLink", type: "url" })}
            {EF({ label: "Tilauksen lisätiedot", field: "orderNotes", textarea: true })}
          </Section>}
          {can('card_during') && <Section title="TAPAHTUMAN AIKANA" defaultOpen={!!formData.duringEvent}>
            {EF({ label: "Ohjeet ja tehtävät tapahtuman aikana", field: "duringEvent", textarea: true })}
          </Section>}
          {can('card_pricing') && <Section title="HINNOITTELU" defaultOpen={true}>
            {[['Ruoka', 'food', 'foodPrice'], ['Juomat', 'drinks', 'drinksPrice'], ['Tekniikka', 'tech', 'techPrice'], ['Ohjelma', 'program', 'programPrice']].map(([label, desc, price]) => (
              <div key={desc} style={S.formGrid}>{EF({ label, field: desc })}{EF({ label: `${label} hinta (€)`, field: price, type: "number" })}</div>
            ))}
          </Section>}
          {can('card_feedback') && <Section title="PALAUTE" defaultOpen={!!formData.feedback}>
            {EF({ label: "Asiakaspalaute ja omat huomiot", field: "feedback", textarea: true })}
          </Section>}
          {can('card_notes') && <Section title="MUISTIINPANOT" defaultOpen={!!formData.notes || notes.length > 0} count={notes.length + (formData.notes ? 1 : 0)}>
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
                    {note.title && <div style={{ fontSize: 13, fontWeight: 700, color: '#ddd', marginBottom: 4, textTransform: 'uppercase' }}>{note.title}</div>}
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
                    {assignedWorkers.map(w => (
                      <option key={w.id} value={w.id}>@{w.first_name} {w.last_name} (työntekijä)</option>
                    ))}
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
          </Section>}
        </div>
      ) : (
        /* ===== VIEW MODE — collapsible sections ===== */
        <div>
          <Section title="PERUSTIEDOT" defaultOpen={true}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {[
                ['Nimi', event?.name], ['Tyyppi', event?.type], ['Status', event?.status],
                ['Alkupäivä', event?.date ? new Date(event.date).toLocaleDateString('fi-FI') : '-'],
                ['Loppupäivä', event?.end_date ? new Date(event.end_date).toLocaleDateString('fi-FI') : '-'],
                ['Aika', `${event?.start_time || ''}${event?.end_time ? ' – ' + event.end_time : ''}`],
                ['Sijainti', event?.location_name], ['Pax', event?.guest_count],
                ['Kieli', event?.language],
                ...(can('card_contacts') ? [['Yritys', event?.company], ['Yhteystieto', event?.contact], ['Varaaja', event?.booker]] : []),
              ].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 6 }}>
                  <div style={S.label}>{label}</div>
                  <div style={{ fontSize: 13 }}>{val || '-'}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* TYÖNTEKIJÄT */}
          {can('card_workers') && <Section title="TYÖNTEKIJÄT" defaultOpen={true} count={assignedWorkers.length}>
            {assignedWorkers.length === 0 && !showAddWorker && (
              <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Ei lisättyjä työntekijöitä</div>
            )}

            {/* Worker list — booking/shift style */}
            {assignedWorkers.map(worker => {
              const shiftRole = worker.assignment_role || 'staff';
              const ROLE_LABELS = { staff: 'Henkilökunta', kitchen: 'Keittiö', service: 'Tarjoilu', setup: 'Rakennus', host: 'Juontaja', other: 'Muu' };
              return (
                <div key={worker.id} style={{ borderBottom: '1px solid #333', padding: '8px 0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {/* Time column */}
                  <div style={{ flex: '0 0 90px', textAlign: 'center' }}>
                    {worker.start_time || worker.end_time ? (
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1 }}>
                        {worker.start_time || '??'}<span style={{ color: '#555' }}>–</span>{worker.end_time || '??'}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: '#555' }}>Ei aikaa</div>
                    )}
                  </div>
                  {/* Info column */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{worker.first_name} {worker.last_name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ ...S.tag(false), fontSize: 9, padding: '1px 6px' }}>{ROLE_LABELS[shiftRole] || shiftRole}</span>
                    </div>
                    {worker.assignment_notes && (
                      <div style={{ fontSize: 11, color: '#888', marginTop: 3, fontStyle: 'italic' }}>{worker.assignment_notes}</div>
                    )}
                  </div>
                  {/* Remove button */}
                  {can('action_edit') && <button onClick={() => removeWorker(worker.id)} style={{ ...S.btnSmall, fontSize: 10, padding: '2px 6px', flex: '0 0 auto' }}>✕</button>}
                </div>
              );
            })}

            {/* Add worker — booking form */}
            {can('action_edit') && showAddWorker ? (
              <div style={{ border: '1px solid #555', padding: 12, marginTop: 8, background: '#1a1a1a' }}>
                <div style={{ ...S.label, marginBottom: 8 }}>UUSI VUORO</div>
                {availableWorkers.length === 0 ? (
                  <div style={{ color: '#666', fontSize: 12 }}>Kaikki työntekijät on jo lisätty</div>
                ) : (
                  <>
                    {/* Row 1: Worker select */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>HENKILÖ</div>
                      <select
                        value={newShift.userId}
                        onChange={e => setNewShift({ ...newShift, userId: e.target.value })}
                        style={S.selectFull}
                      >
                        <option value="">Valitse työntekijä...</option>
                        {availableWorkers.map(u => (
                          <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Row 2: Time + Role */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>ALKAA</div>
                        <input
                          type="time"
                          value={newShift.start_time}
                          onChange={e => setNewShift({ ...newShift, start_time: e.target.value })}
                          style={S.inputFull}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>LOPPUU</div>
                        <input
                          type="time"
                          value={newShift.end_time}
                          onChange={e => setNewShift({ ...newShift, end_time: e.target.value })}
                          style={S.inputFull}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>ROOLI</div>
                        <select
                          value={newShift.role}
                          onChange={e => setNewShift({ ...newShift, role: e.target.value })}
                          style={S.selectFull}
                        >
                          <option value="staff">Henkilökunta</option>
                          <option value="kitchen">Keittiö</option>
                          <option value="service">Tarjoilu</option>
                          <option value="setup">Rakennus</option>
                          <option value="host">Juontaja</option>
                          <option value="other">Muu</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Notes */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>LISÄTIEDOT</div>
                      <input
                        value={newShift.notes}
                        onChange={e => setNewShift({ ...newShift, notes: e.target.value })}
                        style={S.inputFull}
                        placeholder="Esim. tuo omat keittiövaatteet..."
                      />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { if (newShift.userId) addWorker(newShift); }}
                        disabled={!newShift.userId}
                        style={{ ...S.btnBlack, opacity: newShift.userId ? 1 : 0.4 }}
                      >LISÄÄ VUORO</button>
                      <button onClick={() => { setShowAddWorker(false); setNewShift({ userId: '', start_time: '', end_time: '', role: 'staff', notes: '' }); }} style={S.btnWire}>PERUUTA</button>
                    </div>
                  </>
                )}
              </div>
            ) : can('action_edit') ? (
              <button onClick={() => setShowAddWorker(true)} style={{ ...S.btnSmall, marginTop: 8 }}>+ LISÄÄ VUORO</button>
            ) : null}
          </Section>}

          {can('card_goal') && <Section title="TAVOITE" defaultOpen={!!event?.goal}><TextBlock text={event?.goal} /></Section>}
          {can('card_attention') && <Section title="HUOMIOITAVAA" defaultOpen={!!event?.attentionNotes}><TextBlock text={event?.attentionNotes} /></Section>}
          {can('card_erv') && <Section title="ERV (ALLERGIAT/DIEETIT)" defaultOpen={!!event?.erv}>
            {(() => {
              const parsed = parseErv(event?.erv);
              return (
                <div>
                  {parsed.allergens.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {parsed.allergens.map(a => (
                        <span key={a} style={{ border: '2px solid #ddd', background: '#ddd', color: '#111', padding: '4px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{a}</span>
                      ))}
                    </div>
                  )}
                  {parsed.notes && <TextBlock text={parsed.notes} />}
                  {!event?.erv && <div style={{ color: '#666', fontSize: 12 }}>Ei erityisruokavalioita</div>}
                </div>
              );
            })()}
          </Section>}
          {can('card_schedule') && <Section title="AIKATAULU" defaultOpen={!!event?.schedule}><TextBlock text={event?.schedule} /></Section>}

          {/* MENU — with editable link + attachments */}
          {can('card_menu') && <Section title="MENU" defaultOpen={!!event?.menu || menuAttachments.length > 0}>
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
          </Section>}

          {/* JUOMAT — drink service options */}
          {can('card_menu') && <Section title="JUOMAT" defaultOpen={parseDrinkService(event?.drinkService).length > 0 || !!event?.drinkNotes}>
            {(() => {
              const selected = parseDrinkService(event?.drinkService);
              return (
                <div>
                  {selected.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {selected.map(d => (
                        <span key={d} style={{ border: '2px solid #ddd', background: '#ddd', color: '#111', padding: '4px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{d}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Ei valittua juomatapaa</div>
                  )}
                  {selected.includes('Drinkkilippuja') && event?.drinkTicketSource && (
                    <div style={{ marginBottom: 8, padding: '6px 10px', border: '1px solid #444', background: '#1a1a1a', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Drinkkilippujen lähde:</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#ddd' }}>
                        {event.drinkTicketSource === 'asiakas' ? 'ASIAKKAALTA' : event.drinkTicketSource === 'me' ? 'MEILTÄ' : event.drinkTicketSource}
                      </span>
                    </div>
                  )}
                  {event?.drinkNotes && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #333' }}>
                      <div style={{ ...S.label, marginBottom: 4 }}>LISÄTIEDOT</div>
                      <TextBlock text={event.drinkNotes} />
                    </div>
                  )}
                </div>
              );
            })()}
          </Section>}

          {can('card_decorations') && <Section title="DEKORAATIOT" defaultOpen={!!event?.decorations}><TextBlock text={event?.decorations} /></Section>}
          {can('card_logistics') && <Section title="LOGISTIIKKA" defaultOpen={!!event?.logistics}><TextBlock text={event?.logistics} /></Section>}

          {/* ORDER — with editable link + attachments */}
          {can('card_order') && <Section title="TILAUS" defaultOpen={!!event?.orderLink || orderAttachments.length > 0}>
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
          </Section>}

          {can('card_materials') && <Section title="MATERIAALIT / LIITTEET" defaultOpen={materials.length > 0} count={materials.length}>
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
          </Section>}

          {can('card_during') && <Section title="TAPAHTUMAN AIKANA" defaultOpen={!!event?.duringEvent}><TextBlock text={event?.duringEvent} /></Section>}

          {can('card_pricing') && <Section title="HINNOITTELU" defaultOpen={total > 0}>
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
          </Section>}

          {can('card_feedback') && <Section title="PALAUTE" defaultOpen={!!event?.feedback}><TextBlock text={event?.feedback} /></Section>}

          {can('card_tasks') && <Section title="TEHTÄVÄT" defaultOpen={true} count={eventTasks.length}>
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
                    {assignedWorkers.length > 0 && <option disabled style={{ color: '#666', fontStyle: 'italic' }}>— Tapahtuman työntekijät —</option>}
                    {assignedWorkers.map(w => (
                      <option key={w.id} value={w.id}>{w.first_name} {w.last_name}</option>
                    ))}
                    {allSystemUsers.filter(u => !assignedIds.has(u.id)).length > 0 && <option disabled style={{ color: '#666', fontStyle: 'italic' }}>— Muut käyttäjät —</option>}
                    {allSystemUsers.filter(u => !assignedIds.has(u.id)).map(u => (
                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                    ))}
                    {persons.length > 0 && <option disabled style={{ color: '#666', fontStyle: 'italic' }}>— Kontaktit —</option>}
                    {persons.map(p => (
                      <option key={`p-${p.id}`} value={p.id}>{p.first_name} {p.last_name}</option>
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
                    <span style={{ fontSize: 10, color: '#888', marginTop: 2 }}>→ {(() => { const w = assignedWorkers.find(w => w.id === task.assigned_to) || persons.find(p => p.id === task.assigned_to); return w ? `${w.first_name} ${w.last_name}` : 'Tuntematon'; })()}</span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: '#999', marginRight: 8 }}>{task.priority}</span>
                <span style={{ fontSize: 10, color: '#999', marginRight: 8 }}>{task.status}</span>
                <button onClick={() => onDeleteTask?.(task.id)} style={{ ...S.btnSmall, fontSize: 10, padding: '2px 6px', flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </Section>}

          {/* MUISTIINPANOT — uses global notes system */}
          {can('card_notes') && <Section title="MUISTIINPANOT" defaultOpen={true} count={notes.length + (event?.notes ? 1 : 0)}>
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
                {note.title && <div style={{ fontSize: 13, fontWeight: 700, color: '#ddd', marginBottom: 4, textTransform: 'uppercase' }}>{note.title}</div>}
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
                    {assignedWorkers.map(w => (
                      <option key={w.id} value={w.id}>@{w.first_name} {w.last_name} (työntekijä)</option>
                    ))}
                    {persons.map(p => (
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
          </Section>}
        </div>
      )}
    </div>
  );
}
