import { useAuth } from './AuthContext';
import { LoginScreen } from './LoginScreen';

export function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading, isAdmin, isWorker } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={spinnerStyle}>
          <div style={spinnerInnerStyle} />
          <p style={loadingTextStyle}>Ladataan...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !profile) {
    return <LoginScreen />;
  }

  // Check role-based access
  if (requiredRole) {
    const hasAccess = checkRoleAccess(requiredRole, profile);
    if (!hasAccess) {
      return (
        <div style={accessDeniedContainerStyle}>
          <div style={accessDeniedCardStyle}>
            <h2 style={accessDeniedTitleStyle}>Pääsy evätty</h2>
            <p style={accessDeniedTextStyle}>
              Sinulla ei ole vaadittuja oikeuksia tälle sivulle.
            </p>
            <p style={accessDeniedRoleStyle}>
              Vaadittu rooli: <strong>{requiredRole}</strong>
            </p>
          </div>
        </div>
      );
    }
  }

  // Check temporary user expiration
  if (profile.role === 'temporary' && profile.expires_at) {
    const expiresAt = new Date(profile.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return (
        <div style={accessDeniedContainerStyle}>
          <div style={accessDeniedCardStyle}>
            <h2 style={accessDeniedTitleStyle}>Sessio on vanhentunut</h2>
            <p style={accessDeniedTextStyle}>
              Väliaikainen käyttäjätilisi on vanhentunut.
            </p>
            <p style={accessDeniedDateStyle}>
              Vanhentumisaika: {expiresAt.toLocaleString('fi-FI')}
            </p>
          </div>
        </div>
      );
    }
  }

  // All checks passed
  return children;
}

function checkRoleAccess(requiredRole, profile) {
  // Admin has access to everything
  if (profile.role === 'admin') {
    return true;
  }

  // Check exact role match
  if (profile.role === requiredRole) {
    return true;
  }

  // Role hierarchy: admin > worker > temporary
  const roleHierarchy = {
    admin: 3,
    worker: 2,
    temporary: 1,
  };

  const userLevel = roleHierarchy[profile.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

const loadingContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: 'var(--c-bg)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const spinnerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
};

const spinnerInnerStyle = {
  width: '40px',
  height: '40px',
  border: '2px solid var(--c-border-soft)',
  borderTop: '2px solid var(--c-border)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const loadingTextStyle = {
  color: 'var(--c-text-muted)',
  fontSize: '14px',
  margin: '0',
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

const accessDeniedContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: 'var(--c-bg)',
  padding: '20px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const accessDeniedCardStyle = {
  width: '100%',
  maxWidth: '400px',
  backgroundColor: 'var(--c-bg-card)',
  border: '1px solid var(--c-border-soft)',
  borderRadius: '4px',
  padding: '40px',
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
};

const accessDeniedTitleStyle = {
  fontSize: '22px',
  fontWeight: '700',
  color: 'var(--c-text)',
  margin: '0 0 16px 0',
};

const accessDeniedTextStyle = {
  fontSize: '14px',
  color: 'var(--c-text-muted)',
  margin: '0 0 20px 0',
  lineHeight: '1.6',
};

const accessDeniedRoleStyle = {
  fontSize: '13px',
  color: 'var(--c-text-muted)',
  backgroundColor: 'var(--c-bg-hover)',
  padding: '12px',
  borderRadius: '3px',
  border: '1px solid var(--c-border-soft)',
  margin: '0',
};

const accessDeniedDateStyle = {
  fontSize: '13px',
  color: 'var(--c-text-muted)',
  backgroundColor: 'var(--c-bg-hover)',
  padding: '12px',
  borderRadius: '3px',
  border: '1px solid var(--c-error-border)',
  margin: '16px 0 0 0',
};

// Add CSS animation for spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
