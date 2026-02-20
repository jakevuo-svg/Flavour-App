import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function LoginScreen() {
  const { signIn, emailConfirmed, setEmailConfirmed } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (emailConfirmed) setEmailConfirmed(false);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Kirjautuminen epäonnistui');
    }

    setLoading(false);
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#111',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#1e1e1e',
    border: '2px solid #ddd',
    padding: '40px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '6px',
    color: '#ddd',
    textAlign: 'center',
    margin: '0 0 8px 0',
  };

  const subtitleStyle = {
    fontSize: '13px',
    color: '#888',
    textAlign: 'center',
    margin: '0 0 32px 0',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  };

  const inputGroupStyle = {
    marginBottom: '16px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: '#ddd',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #555',
    color: '#ddd',
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background-color 0.2s',
    outline: 'none',
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: '#ddd',
    backgroundColor: '#333',
  };

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const buttonStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#ddd',
    color: '#111',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    marginTop: '24px',
    transition: 'opacity 0.2s, background-color 0.2s',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#ccc',
  };

  const [buttonHovered, setButtonHovered] = useState(false);

  const errorStyle = {
    color: '#aa5555',
    fontSize: '13px',
    marginTop: '16px',
    textAlign: 'center',
    padding: '8px 12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #554444',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>TYPEDWN</h1>
        <p style={subtitleStyle}>Event Service Hub</p>

        {emailConfirmed && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            background: '#1a2a1a',
            border: '1px solid #2a4a2a',
            color: '#6bff6b',
            fontSize: '13px',
            textAlign: 'center',
          }}>
            Sähköposti vahvistettu! Kirjaudu sisään väliaikaisella salasanallasi.
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Sähköposti</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={emailFocused ? inputFocusStyle : inputStyle}
              placeholder="user@example.com"
              disabled={loading}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Salasana</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              style={passwordFocused ? inputFocusStyle : inputStyle}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={buttonHovered ? buttonHoverStyle : buttonStyle}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            disabled={loading}
          >
            {loading ? 'Ladataan...' : 'Kirjaudu sisään'}
          </button>

          {error && <div style={errorStyle}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
