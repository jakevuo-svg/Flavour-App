const S = {
  // Main app container
  app: { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", fontSize: 13, color: "#ddd", background: "#111", minHeight: "100vh", maxWidth: 1200, margin: "0 auto" },

  // Borders
  border: { border: "2px solid #ddd" },
  borderThin: { border: "1px solid #555" },
  borderBottom: { borderBottom: "2px solid #ddd" },

  // Backgrounds
  bg: { background: "#1e1e1e" },
  bgDark: { background: "#ddd", color: "#111" },
  bgGray: { background: "#2a2a2a" },

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
  small: { fontSize: 11, color: "#999" },
  label: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#999", marginBottom: 2 },
  value: { fontSize: 13, fontWeight: 500 },
  pointer: { cursor: "pointer" },

  // Buttons
  btnWire: { border: "2px solid #ddd", background: "#1e1e1e", color: "#ddd", padding: "6px 16px", fontWeight: 700, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  btnBlack: { border: "2px solid #ddd", background: "#ddd", color: "#111", padding: "6px 16px", fontWeight: 700, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  btnSmall: { border: "1px solid #ddd", background: "#1e1e1e", color: "#ddd", padding: "3px 10px", fontWeight: 600, cursor: "pointer", fontSize: 11, textTransform: "uppercase" },
  btnActive: { border: "2px solid #ddd", background: "#ddd", color: "#111", padding: "6px 16px", fontWeight: 700, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  btnDanger: { border: "2px solid #ff4444", background: "#ff4444", color: "#fff", padding: "6px 16px", fontWeight: 700, cursor: "pointer", fontSize: 12, textTransform: "uppercase" },

  // Inputs
  input: { border: "2px solid #ddd", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#1e1e1e", color: "#ddd", colorScheme: "dark" },
  inputFull: { border: "2px solid #ddd", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box", background: "#1e1e1e", color: "#ddd", colorScheme: "dark" },
  select: { border: "2px solid #ddd", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#1e1e1e", color: "#ddd", cursor: "pointer", colorScheme: "dark" },
  selectFull: { border: "2px solid #ddd", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#1e1e1e", color: "#ddd", cursor: "pointer", width: "100%", boxSizing: "border-box", colorScheme: "dark" },

  // Tags
  tag: (active) => ({ border: "1px solid #ddd", background: active ? "#ddd" : "#1e1e1e", color: active ? "#111" : "#ddd", padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", display: "inline-block" }),

  // Layout
  cardField: { marginBottom: 10 },
  formRow: { marginBottom: 12 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formGrid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },

  // Table rows
  row: { display: "flex", borderBottom: "1px solid #444", padding: "6px 12px", alignItems: "center", cursor: "pointer" },
  rowHeader: { display: "flex", borderBottom: "2px solid #ddd", padding: "6px 12px", background: "#2a2a2a", fontWeight: 700, fontSize: 11, textTransform: "uppercase" },
  col: (flex = 1) => ({ flex, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }),

  // Sections (original card equivalent)
  section: { border: "2px solid #ddd", background: "#1e1e1e", marginBottom: 2 },
  card: { border: "2px solid #ddd", background: "#1e1e1e", marginBottom: 2 },

  // Modal
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", justifyContent: "center", alignItems: "center" },
  modalBox: { border: "2px solid #ddd", background: "#1e1e1e", color: "#ddd", padding: 32, width: 480, maxHeight: "85vh", overflowY: "auto" },
  modalBoxLg: { border: "2px solid #ddd", background: "#1e1e1e", color: "#ddd", padding: 32, width: 700, maxHeight: "85vh", overflowY: "auto" },

  // Toast
  toast: { position: "fixed", top: 60, right: 20, background: "#ddd", color: "#111", padding: "10px 20px", zIndex: 300, fontWeight: 700, fontSize: 12 },
};

export default S;
