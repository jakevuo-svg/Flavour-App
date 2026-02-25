import { useState, useEffect } from 'react';
import S from '../../styles/theme';
import { INQUIRY_STATUSES, INQUIRY_STATUS_COLORS } from '../../hooks/useInquiries';

const Section = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '2px solid #333', marginTop: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '10px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: '#888' }}>{open ? '▼' : '▶'}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#888' }}>{title}</span>
      </div>
      {open && <div style={{ paddingBottom: 16 }}>{children}</div>}
    </div>
  );
};

const Row = ({ label, children }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: '#888', marginBottom: 4 }}>{label}</div>
    {children}
  </div>
);

const InquiryCard = ({ inquiry, onUpdate, onDelete, onBack, onConvertToEvent, onAddPerson, adminUsers, locations }) => {
  const [viewMode, setViewMode] = useState(true);
  const [formData, setFormData] = useState(inquiry);

  useEffect(() => {
    setFormData(inquiry);
  }, [inquiry]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setViewMode(true);
  };

  const handleDelete = () => {
    if (window.confirm('Haluatko varmasti poistaa tämän tiedustelun?')) {
      onDelete(inquiry.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI');
  };

  const inputStyle = {
    background: '#111',
    color: '#ddd',
    border: '1px solid #444',
    padding: '8px 10px',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box',
    colorScheme: 'dark',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: 80,
    fontFamily: 'inherit',
    resize: 'vertical'
  };

  const selectStyle = inputStyle;

  return (
    <div style={{ ...S.bg, ...S.border, ...S.pad }}>
      {inquiry.event_id && (
        <div style={{
          background: '#1a3a1a',
          border: '1px solid #4a8a4a',
          color: '#8fd68f',
          padding: '10px 12px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.5,
          marginBottom: 16,
          borderRadius: 2
        }}>
          ✓ LINKITETTY TAPAHTUMAAN
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ ...S.btnWire }}>← TAKAISIN</button>
        {viewMode ? (
          <>
            <button onClick={() => setViewMode(false)} style={{ ...S.btnWire }}>MUOKKAA</button>
            <button onClick={handleDelete} style={{ ...S.btnWire, color: '#c44' }}>POISTA</button>
            {!inquiry.event_id && (
              <button onClick={() => onConvertToEvent(inquiry)} style={{ ...S.btnBlack }}>MUUNNA TAPAHTUMAKSI</button>
            )}
          </>
        ) : null}
      </div>

      {/* YHTEYSTIEDOT */}
      <Section title="YHTEYSTIEDOT" defaultOpen={true}>
        {viewMode ? (
          <>
            <Row label="Yhteyshenkilö">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 13, color: '#ddd' }}>{formData.contact_name || '-'}</div>
                {formData.contact_name && onAddPerson && (
                  <button
                    onClick={() => onAddPerson({
                      name: formData.contact_name,
                      email: formData.email,
                      phone: formData.phone,
                      company: formData.company,
                    })}
                    style={{
                      ...S.btnWire,
                      fontSize: 10,
                      padding: '2px 8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + LISÄÄ HENKILÖIHIN
                  </button>
                )}
              </div>
            </Row>
            <Row label="Sähköposti">
              {formData.email ? (
                <a href={`mailto:${formData.email}`} style={{ fontSize: 13, color: '#88d', textDecoration: 'none' }}>{formData.email}</a>
              ) : (
                <div style={{ fontSize: 13, color: '#ddd' }}>-</div>
              )}
            </Row>
            <Row label="Puhelin">
              {formData.phone ? (
                <a href={`tel:${formData.phone}`} style={{ fontSize: 13, color: '#88d', textDecoration: 'none' }}>{formData.phone}</a>
              ) : (
                <div style={{ fontSize: 13, color: '#ddd' }}>-</div>
              )}
            </Row>
            <Row label="Yritys">
              <div style={{ fontSize: 13, color: '#ddd' }}>{formData.company || '-'}</div>
            </Row>
          </>
        ) : (
          <>
            <Row label="Yhteyshenkilö">
              <input type="text" value={formData.contact_name || ''} onChange={e => handleInputChange('contact_name', e.target.value)} style={inputStyle} />
            </Row>
            <Row label="Sähköposti">
              <input type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} style={inputStyle} />
            </Row>
            <Row label="Puhelin">
              <input type="tel" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} style={inputStyle} />
            </Row>
            <Row label="Yritys">
              <input type="text" value={formData.company || ''} onChange={e => handleInputChange('company', e.target.value)} style={inputStyle} />
            </Row>
          </>
        )}
      </Section>

      {/* TIEDUSTELU */}
      <Section title="TIEDUSTELU" defaultOpen={true}>
        {viewMode ? (
          <>
            <Row label="Toivottu ajankohta">
              <div style={{ fontSize: 13, color: '#ddd' }}>{formData.requested_date || '-'}</div>
            </Row>
            <Row label="Henkilömäärä">
              <div style={{ fontSize: 13, color: '#ddd' }}>{formData.guest_count || '-'}</div>
            </Row>
            <Row label="Tapahtumapaikka">
              <div style={{ fontSize: 13, color: '#ddd' }}>{formData.location_name || '-'}</div>
            </Row>
            <Row label="Kuvaus/teema">
              <div style={{ fontSize: 13, color: '#ddd', whiteSpace: 'pre-wrap' }}>{formData.description || '-'}</div>
            </Row>
            <Row label="Lähde">
              <div style={{ fontSize: 13, color: '#ddd' }}>{formData.source || '-'}</div>
            </Row>
          </>
        ) : (
          <>
            <Row label="Toivottu ajankohta">
              <input type="date" value={formData.requested_date ? formData.requested_date.split('T')[0] : ''} onChange={e => handleInputChange('requested_date', e.target.value)} style={inputStyle} />
            </Row>
            <Row label="Henkilömäärä">
              <input type="number" value={formData.guest_count || ''} onChange={e => handleInputChange('guest_count', e.target.value ? parseInt(e.target.value) : null)} style={inputStyle} />
            </Row>
            <Row label="Tapahtumapaikka">
              <select value={formData.location_id || ''} onChange={e => {
                const selectedId = e.target.value;
                const loc = locations?.find(l => l.id === selectedId);
                handleInputChange('location_id', selectedId);
                handleInputChange('location_name', loc?.name || '');
              }} style={selectStyle}>
                <option value="">-- Valitse --</option>
                {locations?.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </Row>
            <Row label="Kuvaus/teema">
              <textarea value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} style={textareaStyle} />
            </Row>
            <Row label="Lähde">
              <select value={formData.source || ''} onChange={e => handleInputChange('source', e.target.value)} style={selectStyle}>
                <option value="">Valitse...</option>
                <option value="MANUAALINEN">MANUAALINEN</option>
                <option value="LOMAKE">LOMAKE</option>
                <option value="SÄHKÖPOSTI">SÄHKÖPOSTI</option>
              </select>
            </Row>
          </>
        )}
      </Section>

      {/* MYYNTIPUTKI */}
      <Section title="MYYNTIPUTKI">
        {viewMode ? (
          <>
            <Row label="Status">
              {formData.status && (
                <div style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  background: (INQUIRY_STATUS_COLORS[formData.status] || '#666') + '22',
                  color: INQUIRY_STATUS_COLORS[formData.status] || '#666',
                  border: `1px solid ${INQUIRY_STATUS_COLORS[formData.status] || '#666'}`
                }}>
                  {formData.status}
                </div>
              )}
            </Row>
            <Row label="Tarjottu">
              <div style={{ fontSize: 13, color: '#ddd' }}>{formData.offered || '-'}</div>
            </Row>
            <Row label="Hinta">
              <div style={{ fontSize: 13, color: '#ddd' }}>
                {formData.price ? `${formData.price} €` : '-'}
              </div>
            </Row>
            <Row label="Vastuuhenkilö">
              <div style={{ fontSize: 13, color: '#ddd' }}>{formData.assigned_name || '-'}</div>
            </Row>
            <Row label="Vastaa viimeistään">
              {formData.respond_by ? (() => {
                const today = new Date(); today.setHours(0,0,0,0);
                const deadline = new Date(formData.respond_by); deadline.setHours(0,0,0,0);
                const isOverdue = deadline < today && !['VASTATTU','TARJOTTU','VAHVISTETTU','LASKUTETTU','MAKSETTU'].includes(formData.status);
                const isToday = deadline.getTime() === today.getTime();
                return (
                  <div style={{
                    fontSize: 13,
                    fontWeight: (isOverdue || isToday) ? 700 : 400,
                    color: isOverdue ? '#ff6666' : isToday ? '#ffaa44' : '#ddd',
                  }}>
                    {isOverdue ? '! MYÖHÄSSÄ — ' : isToday ? '! TÄNÄÄN — ' : ''}{formatDate(formData.respond_by)}
                  </div>
                );
              })() : <div style={{ fontSize: 13, color: '#ddd' }}>-</div>}
            </Row>
            <Row label="Tullut">
              <div style={{ fontSize: 13, color: '#ddd' }}>{formatDate(formData.received_at)}</div>
            </Row>
            <Row label="Vastattu">
              <div style={{ fontSize: 13, color: '#ddd' }}>{formatDate(formData.responded_at)}</div>
            </Row>
          </>
        ) : (
          <>
            <Row label="Status">
              <select value={formData.status || ''} onChange={e => handleInputChange('status', e.target.value)} style={selectStyle}>
                <option value="">Valitse...</option>
                {INQUIRY_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </Row>
            <Row label="Tarjottu">
              <input type="text" value={formData.offered || ''} onChange={e => handleInputChange('offered', e.target.value)} style={inputStyle} />
            </Row>
            <Row label="Hinta">
              <input type="number" value={formData.price || ''} onChange={e => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : null)} style={inputStyle} placeholder="€" />
            </Row>
            <Row label="Vastuuhenkilö">
              <select value={formData.assigned_to || ''} onChange={e => {
                const selectedId = e.target.value;
                const u = adminUsers?.find(a => a.id === selectedId);
                handleInputChange('assigned_to', selectedId);
                handleInputChange('assigned_name', u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '');
              }} style={selectStyle}>
                <option value="">Valitse...</option>
                {adminUsers?.map(u => (
                  <option key={u.id} value={u.id}>
                    {`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Vastaa viimeistään">
              <input type="date" value={formData.respond_by ? formData.respond_by.split('T')[0] : ''} onChange={e => handleInputChange('respond_by', e.target.value)} style={inputStyle} />
            </Row>
            <Row label="Tullut">
              <input type="date" value={formData.received_at ? formData.received_at.split('T')[0] : ''} onChange={e => handleInputChange('received_at', e.target.value)} style={inputStyle} />
            </Row>
            <Row label="Vastattu">
              <input type="date" value={formData.responded_at ? formData.responded_at.split('T')[0] : ''} onChange={e => handleInputChange('responded_at', e.target.value)} style={inputStyle} />
            </Row>
          </>
        )}
      </Section>

      {/* LASKUTUS - only show when status is VAHVISTETTU, LASKUTETTU, or MAKSETTU */}
      {['VAHVISTETTU', 'LASKUTETTU', 'MAKSETTU'].includes(formData.status) && (
        <Section title="LASKUTUS">
          {viewMode ? (
            <>
              <Row label="Laskun numero">
                <div style={{ fontSize: 13, color: '#ddd' }}>{formData.invoice_number || '-'}</div>
              </Row>
              <Row label="Laskutettu">
                <div style={{ fontSize: 13, color: '#ddd' }}>{formatDate(formData.invoiced_at)}</div>
              </Row>
              <Row label="Maksettu">
                <div style={{ fontSize: 13, color: '#ddd' }}>{formatDate(formData.paid_at)}</div>
              </Row>
            </>
          ) : (
            <>
              <Row label="Laskun numero">
                <input type="text" value={formData.invoice_number || ''} onChange={e => handleInputChange('invoice_number', e.target.value)} style={inputStyle} />
              </Row>
              <Row label="Laskutettu">
                <input type="date" value={formData.invoiced_at ? formData.invoiced_at.split('T')[0] : ''} onChange={e => handleInputChange('invoiced_at', e.target.value)} style={inputStyle} />
              </Row>
              <Row label="Maksettu">
                <input type="date" value={formData.paid_at ? formData.paid_at.split('T')[0] : ''} onChange={e => handleInputChange('paid_at', e.target.value)} style={inputStyle} />
              </Row>
            </>
          )}
        </Section>
      )}

      {/* MUISTIINPANOT */}
      <Section title="MUISTIINPANOT">
        {viewMode ? (
          <>
            <Row label="Lopputulos">
              <div style={{ fontSize: 13, color: '#ddd', whiteSpace: 'pre-wrap' }}>{formData.outcome || '-'}</div>
            </Row>
            <Row label="Muut huomiot">
              <div style={{ fontSize: 13, color: '#ddd', whiteSpace: 'pre-wrap' }}>{formData.notes || '-'}</div>
            </Row>
          </>
        ) : (
          <>
            <Row label="Lopputulos">
              <textarea value={formData.outcome || ''} onChange={e => handleInputChange('outcome', e.target.value)} style={textareaStyle} />
            </Row>
            <Row label="Muut huomiot">
              <textarea value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} style={textareaStyle} />
            </Row>
          </>
        )}
      </Section>

      {/* EDIT MODE BUTTONS */}
      {!viewMode && (
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={handleSave} style={{ ...S.btnBlack, flex: 1 }}>TALLENNA</button>
          <button onClick={() => {
            setFormData(inquiry);
            setViewMode(true);
          }} style={{ ...S.btnWire, flex: 1 }}>PERUUTA</button>
        </div>
      )}
    </div>
  );
};

export default InquiryCard;
