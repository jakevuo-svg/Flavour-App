import S from '../../styles/theme';

export default function Field({ label, children }) {
  return (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={S.label}>{label}</div>
      {children}
    </div>
  );
}
