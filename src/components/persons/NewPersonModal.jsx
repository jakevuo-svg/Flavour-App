import { useState } from 'react';
import S from '../../styles/theme';
import { PROFILES } from '../../utils/constants';
import Modal from '../common/Modal';
import Field from '../common/Field';

export default function NewPersonModal({ show, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    job: '',
    email: '',
    phone: '',
    website: '',
    profile: ''
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    onAdd(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      job: '',
      email: '',
      phone: '',
      website: '',
      profile: ''
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
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              style={S.inputFull}
              placeholder="Etunimi"
            />
          </Field>
          <Field label="Sukunimi">
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
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
              value={formData.job}
              onChange={(e) => handleInputChange('job', e.target.value)}
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
              value={formData.profile}
              onChange={(e) => handleInputChange('profile', e.target.value)}
              style={S.selectFull}
            >
              <option value="">Valitse profiili</option>
              {PROFILES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>

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
