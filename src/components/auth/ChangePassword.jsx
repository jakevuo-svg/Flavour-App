import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import S from '../../styles/theme';

export default function ChangePassword({ onClose }) {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Salasanan täytyy olla vähintään 6 merkkiä' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Salasanat eivät täsmää' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Salasana vaihdettu onnistuneesti!' });
        setNewPassword('');
        setConfirmPassword('');
        // Auto-close after 2s
        setTimeout(() => onClose?.(), 2000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={{
        background: '#1a1a1a', border: '2px solid #ddd',
        padding: 24, minWidth: 340, maxWidth: 400,
      }}>
        <div style={{ ...S.label, marginBottom: 16, fontSize: 14 }}>
          VAIHDA SALASANA
        </div>

        {message && (
          <div style={{
            padding: '8px 12px', marginBottom: 12, fontSize: 12, fontWeight: 600,
            background: message.type === 'error' ? '#3a1111' : '#113a11',
            color: message.type === 'error' ? '#ff6b6b' : '#6bff6b',
            border: '1px solid #333',
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 6, fontSize: 11 }}>UUSI SALASANA</div>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={S.inputFull}
              placeholder="Vähintään 6 merkkiä"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...S.label, marginBottom: 6, fontSize: 11 }}>VAHVISTA SALASANA</div>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={S.inputFull}
              placeholder="Kirjoita uudelleen"
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={S.btnBlack} disabled={loading}>
              {loading ? '...' : t('save')}
            </button>
            <button type="button" onClick={onClose} style={S.btnWire}>{t('cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
