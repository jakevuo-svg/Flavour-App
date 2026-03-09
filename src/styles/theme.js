/**
 * Theme styles using CSS custom properties.
 *
 * Colors are defined in index.css as --c-xxx variables.
 * Toggling data-theme="dark"|"light" on <html> switches the palette.
 * All 33+ component files importing S get theme-aware styles automatically.
 */
const S = {
  // Main app container
  app: { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", fontSize: 13, color: "var(--c-text)", background: "var(--c-bg)", minHeight: "100vh", maxWidth: 1200, margin: "0 auto" },

  // Borders
  border: { border: "2px solid var(--c-border)" },
  borderThin: { border: "1px solid var(--c-border-soft)" },
  borderBottom: { borderBottom: "2px solid var(--c-border)" },

  // Backgrounds
  bg: { background: "var(--c-bg-card)" },
  bgDark: { background: "var(--c-accent-bg)", color: "var(--c-text-inverse)" },
  bgGray: { background: "var(--c-bg-hover)" },

  // Padding
  pad: { padding: "8px 12px" },
  padSm: { padding: "4px 8px" },

  // Flex
  flex: { display: "flex", alignItems: "center" },
  flexBetween: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  flexWrap: { display: "flex", flexWrap: "wrap", gap: 6 },

  // Spacing
  gap: { gap: 8 },
  gapLg: { gap: 16 },

  // Typography
  bold: { fontWeight: 700 },
  upper: { textTransform: "uppercase", letterSpacing: 1 },
  small: { fontSize: 11, color: "var(--c-text-muted)" },
  label: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--c-text-muted)", marginBottom: 2 },
  value: { fontSize: 13, fontWeight: 500 },
  pointer: { cursor: "pointer" },

  // Buttons
  btnWire: { border: "2px solid var(--c-border)", background: "var(--c-bg-card)", color: "var(--c-text)", padding: "6px 16px", fontWeight: 700, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  btnBlack: { border: "2px solid var(--c-accent-bg)", background: "var(--c-accent-bg)", color: "var(--c-text-inverse)", padding: "6px 16px", fontWeight: 700, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  btnSmall: { border: "1px solid var(--c-border)", background: "var(--c-bg-card)", color: "var(--c-text)", padding: "3px 10px", fontWeight: 600, cursor: "pointer", fontSize: 11, textTransform: "uppercase" },
  btnActive: { border: "2px solid var(--c-accent-bg)", background: "var(--c-accent-bg)", color: "var(--c-text-inverse)", padding: "6px 16px", fontWeight: 700, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  btnDanger: { border: "2px solid var(--c-danger)", background: "var(--c-danger)", color: "var(--c-danger-text)", padding: "6px 16px", fontWeight: 700, cursor: "pointer", fontSize: 12, textTransform: "uppercase" },

  // Inputs
  input: { border: "2px solid var(--c-border)", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--c-bg-card)", color: "var(--c-text)", colorScheme: "var(--c-color-scheme)" },
  inputFull: { border: "2px solid var(--c-border)", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box", background: "var(--c-bg-card)", color: "var(--c-text)", colorScheme: "var(--c-color-scheme)" },
  select: { border: "2px solid var(--c-border)", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--c-bg-card)", color: "var(--c-text)", cursor: "pointer", colorScheme: "var(--c-color-scheme)" },
  selectFull: { border: "2px solid var(--c-border)", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--c-bg-card)", color: "var(--c-text)", cursor: "pointer", width: "100%", boxSizing: "border-box", colorScheme: "var(--c-color-scheme)" },

  // Tags
  tag: (active) => ({ border: "1px solid var(--c-border)", background: active ? "var(--c-accent-bg)" : "var(--c-bg-card)", color: active ? "var(--c-text-inverse)" : "var(--c-text)", padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", display: "inline-block" }),

  // Layout
  cardField: { marginBottom: 10 },
  formRow: { marginBottom: 12 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 },
  formGrid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 },

  // Table rows
  row: { display: "flex", borderBottom: "1px solid var(--c-border-row)", padding: "6px 12px", alignItems: "center", cursor: "pointer" },
  rowHeader: { display: "flex", borderBottom: "2px solid var(--c-border)", padding: "6px 12px", background: "var(--c-bg-hover)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" },
  col: (flex = 1) => ({ flex, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }),

  // Sections
  section: { border: "2px solid var(--c-border)", background: "var(--c-bg-card)", marginBottom: 2 },
  card: { border: "2px solid var(--c-border)", background: "var(--c-bg-card)", marginBottom: 2 },

  // Modal
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "var(--c-modal-overlay)", zIndex: 200, display: "flex", justifyContent: "center", alignItems: "center" },
  modalBox: { border: "2px solid var(--c-border)", background: "var(--c-bg-card)", color: "var(--c-text)", padding: 32, width: "min(480px, calc(100vw - 24px))", maxHeight: "85vh", overflowY: "auto" },
  modalBoxLg: { border: "2px solid var(--c-border)", background: "var(--c-bg-card)", color: "var(--c-text)", padding: 32, width: "min(700px, calc(100vw - 24px))", maxHeight: "85vh", overflowY: "auto" },

  // Toast
  toast: { position: "fixed", top: 60, right: 20, background: "var(--c-toast-bg)", color: "var(--c-toast-text)", padding: "10px 20px", zIndex: 300, fontWeight: 700, fontSize: 12 },
};

export default S;
