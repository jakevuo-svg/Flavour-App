import React from 'react';
import S from '../../styles/theme';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            ...S.app,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 20,
          }}
        >
          <div
            style={{
              ...S.border,
              ...S.bg,
              padding: 30,
              textAlign: 'center',
              maxWidth: 500,
              borderRadius: 8,
            }}
          >
            <h2 style={{ marginTop: 0, color: 'var(--c-danger)' }}>
              Virhe tapahtui
            </h2>
            <p style={{ color: 'var(--c-text-muted)', marginBottom: 20 }}>
              Sovelluksessa ilmeni odottamaton virhe.
            </p>
            {this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  background: 'var(--c-bg-hover)',
                  padding: 10,
                  borderRadius: 4,
                  marginBottom: 20,
                  fontSize: 11,
                  color: 'var(--c-text-muted)',
                  maxHeight: 150,
                  overflow: 'auto',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  Tekninen tieto
                </summary>
                <pre style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              style={{
                ...S.btnBlack,
              }}
            >
              Lataa sivu uudelleen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
