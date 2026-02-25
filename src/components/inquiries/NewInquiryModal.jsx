import { useState } from 'react';
import S from '../../styles/theme';

export default function NewInquiryModal({ isOpen, onClose, onSubmit, allSystemUsers }) {
  const [formData, setFormData] = useState({
    contact_name: '',
    email: '',
    phone: '',
    company: '',
    requested_date: '',
    guest_count: '',
    description: '',
    assigned_to: '',
    assigned_name: '',
    received_at: new Date().toISOString().split('T')[0],
    source: 'MANUAALINEN',
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignedToChange = (e) => {
    const selectedId = e.target.value;
    const selectedUser = allSystemUsers?.find(user => user.id === selectedId);
    setFormData(prev => ({
      ...prev,
      assigned_to: selectedId,
      assigned_name: selectedUser?.name || '',
    }));
  };

  const resetForm = () => {
    setFormData({
      contact_name: '',
      email: '',
      phone: '',
      company: '',
      requested_date: '',
      guest_count: '',
      description: '',
      assigned_to: '',
      assigned_name: '',
      received_at: new Date().toISOString().split('T')[0],
      source: 'MANUAALINEN',
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const modalBoxStyle = {
    background: '#1e1e1e',
    border: '2px solid #ddd',
    padding: 24,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const inputStyle = {
    background: '#111',
    color: '#ddd',
    border: '1px solid #444',
    padding: '8px 10px',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: '#888',
    marginBottom: 4,
  };

  const rowStyle = {
    marginBottom: 12,
  };

  const titleStyle = {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1,
    color: '#ddd',
    marginBottom: 20,
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: 10,
    marginTop: 24,
    justifyContent: 'flex-end',
  };

  return (
    <div style={overlayStyle}>
      <div style={modalBoxStyle}>
        <div style={titleStyle}>UUSI TIEDUSTELU</div>

        {/* Yhteyshenkilö */}
        <div style={rowStyle}>
          <div style={labelStyle}>Yhteyshenkilö</div>
          <input
            type="text"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        {/* Sähköposti */}
        <div style={rowStyle}>
          <div style={labelStyle}>Sähköposti</div>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        {/* Puhelin */}
        <div style={rowStyle}>
          <div style={labelStyle}>Puhelin</div>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        {/* Yritys */}
        <div style={rowStyle}>
          <div style={labelStyle}>Yritys</div>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        {/* Toivottu ajankohta */}
        <div style={rowStyle}>
          <div style={labelStyle}>Toivottu ajankohta</div>
          <input
            type="text"
            name="requested_date"
            placeholder="27.2. tai 3.4.2025"
            value={formData.requested_date}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        {/* Henkilömäärä */}
        <div style={rowStyle}>
          <div style={labelStyle}>Henkilömäärä</div>
          <input
            type="number"
            name="guest_count"
            value={formData.guest_count}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        {/* Kuvaus/teema */}
        <div style={rowStyle}>
          <div style={labelStyle}>Kuvaus/teema</div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          />
        </div>

        {/* Vastuuhenkilö */}
        <div style={rowStyle}>
          <div style={labelStyle}>Vastuuhenkilö</div>
          <select
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleAssignedToChange}
            style={inputStyle}
          >
            <option value="">-- Valitse --</option>
            {allSystemUsers?.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tullut */}
        <div style={rowStyle}>
          <div style={labelStyle}>Tullut</div>
          <input
            type="date"
            name="received_at"
            value={formData.received_at}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        {/* Lähde */}
        <div style={rowStyle}>
          <div style={labelStyle}>Lähde</div>
          <select
            name="source"
            value={formData.source}
            onChange={handleInputChange}
            style={inputStyle}
          >
            <option value="MANUAALINEN">MANUAALINEN</option>
            <option value="LOMAKE">LOMAKE</option>
            <option value="SÄHKÖPOSTI">SÄHKÖPOSTI</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={buttonContainerStyle}>
          <button
            style={S.btnWire}
            onClick={handleCancel}
          >
            PERUUTA
          </button>
          <button
            style={S.btnBlack}
            onClick={handleSubmit}
          >
            LISÄÄ TIEDUSTELU
          </button>
        </div>
      </div>
    </div>
  );
}
