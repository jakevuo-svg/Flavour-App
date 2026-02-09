import { useState, useEffect } from 'react';
import S from '../../styles/theme';
import { EVENT_TYPES, STATUSES } from '../../utils/constants';

// Common restaurant allergens (EU 14 + dietary)
const COMMON_ALLERGENS = [
  'Gluteeniton', 'Laktoositon', 'Maidoton', 'Munaton',
  'Pähkinätön', 'Kala', 'Äyriäiset', 'Soijaton',
  'Selleri', 'Sinappi', 'Seesami', 'Lupiini',
  'Vegaaninen', 'Kasvis', 'Sianlihaton', 'Alkoholiton',
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
  const [activeSection, setActiveSection] = useState('PERUSTIEDOT');
  const [formData, setFormData] = useState({
    name: '', type: '', date: prefilledDate, start_time: '', end_time: '',
    location_name: '', location_id: '', guest_count: '', language: '',
    company: '', booker: '', contact: '', clientName: '', status: '',
    goal: '', attentionNotes: '', allergens: [], ervNotes: '', schedule: '', menu: '',
    menuLink: '', decorations: '', logistics: '',
    orderLink: '', orderNotes: '',
    notes: '',
    food: '', foodPrice: '', drinks: '', drinksPrice: '',
    tech: '', techPrice: '', program: '', programPrice: ''
  });

  useEffect(() => {
    if (prefilledDate && !formData.date) {
      setFormData(prev => ({ ...prev, date: prefilledDate }));
    }
  }, [prefilledDate]);

  const handleInputChange = (field, value) => setFormData({ ...formData, [field]: value });

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
    setFormData({ ...formData, location_name: locName, location_id: loc?.id || '' });
  };

  const handleSubmit = () => { onAdd(formData); resetForm(); };

  const resetForm = () => {
    setFormData({
      name: '', type: '', date: prefilledDate, start_time: '', end_time: '',
      location_name: '', location_id: '', guest_count: '', language: '',
      company: '', booker: '', contact: '', clientName: '', status: '',
      goal: '', attentionNotes: '', allergens: [], ervNotes: '', schedule: '', menu: '',
      menuLink: '', decorations: '', logistics: '',
      orderLink: '', orderNotes: '',
      notes: '',
      food: '', foodPrice: '', drinks: '', drinksPrice: '',
      tech: '', techPrice: '', program: '', programPrice: ''
    });
  };

  const handleClose = () => { resetForm(); setActiveSection('PERUSTIEDOT'); onClose(); };

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
                  <div style={S.label}>Päivämäärä</div>
                  <input type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div style={S.formGrid}>
                  <TimeSelect value={formData.start_time} onChange={v => handleInputChange('start_time', v)} label="Alkaa" />
                  <TimeSelect value={formData.end_time} onChange={v => handleInputChange('end_time', v)} label="Päättyy" />
                </div>
              </div>
              <div style={S.formGrid}>
                <div>
                  <div style={S.label}>Sijainti</div>
                  <select value={formData.location_name} onChange={e => handleLocationChange(e.target.value)} style={{ ...S.select, width: '100%', boxSizing: 'border-box' }}>
                    <option value="">Valitse</option>
                    {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <div style={S.label}>Pax</div>
                  <input type="number" value={formData.guest_count} onChange={e => handleInputChange('guest_count', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={S.formGrid}>
                <div>
                  <div style={S.label}>Kieli</div>
                  <input value={formData.language} onChange={e => handleInputChange('language', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} placeholder="Suomi / English" />
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

              {/* Menu + Drive link */}
              <div style={{ border: '1px solid #333', padding: 12, background: '#1a1a1a' }}>
                <div style={{ ...S.label, marginBottom: 6, fontWeight: 700 }}>MENU</div>
                <textarea value={formData.menu} onChange={e => handleInputChange('menu', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 8 }} placeholder="Menu kuvaus" />
                <div style={S.label}>Menu Drive -linkki</div>
                <input type="url" value={formData.menuLink} onChange={e => handleInputChange('menuLink', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} placeholder="https://drive.google.com/..." />
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
                <div style={{ ...S.label, marginBottom: 6, fontWeight: 700 }}>ORDER / TILAUS</div>
                <div style={S.label}>Google Drive -linkki</div>
                <input type="url" value={formData.orderLink} onChange={e => handleInputChange('orderLink', e.target.value)} style={{ ...S.input, width: '100%', boxSizing: 'border-box', marginBottom: 8 }} placeholder="https://drive.google.com/..." />
                <div style={S.label}>Tilauksen lisätiedot</div>
                <textarea value={formData.orderNotes} onChange={e => handleInputChange('orderNotes', e.target.value)} style={{ ...S.input, width: '100%', minHeight: 50, boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Lisätiedot" />
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

        <div style={{ ...S.flex, ...S.gap, marginTop: 16, borderTop: '2px solid #444', paddingTop: 16 }}>
          <button onClick={handleSubmit} style={S.btnBlack}>LISÄÄ TAPAHTUMA</button>
          <button onClick={handleClose} style={S.btnWire}>PERUUTA</button>
        </div>
      </div>
    </div>
  );
}
