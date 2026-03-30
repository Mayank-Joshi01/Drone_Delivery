/**
 * components/sidebar/ConfigInput.jsx
 * ------------------------------------
 * Reusable labelled <input type="number"> for the Drone Config panel.
 *
 * Props
 * ─────
 * label    string           shown above the field (auto-uppercased via CSS)
 * value    number
 * onChange (number) => void
 * min      number
 * max      number
 * step     number
 * icon     lucide-react component (optional)
 * unit     string           shown right-aligned in the label row (optional)
 */
export default function ConfigInput({ label, value, onChange, min, max, step, icon: Icon, unit }) {
  return (
    <div>
      {/* Label row */}
      <label style={{
        display: "flex", alignItems: "center", gap: "6px",
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em",
        color: "#4a7a6a", textTransform: "uppercase", marginBottom: "6px",
        fontFamily: "'JetBrains Mono',monospace",
      }}>
        {Icon && <Icon size={11} />}
        {label}
        {unit && <span style={{ color: "#2a4a3a", marginLeft: "auto" }}>{unit}</span>}
      </label>

      {/* Input */}
      <input
        type="number"
        value={value}
        min={min} max={max} step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "#0a1a12", border: "1px solid #1a3a2a", borderRadius: "6px",
          padding: "8px 12px", color: "#00ff88",
          fontSize: "14px", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace",
          outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={(e) => { e.target.style.borderColor = "#00ff88"; e.target.style.boxShadow = "0 0 0 2px #00ff8822"; }}
        onBlur={(e)  => { e.target.style.borderColor = "#1a3a2a"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}
