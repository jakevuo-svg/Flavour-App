import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../../services/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import S from '../../styles/theme';

const DEMO_USERS = [
  { id: '1', email: 'admin@flavour.fi', first_name: 'Admin', last_name: 'User', role: 'admin', is_active: true, expires_at: null },
];

const UserManagement = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (isDemoMode) {
        setUsers(DEMO_USERS);
        return;
      }
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) {
          console.error('[UserManagement] Error fetching users:', error);
          return;
        }
        setUsers(data || []);
      } catch (err) {
        console.error('[UserManagement] Failed:', err);
      }
    };
    fetchUsers();
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'worker', expires_at: '' });

  const isAdmin = profile?.role === 'admin';
  if (!isAdmin) return <div style={{ ...S.border, ...S.bg, ...S.pad, color: '#666' }}>Sinulla ei ole oikeutta käyttää tätä osiota.</div>;

  const handleFormOpen = () => { setShowForm(true); setEditingId(null); setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'worker', expires_at: '' }); };
  const handleFormClose = () => { setShowForm(false); setEditingId(null); };

  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setUsers(users.map(u => u.id === editingId ? { ...u, email: formData.email, first_name: formData.first_name, last_name: formData.last_name, role: formData.role, expires_at: formData.role === 'temporary' ? formData.expires_at : null } : u));
    } else {
      setUsers([...users, { id: Date.now().toString(), email: formData.email, first_name: formData.first_name, last_name: formData.last_name, role: formData.role, is_active: true, expires_at: formData.role === 'temporary' ? formData.expires_at : null }]);
    }
    handleFormClose();
  };

  const handleEdit = (u) => { setEditingId(u.id); setFormData({ email: u.email, password: '', first_name: u.first_name, last_name: u.last_name, role: u.role, expires_at: u.expires_at || '' }); setShowForm(true); };
  const handleToggleActive = (id) => { setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u)); };

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
      <div style={{ ...S.pad, ...S.flexBetween, borderBottom: '1px solid #444' }}>
        <div style={S.label}>KÄYTTÄJÄHALLINTA</div>
        {!showForm && <button onClick={handleFormOpen} style={S.btnSmall}>+ LUO KÄYTTÄJÄ</button>}
      </div>

      {showForm && (
        <div style={{ ...S.pad, borderBottom: '1px solid #444' }}>
          <div style={{ ...S.label, marginBottom: 12 }}>{editingId ? 'MUOKKAA KÄYTTÄJÄÄ' : 'UUSI KÄYTTÄJÄ'}</div>
          <form onSubmit={handleSubmit}>
            <div style={S.formGrid}>
              <div style={S.formRow}>
                <div style={{ ...S.label, marginBottom: 6 }}>SÄHKÖPOSTI</div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required style={S.inputFull} />
              </div>
              {!editingId && (
                <div style={S.formRow}>
                  <div style={{ ...S.label, marginBottom: 6 }}>SALASANA</div>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required style={S.inputFull} />
                </div>
              )}
            </div>
            <div style={S.formGrid}>
              <div style={S.formRow}>
                <div style={{ ...S.label, marginBottom: 6 }}>ETUNIMI</div>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required style={S.inputFull} />
              </div>
              <div style={S.formRow}>
                <div style={{ ...S.label, marginBottom: 6 }}>SUKUNIMI</div>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required style={S.inputFull} />
              </div>
            </div>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 6 }}>ROOLI</div>
              <select name="role" value={formData.role} onChange={handleChange} style={S.selectFull}>
                <option value="worker">Työntekijä</option>
                <option value="admin">Järjestelmänvalvoja</option>
                <option value="temporary">Väliaikainen</option>
              </select>
            </div>
            {formData.role === 'temporary' && (
              <div style={S.formRow}>
                <div style={{ ...S.label, marginBottom: 6 }}>VANHENTUMISPÄIVÄ</div>
                <input type="date" name="expires_at" value={formData.expires_at} onChange={handleChange} style={S.inputFull} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" style={S.btnBlack}>{editingId ? 'PÄIVITÄ' : 'LUO'}</button>
              <button type="button" onClick={handleFormClose} style={S.btnWire}>PERUUTA</button>
            </div>
          </form>
        </div>
      )}

      {/* User table */}
      <div style={S.rowHeader}>
        <span style={S.col(2)}>NIMI</span>
        <span style={S.col(2)}>SÄHKÖPOSTI</span>
        <span style={S.col(1)}>ROOLI</span>
        <span style={S.col(1)}>TILA</span>
        <span style={S.col(1)}>VANHENTUU</span>
        <span style={S.col(1.5)}>TOIMINNOT</span>
      </div>
      {users.map(u => (
        <div key={u.id} style={S.row}>
          <span style={{ ...S.col(2), fontWeight: 600 }}>{u.first_name} {u.last_name}</span>
          <span style={{ ...S.col(2), color: '#999', fontSize: 12 }}>{u.email}</span>
          <span style={{ ...S.col(1), fontSize: 12 }}>
            {u.role === 'admin' && <span style={{ fontWeight: 700 }}>Järjestelmänvalvoja</span>}
            {u.role === 'worker' && 'Työntekijä'}
            {u.role === 'temporary' && <span style={{ fontStyle: 'italic' }}>Väliaikainen</span>}
          </span>
          <span style={{ ...S.col(1), fontSize: 12, color: u.is_active ? '#ddd' : '#666' }}>
            {u.is_active ? 'Aktiivinen' : 'Passiivinen'}
          </span>
          <span style={{ ...S.col(1), color: '#666', fontSize: 11 }}>
            {u.expires_at && u.role === 'temporary' ? new Date(u.expires_at).toLocaleDateString('fi-FI') : '-'}
          </span>
          <span style={{ ...S.col(1.5), display: 'flex', gap: 6 }}>
            <button onClick={() => handleEdit(u)} style={S.btnSmall}>MUOKKAA</button>
            <button onClick={() => handleToggleActive(u.id)} style={S.btnSmall}>
              {u.is_active ? 'DEAKTIVOI' : 'AKTIVOI'}
            </button>
          </span>
        </div>
      ))}
    </div>
  );
};

export default UserManagement;
