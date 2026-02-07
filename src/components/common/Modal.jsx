import S from '../../styles/theme';

export default function Modal({ show, onClose, title, large = false, children }) {
  if (!show) return null;

  return (
    <div style={S.modal} onClick={onClose}>
      <div
        style={large ? S.modalBoxLg : S.modalBox}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar with close button */}
        {title && (
          <div style={S.rowHeader}>
            <h2 style={{ margin: 0, flex: 1, fontSize: 18 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                ...S.btnSmall,
                marginLeft: 12
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
