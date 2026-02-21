import { useState } from 'react';
import S from '../../styles/theme';
import { PROFILES } from '../../utils/constants';
import Modal from '../common/Modal';
import Field from '../common/Field';

export default function NewPersonModal({ show, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    role: '',
    email: '',
    phone: '',
    website: '',
    type: ''
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Etunimi ja sukunimi ovat pakollisia');
      return;
    }
    // Convert empty strings to null so DB CHECK constraints are satisfied
    const cleanData = {};
    for (const [key, val] of Object.entries(formData)) {
      cleanData[key] = (typeof val === 'string' && val.trim() === '') ? null : val;
    }
    try {
      await onAdd(cleanData);
      resetForm();
    } catch (err) {
      setError('Henkilön lisäys epäonnistui: ' + (err.message || 'tuntematon virhe'));
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      company: '',
      role: '',
      email: '',
      phone: '',
      website: '',
      type: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose} title="Uusi henkilö">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={S.formGrid}>
          <Field label="Etunimi">
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              style={S.inputFull}
              placeholder="Etunimi"
            />
          </Field>
          <Field label="Sukunimi">
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              style={S.inputFull}
              placeholder="Sukunimi"
            />
          </Field>
        </div>

        <div style={S.formGrid}>
          <Field label="Yritys">
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              style={S.inputFull}
              placeholder="Yritys"
            />
          </Field>
          <Field label="Työnimike">
            <input
              type="text"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              style={S.inputFull}
              placeholder="Työnimike"
            />
          </Field>
        </div>

        <div style={S.formGrid}>
          <Field label="Sähköposti">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={S.inputFull}
              placeholder="Sähköposti"
            />
          </Field>
          <Field label="Puhelin">
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              style={S.inputFull}
              placeholder="Puhelin"
            />
          </Field>
        </div>

        <div style={S.formGrid}>
          <Field label="Verkkosivusto">
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              style={S.inputFull}
              placeholder="Verkkosivusto"
            />
          </Field>
          <Field label="Profiili">
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              style={S.selectFull}
            >
              <option value="">Valitse profiili</option>
              {PROFILES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {error && <div style={{ color: '#ff6b6b', fontSize: 12, padding: '6px 0' }}>{error}</div>}

        <div style={{ ...S.flexWrap, gap: 8, marginTop: 16 }}>
          <button
            onClick={handleSubmit}
            style={S.btnBlack}
          >
            Lisää henkilö
          </button>
          <button
            onClick={handleClose}
            style={S.btnWire}
          >
            Peruuta
          </button>
        </div>
      </div>
    </Modal>
  );
}
