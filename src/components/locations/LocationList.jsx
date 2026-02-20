import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import S from '../../styles/theme';

const FILE_TYPES = [
  { key: 'floorplan', label: 'POHJAPIIRROS' },
  { key: 'photo', label: 'KUVA' },
  { key: 'tech_spec', label: 'TEKNISET TIEDOT' },
  { key: 'branding', label: 'BRÄNDIMATERIAALI' },
  { key: 'menu', label: 'MENU / HINNASTO' },
  { key: 'contract', label: 'SOPIMUS' },
  { key: 'other', label: 'MUU' },
];

// Collapsible section (pomppuvalikko) — same pattern as EventCard
const Section = ({ title, children, defaultOpen = false, count }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #444' }}>
      <div
        style={{ ...S.flexBetween, padding: '8px 12px', cursor: 'pointer', background: '#1a1a1a' }}
        onClick={() => setOpen(!open)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#666' }}>{open ? '▼' : '▶'}</span>
          <span style={{ ...S.label, marginBottom: 0 }}>{title}</span>
          {count !== undefined && <span style={{ fontSize: 10, color: '#666' }}>({count})</span>}
        </div>
      </div>
      {open && <div style={{ padding: '12px' }}>{children}</div>}
    </div>
  );
};

const DriveLink = ({ url, label }) => {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#ddd', fontSize: 12, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      ↗ {label || 'AVAA'}
    </a>
  );
};

// Inline-editable Drive link (no full edit mode needed)
const EditableDriveLink = ({ url, label, onSave }) => {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(url || '');

  const save = () => {
    onSave(value);
    setEditMode(false);
  };

  if (editMode) {
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
        <button onClick={() => { setValue(url || ''); setEditMode(false); }} style={{ ...S.btnSmall, fontSize: 10, padding: '3px 8px', borderColor: '#666', color: '#666' }}>✕</button>
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
      <button onClick={() => setEditMode(true)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 11, padding: '2px 4px' }}>
        {url ? '✎' : '+ LINKKI'}
      </button>
    </div>
  );
};

