import { useState } from 'react';
import S from '../../styles/theme';
import Modal from '../common/Modal';
import Field from '../common/Field';

export default function NewLocationModal({ show, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    address: '',
    description: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    driveLink: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    try {
      await onAdd(formData);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Failed to add location:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      capacity: '',
      address: '',
      description: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      driveLink: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose} title="Uusi sijainti">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={S.formGrid}>
          <Field label="Nimi *">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={S.inputFull}
              placeholder="Sijainnin nimi"
            />
          </Field>
          <Field label="Tyyppi">
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              style={S.inputFull}
              placeholder="Esim. Ravintola, Juhlasali..."
            />
          </Field>
        </div>

        <div style={S.formGrid}>
          <Field label="Kapasiteetti">
            <input
              type="text"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              style={S.inputFull}
              placeholder="Esim. 50-300 hlö"
            />
          </Field>
          <Field label="Osoite">
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              style={S.inputFull}
              placeholder="Katuosoite"
            />
          </Field>
        </div>

        <div style={S.formGrid}>
          <Field label="Yhteyshenkilö">
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              style={S.inputFull}
              placeholder="Yhteyshenkilön nimi"
            />
          </Field>
          <Field label="Sähköposti">
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              style={S.inputFull}
              placeholder="Sähköposti"
            />
          </Field>
        </div>

        <div style={S.formGrid}>
          <Field label="Puhelin">
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              style={S.inputFull}
              placeholder="Puhelin"
            />
          </Field>
          <Field label="Drive-linkki">
            <input
              type="url"
              value={formData.driveLink}
              onChange={(e) => handleInputChange('driveLink', e.target.value)}
              style={S.inputFull}
              placeholder="https://drive.google.com/..."
            />
          </Field>
        </div>

        <Field label="Kuvaus">
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            style={{ ...S.inputFull, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Sijainnin kuvaus..."
          />
        </Field>

        <div style={{ ...S.flexWrap, gap: 8, marginTop: 16 }}>
          <button onClick={handleSubmit} style={S.btnBlack}>LISÄÄ SIJAINTI</button>
          <button onClick={handleClose} style={S.btnWire}>PERUUTA</button>
        </div>
      </div>
    </Modal>
  );
}
