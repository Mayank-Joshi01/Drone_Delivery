/**
 * components/bottombar/BottomBar.jsx
 * ------------------------------------
 * Fixed footer below the map:
 *   Left  → three stat cells (total parcels / total weight / capacity %)
 *   Right → optional Reset All button + primary Dispatch button
 */

import { Package, Weight, Activity, RotateCcw, Send, ChevronRight } from "lucide-react";
import { useDrone }       from "../../context/DroneContext";
import { useDispatch }    from "../../hooks/useDispatch";
import { payloadPercent } from "../../utils/calculations";

// ─── Icon + label + value cell ────────────────────────────────────────────────
function StatCell({ icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{
        width: "32px", height: "32px", background: "#0a1a12", borderRadius: "8px",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid #0f2a1a",
      }}>
        <Icon size={13} color="#00ff88" />
      </div>
      <div>
        <div style={{ fontSize: "8px", color: "#2a5a3a", letterSpacing: "0.15em", fontWeight: 700 }}>
          {label}
        </div>
        <div style={{ fontSize: "14px", color: "#c0d8c8", fontWeight: 700, lineHeight: 1, marginTop: "2px" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Spinner used inside the dispatch button while calculating ────────────────
function Spinner() {
  return (
    <div style={{
      width: "14px", height: "14px",
      border: "2px solid #00ff8844", borderTop: "2px solid #00ff88",
      borderRadius: "50%", animation: "spin 0.8s linear infinite",
    }} />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BottomBar() {
  const { parcels, totalWeight, droneConfig, isOverloaded, isCalculating, resetAll } = useDrone();
  const { handleCalculatePath } = useDispatch();

  const disabled = parcels.length === 0 || isCalculating || isOverloaded;
  const pct      = payloadPercent(totalWeight, droneConfig.maxPayload);

  return (
    <div style={{
      height: "68px", background: "#050d08", borderTop: "1px solid #0f2a1a",
      display: "flex", alignItems: "center", padding: "0 20px",
      gap: "16px", flexShrink: 0,
    }}>

      {/* ── Stats ── */}
      <div style={{ display: "flex", gap: "24px" }}>
        <StatCell icon={Package}  label="TOTAL PARCELS" value={parcels.length} />
        <StatCell icon={Weight}   label="TOTAL WEIGHT"  value={`${totalWeight.toFixed(1)} kg`} />
        <StatCell icon={Activity} label="CAPACITY"      value={`${pct}%`} />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ── Reset button (only when parcels exist) ── */}
      {parcels.length > 0 && (
        <button
          onClick={resetAll}
          style={{
            background: "transparent", border: "1px solid #1a3a2a", borderRadius: "8px",
            padding: "0 16px", height: "40px", color: "#4a7a6a",
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            transition: "all 0.2s", fontFamily: "'JetBrains Mono',monospace",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff444444"; e.currentTarget.style.color = "#ff6666"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a3a2a";   e.currentTarget.style.color = "#4a7a6a"; }}
        >
          <RotateCcw size={12} /> RESET ALL
        </button>
      )}

      {/* ── Primary dispatch button ── */}
      <button
        onClick={handleCalculatePath}
        disabled={disabled}
        style={{
          background: disabled
            ? "#0a1a12"
            : "linear-gradient(135deg,#00cc66,#00ff88)",
          border: "none", borderRadius: "10px",
          padding: "0 24px", height: "44px",
          color: disabled ? "#1a4a2a" : "#001a0d",
          fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: "8px",
          transition: "all 0.3s ease", fontFamily: "'JetBrains Mono',monospace",
          minWidth: "220px", justifyContent: "center",
          boxShadow: !disabled ? "0 0 24px #00ff8844, 0 4px 16px #00cc6633" : "none",
        }}
      >
        {isCalculating
          ? <><Spinner /> COMPUTING PATH...</>
          : <><Send size={13} /> CALCULATE DELIVERY PATH <ChevronRight size={13} /></>
        }
      </button>
    </div>
  );
}