const LocationList = ({ locations = [], events = [], onEventClick, onUpdateLocation, onAddFile, onRemoveFile, onGetFiles }) => {
  const { profile } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [locationFiles, setLocationFiles] = useState({});
  const [showAddFile, setShowAddFile] = useState(false);
  const [newFile, setNewFile] = useState({ name: '', type: 'other', driveLink: '' });
  const fileInputRef = useRef(null);
  const isAdmin = profile?.role === 'admin';

  // Load files when expanding a location
  useEffect(() => {
    if (expandedId && onGetFiles && !locationFiles[expandedId]) {
      onGetFiles(expandedId).then(files => {
        setLocationFiles(prev => ({ ...prev, [expandedId]: files || [] }));
      });
    }
  }, [expandedId, onGetFiles]);

  const getUpcomingEvents = (locationId) => {
    const now = new Date();
    return events
      .filter(e => e.location_id === locationId && new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);
  };

  const getPastEvents = (locationId) => {
    const now = new Date();
    return events
      .filter(e => e.location_id === locationId && new Date(e.date) < now)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  const handleExpand = (locationId) => {
    if (expandedId === locationId) {
      setExpandedId(null);
      setEditing(false);
    } else {
      setExpandedId(locationId);
      setEditing(false);
    }
  };

  const startEdit = (location) => {
    setEditData({ ...location });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (onUpdateLocation && expandedId) {
      await onUpdateLocation(expandedId, editData);
      setEditing(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData({});
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !expandedId) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const fileData = {
        name: newFile.name || file.name,
        type: newFile.type || 'other',
        driveLink: newFile.driveLink || '',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: ev.target.result,
      };
      if (onAddFile) {
        const added = await onAddFile(expandedId, fileData);
        setLocationFiles(prev => ({
          ...prev,
          [expandedId]: [...(prev[expandedId] || []), added],
        }));
      }
      setShowAddFile(false);
      setNewFile({ name: '', type: 'other', driveLink: '' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addFileLink = async () => {
    if (!newFile.name || !expandedId) return;
    const fileData = {
      name: newFile.name,
      type: newFile.type || 'other',
      driveLink: newFile.driveLink || '',
    };
    if (onAddFile) {
      const added = await onAddFile(expandedId, fileData);
      setLocationFiles(prev => ({
        ...prev,
        [expandedId]: [...(prev[expandedId] || []), added],
      }));
    }
    setShowAddFile(false);
    setNewFile({ name: '', type: 'other', driveLink: '' });
  };

  const handleRemoveFile = async (fileId) => {
    if (!expandedId || !onRemoveFile) return;
    await onRemoveFile(expandedId, fileId);
    setLocationFiles(prev => ({
      ...prev,
      [expandedId]: (prev[expandedId] || []).filter(f => f.id !== fileId),
    }));
  };

  const expandedLocation = locations.find(l => l.id === expandedId);
  const files = locationFiles[expandedId] || [];
  const upcoming = expandedId ? getUpcomingEvents(expandedId) : [];
  const past = expandedId ? getPastEvents(expandedId) : [];

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: "none" }}>
      <div style={{ ...S.pad, borderBottom: "1px solid #444" }}>
        <div style={S.label}>SIJAINNIT ({locations.length})</div>
      </div>

      {/* Location cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: 2 }}>
        {locations.map(location => (
          <div
            key={location.id}
            onClick={() => handleExpand(location.id)}
            style={{
              border: expandedId === location.id ? '2px solid #ddd' : '2px solid #444',
              background: expandedId === location.id ? '#2a2a2a' : '#1e1e1e',
              padding: 20,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{
              width: 60, height: 60, margin: '0 auto 12px',
              border: '2px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#666',
            }}>
              {(location.name || '?')[0]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{location.name}</div>
            <div style={{ color: '#999', fontSize: 11, marginTop: 4 }}>{location.type}</div>
            <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
              Kapasiteetti: {location.capacity || 'N/A'}
            </div>
          </div>
        ))}
      </div>

      {/* Full-width expansion panel BELOW the grid */}
      {expandedLocation && (
        <div style={{ borderTop: '2px solid #ddd', background: '#1e1e1e' }}>
          {/* Location header */}
          <div style={{ ...S.flexBetween, padding: '12px 16px', borderBottom: '1px solid #444', background: '#2a2a2a' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{expandedLocation.name}</div>
              <div style={{ color: '#999', fontSize: 11, marginTop: 2 }}>{expandedLocation.type} — Kapasiteetti: {expandedLocation.capacity || 'N/A'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isAdmin && !editing && (
                <button onClick={(e) => { e.stopPropagation(); startEdit(expandedLocation); }} style={S.btnSmall}>MUOKKAA</button>
              )}
              {editing && (
                <>
                  <button onClick={saveEdit} style={S.btnBlack}>TALLENNA</button>
                  <button onClick={cancelEdit} style={S.btnWire}>PERUUTA</button>
                </>
              )}
              <button onClick={() => { setExpandedId(null); setEditing(false); }} style={S.btnSmall}>SULJE ✕</button>
            </div>
          </div>

          {/* PERUSTIEDOT */}
          <Section title="PERUSTIEDOT" defaultOpen={true}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={S.formGrid}>
                  <div>
                    <div style={S.label}>NIMI</div>
                    <input style={S.inputFull} value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div>
                    <div style={S.label}>TYYPPI</div>
                    <input style={S.inputFull} value={editData.type || ''} onChange={e => setEditData({ ...editData, type: e.target.value })} />
                  </div>
                </div>
                <div style={S.formGrid}>
                  <div>
                    <div style={S.label}>KAPASITEETTI</div>
                    <textarea style={{ ...S.inputFull, minHeight: 60, fontFamily: 'inherit', resize: 'vertical' }} value={editData.capacity || ''} onChange={e => setEditData({ ...editData, capacity: e.target.value })} placeholder="Esim. Istumaan 50-300 hlö, Seisomaan 50-650 hlö" />
                  </div>
                  <div>
                    <div style={S.label}>OSOITE</div>
                    <input style={S.inputFull} value={editData.address || ''} onChange={e => setEditData({ ...editData, address: e.target.value })} />
                  </div>
                </div>
                <div style={S.formGrid}>
                  <div>
                    <div style={S.label}>YHTEYSHENKILÖ</div>
                    <input style={S.inputFull} value={editData.contactPerson || ''} onChange={e => setEditData({ ...editData, contactPerson: e.target.value })} />
                  </div>
                  <div>
                    <div style={S.label}>SÄHKÖPOSTI</div>
                    <input style={S.inputFull} value={editData.contactEmail || ''} onChange={e => setEditData({ ...editData, contactEmail: e.target.value })} />
                  </div>
                </div>
                <div style={S.formGrid}>
                  <div>
                    <div style={S.label}>PUHELIN</div>
                    <input style={S.inputFull} value={editData.contactPhone || ''} onChange={e => setEditData({ ...editData, contactPhone: e.target.value })} />
                  </div>
                  <div>
                    <div style={S.label}>DRIVE-LINKKI</div>
                    <input style={S.inputFull} value={editData.driveLink || ''} onChange={e => setEditData({ ...editData, driveLink: e.target.value })} placeholder="https://drive.google.com/..." />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={S.formGrid}>
                  <div style={S.cardField}>
                    <div style={S.label}>OSOITE</div>
                    <div style={S.value}>{expandedLocation.address || '—'}</div>
                  </div>
                  <div style={S.cardField}>
                    <div style={S.label}>KAPASITEETTI</div>
                    <div style={S.value}>{expandedLocation.capacity || '—'}</div>
                  </div>
                </div>
                <div style={S.formGrid}>
                  <div style={S.cardField}>
                    <div style={S.label}>YHTEYSHENKILÖ</div>
                    <div style={S.value}>{expandedLocation.contactPerson || '—'}</div>
                  </div>
                  <div style={S.cardField}>
                    <div style={S.label}>SÄHKÖPOSTI</div>
                    <div style={S.value}>{expandedLocation.contactEmail || '—'}</div>
                  </div>
                </div>
                <div style={S.formGrid}>
                  <div style={S.cardField}>
                    <div style={S.label}>PUHELIN</div>
                    <div style={S.value}>{expandedLocation.contactPhone || '—'}</div>
                  </div>
                  <div style={S.cardField}>
                    <div style={S.label}>DRIVE</div>
                    <EditableDriveLink
                      url={expandedLocation.driveLink}
                      label="AVAA KANSIO"
                      onSave={(val) => {
                        if (onUpdateLocation) {
                          onUpdateLocation(expandedId, { driveLink: val });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* KUVAUS */}
          <Section title="KUVAUS" defaultOpen={true}>
            {editing ? (
              <textarea
                style={{ ...S.inputFull, minHeight: 80, resize: 'vertical' }}
                value={editData.description || ''}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
              />
            ) : (
              <div style={{ color: '#999', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                {expandedLocation.description || 'Ei kuvausta'}
              </div>
            )}
          </Section>

          {/* VARUSTEET & TEKNIIKKA */}
          <Section title="VARUSTEET & TEKNIIKKA">
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={S.label}>VARUSTEET</div>
                  <textarea
                    style={{ ...S.inputFull, minHeight: 60, resize: 'vertical' }}
                    value={editData.equipment || ''}
                    onChange={e => setEditData({ ...editData, equipment: e.target.value })}
                    placeholder="Esim: Uuni x2, induktioliesi x8, astianpesukone..."
                  />
                </div>
                <div>
                  <div style={S.label}>AV-TEKNIIKKA</div>
                  <textarea
                    style={{ ...S.inputFull, minHeight: 60, resize: 'vertical' }}
                    value={editData.techSpecs || ''}
                    onChange={e => setEditData({ ...editData, techSpecs: e.target.value })}
                    placeholder="Esim: Projektori, valkokangas, PA-järjestelmä..."
                  />
                </div>
                <div>
                  <div style={S.label}>KEITTIÖVARUSTELU</div>
                  <textarea
                    style={{ ...S.inputFull, minHeight: 60, resize: 'vertical' }}
                    value={editData.kitchenEquipment || ''}
                    onChange={e => setEditData({ ...editData, kitchenEquipment: e.target.value })}
                    placeholder="Keittiön erityisvarusteet..."
                  />
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={S.label}>VARUSTEET</div>
                  <div style={{ color: '#999', fontSize: 12, whiteSpace: 'pre-wrap', marginTop: 4 }}>
                    {expandedLocation.equipment || '—'}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={S.label}>AV-TEKNIIKKA</div>
                  <div style={{ color: '#999', fontSize: 12, whiteSpace: 'pre-wrap', marginTop: 4 }}>
                    {expandedLocation.techSpecs || '—'}
                  </div>
                </div>
                <div>
                  <div style={S.label}>KEITTIÖVARUSTELU</div>
                  <div style={{ color: '#999', fontSize: 12, whiteSpace: 'pre-wrap', marginTop: 4 }}>
                    {expandedLocation.kitchenEquipment || '—'}
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* TIEDOSTOT / MATERIAALIT */}
          <Section title="TIEDOSTOT / MATERIAALIT" count={files.length}>
            {files.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {files.map(file => {
                  const isImage = file.file_type?.startsWith('image/');
                  const isPdf = file.file_type === 'application/pdf' || file.file_name?.toLowerCase().endsWith('.pdf');
                  const isViewable = isImage || isPdf;
                  return (
                    <div key={file.id} style={{ borderBottom: '1px solid #333', padding: '8px 0' }}>
                      <div style={{ ...S.flexBetween }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ ...S.tag(false), fontSize: 9, padding: '2px 6px' }}>
                            {(FILE_TYPES.find(t => t.key === file.file_type) || {}).label || 'MUU'}
                          </span>
                          <span style={{ fontSize: 12 }}>{file.file_name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {file.file_path && file.file_path.startsWith('http') && (
                            isViewable ? (
                              <button
                                onClick={() => {
                                  const w = window.open('', '_blank');
                                  if (isImage) {
                                    w.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111"><img src="${file.file_path}" style="max-width:100%;max-height:100vh" /></body></html>`);
                                  } else {
                                    w.document.write(`<html><body style="margin:0"><iframe src="${file.file_path}" style="width:100%;height:100vh;border:none"></iframe></body></html>`);
                                  }
                                  w.document.title = file.file_name;
                                }}
                                style={{ background: 'none', border: '1px solid #555', color: '#ddd', fontSize: 11, padding: '2px 8px', cursor: 'pointer' }}
                              >NÄYTÄ</button>
                            ) : (
                              <a href={file.file_path} target="_blank" rel="noopener noreferrer" style={{ color: '#ddd', fontSize: 11, textDecoration: 'underline' }}>
                                {file.file_path.includes('drive.google.com') ? 'DRIVE' : 'AVAA'}
                              </a>
                            )
                          )}
                          {isAdmin && (
                            <span onClick={() => handleRemoveFile(file.id)} style={{ color: '#666', cursor: 'pointer', fontSize: 11 }}>✕</span>
                          )}
                        </div>
                      </div>
                      {isImage && file.file_path?.startsWith('http') && (
                        <img src={file.file_path} alt={file.file_name} style={{ marginTop: 6, maxWidth: '100%', maxHeight: 120, objectFit: 'contain', border: '1px solid #333', borderRadius: 2 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isAdmin && !showAddFile && (
              <button onClick={() => setShowAddFile(true)} style={S.btnSmall}>+ LISÄÄ TIEDOSTO</button>
            )}

            {isAdmin && showAddFile && (
              <div style={{ border: '1px solid #444', padding: 12, marginTop: 8 }}>
                <div style={{ ...S.formGrid, marginBottom: 8 }}>
                  <div>
                    <div style={S.label}>NIMI</div>
                    <input
                      style={S.inputFull}
                      value={newFile.name}
                      onChange={e => setNewFile({ ...newFile, name: e.target.value })}
                      placeholder="Tiedoston nimi"
                    />
                  </div>
                  <div>
                    <div style={S.label}>TYYPPI</div>
                    <select
                      style={S.selectFull}
                      value={newFile.type}
                      onChange={e => setNewFile({ ...newFile, type: e.target.value })}
                    >
                      {FILE_TYPES.map(t => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={S.label}>DRIVE-LINKKI (valinnainen)</div>
                  <input
                    style={S.inputFull}
                    value={newFile.driveLink}
                    onChange={e => setNewFile({ ...newFile, driveLink: e.target.value })}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addFileLink} style={S.btnSmall}>LISÄÄ LINKKI</button>
                  <button onClick={() => fileInputRef.current?.click()} style={S.btnSmall}>LATAA TIEDOSTO</button>
                  <button onClick={() => { setShowAddFile(false); setNewFile({ name: '', type: 'other', driveLink: '' }); }} style={{ ...S.btnSmall, borderColor: '#666', color: '#666' }}>PERUUTA</button>
                </div>
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
              </div>
            )}
          </Section>

          {/* MUISTIINPANOT */}
          <Section title="MUISTIINPANOT">
            {editing ? (
              <textarea
                style={{ ...S.inputFull, minHeight: 60, resize: 'vertical' }}
                value={editData.notes || ''}
                onChange={e => setEditData({ ...editData, notes: e.target.value })}
                placeholder="Sijaintiin liittyviä muistiinpanoja..."
              />
            ) : (
              <div style={{ color: '#999', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                {expandedLocation.notes || 'Ei muistiinpanoja'}
              </div>
            )}
          </Section>

          {/* TULEVAT TAPAHTUMAT */}
          <Section title="TULEVAT TAPAHTUMAT" count={upcoming.length} defaultOpen={upcoming.length > 0}>
            {upcoming.length > 0 ? (
              <>
                <div style={S.rowHeader}>
                  <span style={S.col(1)}>PVM</span>
                  <span style={S.col(2)}>NIMI</span>
                  <span style={S.col(1)}>TYYPPI</span>
                  <span style={S.col(1)}>VIERAAT</span>
                  <span style={S.col(1)}>STATUS</span>
                </div>
                {upcoming.map(event => (
                  <div key={event.id} onClick={() => onEventClick?.(event)} style={{ ...S.row, cursor: 'pointer' }}>
                    <span style={S.col(1)}>{new Date(event.date).toLocaleDateString('fi-FI')}</span>
                    <span style={{ ...S.col(2), fontWeight: 600 }}>{event.name}</span>
                    <span style={{ ...S.col(1), fontSize: 11 }}>{event.type || ''}</span>
                    <span style={S.col(1)}>{event.guest_count || ''}</span>
                    <span style={S.col(1)}>
                      <span style={{ ...S.tag(false), fontSize: 9, padding: '1px 6px' }}>{event.status || ''}</span>
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ color: '#666', fontSize: 12 }}>Ei tulevia tapahtumia</div>
            )}
          </Section>

          {/* AIEMMAT TAPAHTUMAT */}
          <Section title="AIEMMAT TAPAHTUMAT" count={past.length}>
            {past.length > 0 ? (
              <>
                <div style={S.rowHeader}>
                  <span style={S.col(1)}>PVM</span>
                  <span style={S.col(2)}>NIMI</span>
                  <span style={S.col(1)}>TYYPPI</span>
                  <span style={S.col(1)}>VIERAAT</span>
                </div>
                {past.map(event => (
                  <div key={event.id} onClick={() => onEventClick?.(event)} style={{ ...S.row, cursor: 'pointer', color: '#666' }}>
                    <span style={S.col(1)}>{new Date(event.date).toLocaleDateString('fi-FI')}</span>
                    <span style={S.col(2)}>{event.name}</span>
                    <span style={{ ...S.col(1), fontSize: 11 }}>{event.type || ''}</span>
                    <span style={S.col(1)}>{event.guest_count || ''}</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ color: '#666', fontSize: 12 }}>Ei aiempia tapahtumia</div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
};

export default LocationList;
