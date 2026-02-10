import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../../services/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import S from '../../styles/theme';

const DEMO_USERS = [
  { id: '1', email: 'admin@flavour.fi', first_name: 'Admin', last_name: 'User', role: 'admin', is_active: true, expires_at: null },
];

const UserManagement = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    if (isDemoMode) { setUsers(DEMO_USERS); return; }
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) { console.error('[UserManagement] Error:', error); return; }
      setUsers(data || []);
    } catch (err) { console.error('[UserManagement] Failed:', err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '', role: 'worker', expires_at: '',
  });
  const [createdPassword, setCreatedPassword] = useState(null);

  const isAdmin = profile?.role === 'admin';
  if (!isAdmin) return <div style={{ ...S.border, ...S.bg, ...S.pad, color: '#666' }}>{t('noAccess')}</div>;

  const handleFormOpen = () => {
    setShowForm(true);
    setEditingId(null);
    setCreatedPassword(null);
    setMessage(null);
    // Generate a random temp password
    const tempPw = 'Flavour-' + Math.random().toString(36).slice(2, 10);
    setFormData({ email: '', password: tempPw, first_name: '', last_name: '', role: 'worker', expires_at: '' });
  };
  const handleFormClose = () => { setShowForm(false); setEditingId(null); setCreatedPassword(null); setMessage(null); };
  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  // CREATE NEW USER — Supabase Auth signUp + users table insert
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.first_name) {
      setMessage({ type: 'error', text: 'Täytä kaikki pakolliset kentät' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      if (isDemoMode) {
        setUsers(prev => [...prev, {
          id: Date.now().toString(), email: formData.email,
          first_name: formData.first_name, last_name: formData.last_name,
          role: formData.role, is_active: true,
          expires_at: formData.role === 'temporary' ? formData.expires_at : null,
        }]);
        setCreatedPassword(formData.password);
        setLoading(false);
        return;
      }

      // 1. Create auth user via signUp
      // With email confirmation enabled, this won't affect admin's session
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
          },
          // Don't auto-confirm — let Supabase send the confirmation/welcome email
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) {
        console.error('[UserManagement] SignUp error:', signUpError);
        setMessage({ type: 'error', text: signUpError.message });
        setLoading(false);
        return;
      }

      const newUserId = signUpData?.user?.id;
      if (!newUserId) {
        setMessage({ type: 'error', text: 'Käyttäjän luonti epäonnistui — ei ID:tä' });
        setLoading(false);
        return;
      }

      // 2. Insert into public.users table
      const { error: insertError } = await supabase.from('users').insert([{
        id: newUserId,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_active: true,
        expires_at: formData.role === 'temporary' && formData.expires_at ? formData.expires_at : null,
        created_at: new Date().toISOString(),
      }]);

      if (insertError) {
        console.error('[UserManagement] Insert error:', insertError);
        // User was created in auth but profile insert failed
        setMessage({ type: 'error', text: `Auth-käyttäjä luotu, mutta profiili-virhe: ${insertError.message}` });
        setLoading(false);
        return;
      }

      // 3. Success!
      setCreatedPassword(formData.password);
      setMessage({
        type: 'success',
        text: `Käyttäjä ${formData.first_name} ${formData.last_name} luotu! Supabase lähettää vahvistussähköpostin.`,
      });

      // Refresh user list
      await fetchUsers();

    } catch (err) {
      console.error('[UserManagement] Unexpected error:', err);
      setMessage({ type: 'error', text: err.message });
    }
    setLoading(false);
  };

  // UPDATE EXISTING USER (profile only, not auth)
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (isDemoMode) {
        setUsers(users.map(u => u.id === editingId ? {
          ...u, email: formData.email, first_name: formData.first_name,
          last_name: formData.last_name, role: formData.role,
          expires_at: formData.role === 'temporary' ? formData.expires_at : null,
        } : u));
        handleFormClose();
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('users').update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        expires_at: formData.role === 'temporary' && formData.expires_at ? formData.expires_at : null,
      }).eq('id', editingId);

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Käyttäjä päivitetty' });
        await fetchUsers();
        handleFormClose();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setLoading(false);
  };

  // TOGGLE ACTIVE
  const handleToggleActive = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const newActive = !user.is_active;

    if (isDemoMode) {
      setUsers(users.map(u => u.id === id ? { ...u, is_active: newActive } : u));
      return;
    }

    try {
      const { error } = await supabase.from('users').update({ is_active: newActive }).eq('id', id);
      if (error) {
        console.error('[UserManagement] Toggle error:', error);
        return;
      }
      setUsers(users.map(u => u.id === id ? { ...u, is_active: newActive } : u));
    } catch (err) {
      console.error('[UserManagement] Toggle failed:', err);
    }
  };

  // DELETE USER COMPLETELY (auth + profile)
  const handleDeleteUser = async (u) => {
    // Prevent deleting self
    if (u.id === profile?.id) {
      setMessage({ type: 'error', text: t('cannotDeleteSelf') });
      return;
    }

    if (!window.confirm(t('confirmDeleteUser'))) return;

    setLoading(true);
    setMessage(null);

    try {
      if (isDemoMode) {
        setUsers(prev => prev.filter(usr => usr.id !== u.id));
        setMessage({ type: 'success', text: t('userDeleted') });
        setLoading(false);
        return;
      }

      // Call the SECURITY DEFINER function that deletes from both auth.users and public.users
      const { error } = await supabase.rpc('delete_user_completely', { target_user_id: u.id });

      if (error) {
        console.error('[UserManagement] Delete error:', error);
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('userDeleted') });
        setUsers(prev => prev.filter(usr => usr.id !== u.id));
      }
    } catch (err) {
      console.error('[UserManagement] Delete failed:', err);
      setMessage({ type: 'error', text: err.message });
    }
    setLoading(false);
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setCreatedPassword(null);
    setMessage(null);
    setFormData({
      email: u.email, password: '', first_name: u.first_name,
      last_name: u.last_name, role: u.role, expires_at: u.expires_at || '',
    });
    setShowForm(true);
  };

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
      <div style={{ ...S.pad, ...S.flexBetween, borderBottom: '1px solid #444' }}>
        <div style={S.label}>{t('userManagement')}</div>
        {!showForm && <button onClick={handleFormOpen} style={S.btnSmall}>{t('createUser')}</button>}
      </div>

      {/* Message banner */}
      {message && (
        <div style={{
          padding: '8px 16px', fontSize: 12, fontWeight: 600,
          background: message.type === 'error' ? '#3a1111' : '#113a11',
          color: message.type === 'error' ? '#ff6b6b' : '#6bff6b',
          borderBottom: '1px solid #444',
        }}>
          {message.text}
        </div>
      )}

      {/* Created password display */}
      {createdPassword && (
        <div style={{
          padding: '12px 16px', background: '#1a2a1a', borderBottom: '1px solid #444',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#6bff6b', marginBottom: 6 }}>
            VÄLIAIKAINEN SALASANA — LÄHETÄ KÄYTTÄJÄLLE
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 16, fontWeight: 700,
            background: '#111', padding: '8px 12px', border: '1px solid #333',
            color: '#fff', letterSpacing: 2, userSelect: 'all',
          }}>
            {createdPassword}
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
            Käyttäjä voi vaihtaa salasanan kirjautumisen jälkeen.
            Klikkaa salasanaa kopioidaksesi se.
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ ...S.pad, borderBottom: '1px solid #444' }}>
          <div style={{ ...S.label, marginBottom: 12 }}>{editingId ? t('edit') : t('createUser')}</div>
          <form onSubmit={editingId ? handleUpdateUser : handleCreateUser}>
            <div style={S.formGrid}>
              <div style={S.formRow}>
                <div style={{ ...S.label, marginBottom: 6 }}>{t('email')}</div>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} required style={S.inputFull}
                  disabled={!!editingId}
                />
              </div>
              {!editingId && (
                <div style={S.formRow}>
                  <div style={{ ...S.label, marginBottom: 6 }}>{t('password')} (väliaikainen)</div>
                  <input
                    type="text" name="password" value={formData.password}
                    onChange={handleChange} required style={S.inputFull}
                  />
                </div>
              )}
            </div>
            <div style={S.formGrid}>
              <div style={S.formRow}>
                <div style={{ ...S.label, marginBottom: 6 }}>{t('firstName')}</div>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required style={S.inputFull} />
              </div>
              <div style={S.formRow}>
                <div style={{ ...S.label, marginBottom: 6 }}>{t('lastName')}</div>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required style={S.inputFull} />
              </div>
            </div>
            <div style={S.formRow}>
              <div style={{ ...S.label, marginBottom: 6 }}>{t('role')}</div>
              <select name="role" value={formData.role} onChange={handleChange} style={S.selectFull}>
                <option value="worker">{t('roleWorker')}</option>
                <option value="admin">{t('roleAdmin')}</option>
                <option value="temporary">{t('roleTemporary')}</option>
              </select>
            </div>
            {formData.role === 'temporary' && (
              <div style={S.formRow}>
                <div style={{ ...S.label, marginBottom: 6 }}>{t('expiresAt')}</div>
                <input type="date" name="expires_at" value={formData.expires_at} onChange={handleChange} style={S.inputFull} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" style={S.btnBlack} disabled={loading}>
                {loading ? '...' : editingId ? t('save') : t('add')}
              </button>
              <button type="button" onClick={handleFormClose} style={S.btnWire}>{t('cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {/* User table */}
      <div style={S.rowHeader}>
        <span style={S.col(2)}>{t('firstName')}</span>
        <span style={S.col(2)}>{t('email')}</span>
        <span style={S.col(1)}>{t('role')}</span>
        <span style={S.col(1)}>{t('status')}</span>
        <span style={S.col(1)}>{t('expiresAt')}</span>
        <span style={S.col(2)}></span>
      </div>
      {users.map(u => (
        <div key={u.id} style={S.row}>
          <span style={{ ...S.col(2), fontWeight: 600 }}>{u.first_name} {u.last_name}</span>
          <span style={{ ...S.col(2), color: '#999', fontSize: 12 }}>{u.email}</span>
          <span style={{ ...S.col(1), fontSize: 12 }}>
            {u.role === 'admin' && <span style={{ fontWeight: 700 }}>{t('roleAdmin')}</span>}
            {u.role === 'worker' && t('roleWorker')}
            {u.role === 'temporary' && <span style={{ fontStyle: 'italic' }}>{t('roleTemporary')}</span>}
          </span>
          <span style={{ ...S.col(1), fontSize: 12, color: u.is_active ? '#ddd' : '#666' }}>
            {u.is_active ? t('active') : t('inactive')}
          </span>
          <span style={{ ...S.col(1), color: '#666', fontSize: 11 }}>
            {u.expires_at && u.role === 'temporary' ? new Date(u.expires_at).toLocaleDateString('fi-FI') : '-'}
          </span>
          <span style={{ ...S.col(2), display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => handleEdit(u)} style={S.btnSmall}>{t('edit')}</button>
            <button onClick={() => handleToggleActive(u.id)} style={S.btnSmall}>
              {u.is_active ? t('deactivate') : t('activate')}
            </button>
            {u.id !== profile?.id && (
              <button
                onClick={() => handleDeleteUser(u)}
                style={{ ...S.btnSmall, color: '#ff6b6b', borderColor: '#ff6b6b' }}
              >
                {t('deleteUser')}
              </button>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export default UserManagement;
