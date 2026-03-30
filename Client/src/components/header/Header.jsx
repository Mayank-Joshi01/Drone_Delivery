/**
 * components/header/Header.jsx
 * -----------------------------
 * Top navigation bar: brand logo, online status dot, and live stat pills.
 */

import { Radio } from "lucide-react";
import { useDrone } from "../../context/DroneContext";

// ─── Single stat pill ─────────────────────────────────────────────────────────
function StatPill({ label, value, danger }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: "9px", color: "#2a5a3a", letterSpacing: "0.15em", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: "11px", color: danger ? "#ff4444" : "#00ff88", fontWeight: 700, letterSpacing: "0.05em" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Header() {
  const { isOverloaded } = useDrone();

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: "52px",
      background: "#050d08", borderBottom: "1px solid #0f2a1a",
      flexShrink: 0, zIndex: 10,
    }}>

      {/* ── Left: brand + status ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

        {/* Logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px",
            background: "linear-gradient(135deg,#00ff88,#00cc66)",
            borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Radio size={14} color="#001a0d" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "0.05em", color: "#ffffff", fontFamily: "'Syne',sans-serif" }}>
            DRONEOPS
          </span>
          <span style={{ fontSize: "10px", color: "#00ff88", letterSpacing: "0.2em", fontWeight: 600, opacity: 0.7 }}>
            DISPATCH v2.4
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: "20px", width: "1px", background: "#0f2a1a" }} />

        {/* Online indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#00ff88", animation: "blink 1.5s ease-in-out infinite",
          }} />
          <span style={{ fontSize: "10px", color: "#4a7a6a", letterSpacing: "0.1em" }}>
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* ── Right: stat pills ── */}
      <div style={{ display: "flex", gap: "20px" }}>
        <StatPill label="HUB"    value="NEW DELHI" />
        <StatPill label="DRONES" value="01 ACTIVE" />
        <StatPill
          label="STATUS"
          value={isOverloaded ? "⚠ OVERLOAD" : "NOMINAL"}
          danger={isOverloaded}
        />
      </div>
    </header>
  );
}
