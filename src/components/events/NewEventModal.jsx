import { useState, useEffect, useRef } from 'react';
import S from '../../styles/theme';
import { EVENT_TYPES, STATUSES, LOCATION_ORDER } from '../../utils/constants';

// Common restaurant allergens (EU 14 + dietary)
const COMMON_ALLERGENS = [
  'Gluteeniton', 'Laktoositon', 'Maidoton', 'Munaton',
  'Pähkinätön', 'Kala', 'Äyriäiset', 'Soijaton',
  'Vegaaninen', 'Kasvis', 'Sianlihaton',
];

// Drink service options
const DRINK_OPTIONS = [
  'Open Bar', 'Viinit ruoan kanssa', 'Drinkkilippuja', 'Kuohuviini',
  'Cocktails', 'Olutpaketti', 'Alkoholiton', 'Kahvi & tee',
];

// Generate 30-minute interval time options
const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const TimeSelect = ({ value, onChange, label }) => {
  const [customMode, setCustomMode] = useState(false);
  const isCustomValue = value && !TIME_OPTIONS.includes(value);

  const handleSelectChange = (val) => {
    if (val === '__CUSTOM__') {
      setCustomMode(true);
    } else {
      setCustomMode(false);
      onChange(val);
    }
  };

  if (customMode || isCustomValue) {
    return (
      <div>
        <div style={S.label}>{label}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="HH:MM"
            style={{ ...S.input, flex: 1, boxSizing: 'border-box' }}
          />
          <button
            onClick={() => { setCustomMode(false); onChange(''); }}
            style={{ ...S.btnSmall, padding: '3px 8px', fontSize: 10 }}
            title="Takaisin valikkoon"
          >
            ↩
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={S.label}>{label}</div>
      <select
        value={value}
        onChange={e => handleSelectChange(e.target.value)}
        style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}
      >
        <option value="">Valitse</option>
        {TIME_OPTIONS.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
        <option value="__CUSTOM__">Muu aika...</option>
      </select>
    </div>
  );
};

export default function NewEventModal({ onClose, onAdd, locations = [], prefilledDate = '' }) {
  // Sort locations by preferred order (uses includes for flexible matching)
  const sortedLocations = [...locations].sort((a, b) => {
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    const aIdx = LOCATION_ORDER.findIndex(keyword => aName.includes(keyword));
    const bIdx = LOCATION_ORDER.findIndex(keyword => bName.includes(keyword));
    return (aIdx >= 0 ? aIdx : 999) - (bIdx >= 0 ? bIdx : 999);
  });

  const [activeSection, setActiveSection] = useState('PERUSTIEDOT');
  const [formData, setFormData] = useState({
    name: '', type: '', date: prefilledDate, end_date: '', start_time: '', end_time: '',
    location_name: '', location_id: '', guest_count: '', language: '',
    company: '', booker: '', contact: '', clientName: '', status: '',
    goal: '', attentionNotes: '', allergens: [], ervNotes: '', schedule: '', menu: '',
    menuLink: '', menuAttachments: [], drinkService: [], drinkNotes: '', drinkTicketSource: '',
    decorations: '', logistics: '',
    orderLink: '', orderNotes: '', orderAttachments: [],
    materials: [], notes: '',
    food: '', foodPrice: '', drinks: '', drinksPrice: '',
    tech: '', techPrice: '', program: '', programPrice: ''
  });

  useEffect(() => {
    if (prefilledDate && !formData.date) {
      setFormData(prev => ({ ...prev, date: prefilledDate }));
    }
  }, [prefilledDate]);

  const handleInputChange = (field, value) => setFormData({ ...formData, [field]: value });

  const toggleDrinkOption = (opt) => {
    setFormData(prev => {
      const has = prev.drinkService.includes(opt);
      const newList = has ? prev.drinkService.filter(d => d !== opt) : [...prev.drinkService, opt];
      // Clear drinkTicketSource if Drinkkilippuja is deselected
      const clearTicket = opt === 'Drinkkilippuja' && has;
      return { ...prev, drinkService: newList, ...(clearTicket ? { drinkTicketSource: '' } : {}) };
    });
  };

  const toggleAllergen = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleLocationChange = (locName) => {
    const loc = locations.find(l => l.name === locName);
    setFormData(prev => ({ ...prev, location_name: locName, location_id: loc?.id || '' }));
  };

  const [validationError, setValidationError] = useState('');

  const handleSubmit = () => {
    if (!formData.name.trim()) { setValidationError('Tapahtuman nimi puuttuu'); setActiveSection('PERUSTIEDOT'); return; }
    if (!formData.date) { setValidationError('Päivämäärä puuttuu'); setActiveSection('PERUSTIEDOT'); return; }
    setValidationError('');
    onAdd(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '', type: '', date: prefilledDate, end_date: '', start_time: '', end_time: '',
      location_name: '', location_id: '', guest_count: '', language: '',
      company: '', booker: '', contact: '', clientName: '', status: '',
      goal: '', attentionNotes: '', allergens: [], ervNotes: '', schedule: '', menu: '',
      menuLink: '', menuAttachments: [], drinkService: [], drinkNotes: '', drinkTicketSource: '',
      decorations: '', logistics: '',
      orderLink: '', orderNotes: '', orderAttachments: [],
      materials: [], notes: '',
      food: '', foodPrice: '', drinks: '', drinksPrice: '',
      tech: '', techPrice: '', program: '', programPrice: ''
    });
  };

  const handleClose = () => { resetForm(); setActiveSection('PERUSTIEDOT'); onClose(); };

  // File upload refs and handlers
  const menuFileRef = useRef(null);
  const orderFileRef = useRef(null);
  const materialFileRef = useRef(null);

  const handleFileUpload = (field, e) => {
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
      setFormData(prev => ({ ...prev, [field]: [...arr, att] }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAttachment = (field, attId) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(a => a.id !== attId)
    }));
  };

  const tabs = ['PERUSTIEDOT', 'LISÄTIEDOT', 'HINNOITTELU'];

  return (
    <div style={S.modal} onClick={handleClose}>
      <div style={{ ...S.modalBox, maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div style={{ ...S.flexBetween, marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #ddd' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>UUSI TAPAHTUMA</span>
          <button onClick={handleClose} style={S.btnSmall}>✕</button>
        </div>

        <div style={{ ...S.flexWrap, gap: 4, marginBottom: 16 }}>
          {tabs.map(section => (
            <button key={section} onClick={() => setActiveSection(section)} style={activeSection === section ? S.btnBlack : S.btnSmall}>{section}</button>
          ))}
        </div>

        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeSection === 'PERUSTIEDOT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={S.label}>Tapahtuman nimi</div>
                <input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} placeholder="Nimi" />
              </div>
              <div style={S.formGrid}>
                <div>
                  <div style={S.label}>Tyyppi</div>
                  <select value={formData.type} onChange={e => handleInputChange('type', e.target.value)} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                    <option value="">Valitse</option>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div style={S.label}>Status</div>
                  <select value={formData.status} onChange={e => handleInputChange('status', e.target.value)} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                    <option value="">Valitse</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.formGrid}>
                <div>
                  <div style={S.label}>Alkupäivä</div>
                  <input type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={S.label}>Loppupäivä</div>
                  <input type="date" value={formData.end_date} onChange={e => handleInputChange('end_date', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={S.formGrid}>
                <TimeSelect value={formData.start_time} onChange={v => handleInputChange('start_time', v)} label="Alkaa" />
                <TimeSelect value={formData.end_time} onChange={v => handleInputChange('end_time', v)} label="Päättyy" />
              </div>
              <div style={S.formGrid}>
                <div>
                  <div style={S.label}>Sijainti</div>
                  {sortedLocations.length === 0 ? (
                    <div style={{ color: '#666', fontSize: 12, padding: '6px 0' }}>Ei sijainteja — lisää ensin sijainti Sijainnit-välilehdellä</div>
                  ) : (
                    <select value={formData.location_name} onChange={e => handleLocationChange(e.target.value)} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                      <option value="">Valitse sijainti ({sortedLocations.length})</option>
                      {sortedLocations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <div style={S.label}>Pax</div>
                  <input type="number" value={formData.guest_count} onChange={e => handleInputChange('guest_count', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={S.formGrid}>
                <div>
                  <div style={S.label}>Kieli</div>
                  <select value={formData.language} onChange={e => handleInputChange('language', e.target.value)} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                    <option value="">Valitse</option>
                    <option value="Suomi">Suomi</option>
                    <option value="Englanti">Englanti</option>
                  </select>
                </div>
                <div>
                  <div style={S.label}>Yritys</div>
                  <input value={formData.company} onChange={e => handleInputChange('company', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={S.formGrid}>
                <div>
                  <div style={S.label}>Yhteystieto</div>
                  <input value={formData.contact} onChange={e => handleInputChange('contact', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={S.label}>Varaaja</div>
                  <input value={formData.booker} onChange={e => handleInputChange('booker', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'LISÄTIEDOT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Tavoite', 'goal'], ['Huomioitavaa', 'attentionNotes']].map(([label, field]) => (
                <div key={field}>
                  <div style={S.label}>{label}</div>
                  <textarea value={formData[field]} onChange={e => handleInputChange(field, e.target.value)} style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder={label} />
                </div>
              ))}

              {/* Allergeenit / ERV */}
              <div>
                <div style={{ ...S.label, marginBottom: 6 }}>ERV / ALLERGEENIT</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {COMMON_ALLERGENS.map(a => {
                    const active = formData.allergens.includes(a);
                    return (
                      <div
                        key={a}
                        onClick={() => toggleAllergen(a)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          border: active ? '2px solid #ddd' : '1px solid #555',
                          background: active ? '#ddd' : '#1e1e1e',
                          color: active ? '#111' : '#999',
                          padding: '4px 10px', cursor: 'pointer',
                          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{
                          width: 14, height: 14,
                          border: active ? '2px solid #111' : '2px solid #666',
                          background: active ? '#111' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, color: active ? '#ddd' : 'transparent',
                          flexShrink: 0,
                        }}>
                          {active ? '✓' : ''}
                        </span>
                        {a}
                      </div>
                    );
                  })}
                </div>
                {formData.allergens.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#999' }}>
                    Valittu: {formData.allergens.join(', ')}
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <div style={S.label}>Lisätiedot allergioista</div>
                  <textarea value={formData.ervNotes} onChange={e => handleInputChange('ervNotes', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 50, boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Muut allergiat tai erityisruokavaliot..." />
                </div>
              </div>

              <div>
                <div style={S.label}>Aikataulu</div>
                <textarea value={formData.schedule} onChange={e => handleInputChange('schedule', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Aikataulu" />
              </div>

              {/* Menu + Drive link + files */}
              <div style={{ border: '1px solid #333', padding: 12, background: '#1a1a1a' }}>
                <div style={{ ...S.label, marginBottom: 6, fontWeight: 700 }}>MENU</div>
                <textarea value={formData.menu} onChange={e => handleInputChange('menu', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 8 }} placeholder="Menu kuvaus" />
                <div style={S.label}>Menu Drive -linkki</div>
                <input type="url" value={formData.menuLink} onChange={e => handleInputChange('menuLink', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box', marginBottom: 8 }} placeholder="https://drive.google.com/..." />
                {(formData.menuAttachments || []).map(att => (
                  <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #444', padding: 6, marginBottom: 4, fontSize: 12 }}>
                    <span>{att.fileName || att.name}</span>
                    <button onClick={() => removeAttachment('menuAttachments', att.id)} style={{ ...S.btnSmall, fontSize: 10, padding: '2px 6px' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => menuFileRef.current?.click()} style={S.btnSmall}>+ LATAA TIEDOSTO</button>
                <input ref={menuFileRef} type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload('menuAttachments', e)} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
              </div>

              {/* JUOMAT */}
              <div style={{ border: '1px solid #333', padding: 12, background: '#1a1a1a' }}>
                <div style={{ ...S.label, marginBottom: 6, fontWeight: 700 }}>JUOMAT</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {DRINK_OPTIONS.map(opt => {
                    const active = formData.drinkService.includes(opt);
                    return (
                      <div key={opt} onClick={() => toggleDrinkOption(opt)} style={{
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
                {formData.drinkService.includes('Drinkkilippuja') && (
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
                {formData.drinkService.length > 0 && (
                  <div style={{ marginBottom: 6, fontSize: 11, color: '#999' }}>Valittu: {formData.drinkService.join(', ')}</div>
                )}
                <div style={S.label}>Juomien lisätiedot</div>
                <textarea value={formData.drinkNotes} onChange={e => handleInputChange('drinkNotes', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 50, boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Esim. drinkkilippujen määrä, erityistoiveet, alkoholittomat vaihtoehdot..." />
              </div>

              <div>
                <div style={S.label}>Dekoraatiot</div>
                <textarea value={formData.decorations} onChange={e => handleInputChange('decorations', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Dekoraatiot" />
              </div>

              <div>
                <div style={S.label}>Logistiikka</div>
                <textarea value={formData.logistics} onChange={e => handleInputChange('logistics', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Logistiikka" />
              </div>

              {/* ORDER / TILAUS */}
              <div style={{ border: '1px solid #333', padding: 12, background: '#1a1a1a' }}>
                <div style={{ ...S.label, marginBottom: 6, fontWeight: 700 }}>TILAUS</div>
                <div style={S.label}>Google Drive -linkki</div>
                <input type="url" value={formData.orderLink} onChange={e => handleInputChange('orderLink', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box', marginBottom: 8 }} placeholder="https://drive.google.com/..." />
                <div style={S.label}>Tilauksen lisätiedot</div>
                <textarea value={formData.orderNotes} onChange={e => handleInputChange('orderNotes', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 50, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 8 }} placeholder="Lisätiedot" />
                {(formData.orderAttachments || []).map(att => (
                  <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #444', padding: 6, marginBottom: 4, fontSize: 12 }}>
                    <span>{att.fileName || att.name}</span>
                    <button onClick={() => removeAttachment('orderAttachments', att.id)} style={{ ...S.btnSmall, fontSize: 10, padding: '2px 6px' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => orderFileRef.current?.click()} style={S.btnSmall}>+ LATAA TIEDOSTO</button>
                <input ref={orderFileRef} type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload('orderAttachments', e)} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
              </div>

              {/* MATERIAALIT / LIITTEET */}
              <div style={{ border: '1px solid #333', padding: 12, background: '#1a1a1a' }}>
                <div style={{ ...S.label, marginBottom: 6, fontWeight: 700 }}>MATERIAALIT / LIITTEET</div>
                {(formData.materials || []).map(att => (
                  <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #444', padding: 6, marginBottom: 4, fontSize: 12 }}>
                    <span>{att.fileName || att.name}</span>
                    <button onClick={() => removeAttachment('materials', att.id)} style={{ ...S.btnSmall, fontSize: 10, padding: '2px 6px' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => materialFileRef.current?.click()} style={S.btnSmall}>+ LATAA TIEDOSTO</button>
                <input ref={materialFileRef} type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload('materials', e)} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
              </div>

              {/* Muistiinpanot */}
              <div>
                <div style={S.label}>Muistiinpanot</div>
                <textarea value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Yleiset muistiinpanot tapahtumalle" />
              </div>
            </div>
          )}

          {activeSection === 'HINNOITTELU' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Ruoka', 'food', 'foodPrice'], ['Juomat', 'drinks', 'drinksPrice'], ['Tekniikka', 'tech', 'techPrice'], ['Ohjelma', 'program', 'programPrice']].map(([label, descField, priceField]) => (
                <div key={descField} style={S.formGrid}>
                  <div>
                    <div style={S.label}>{label}</div>
                    <input value={formData[descField]} onChange={e => handleInputChange(descField, e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={S.label}>{label} hinta (€)</div>
                    <input type="number" value={formData[priceField]} onChange={e => handleInputChange(priceField, e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {validationError && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#4a1c1c', border: '1px solid #ff4444', color: '#ff6666', fontSize: 12, fontWeight: 600 }}>
            {validationError}
          </div>
        )}
        <div style={{ ...S.flex, ...S.gap, marginTop: 16, borderTop: '2px solid #444', paddingTop: 16 }}>
          <button onClick={handleSubmit} style={S.btnBlack}>LISÄÄ TAPAHTUMA</button>
          <button onClick={handleClose} style={S.btnWire}>PERUUTA</button>
        </div>
      </div>
    </div>
  );
}
