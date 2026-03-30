/**
 * components/sidebar/ConfigTab.jsx
 * ----------------------------------
 * Drone configuration panel:
 *   • Three ConfigInput fields (payload, base energy, weight-impact factor)
 *   • Live payload gauge bar with overload warning
 *   • Hub coordinates display
 *   • Priority-band colour legend
 */

import { Zap, Weight, Activity, AlertCircle } from "lucide-react";
import { useDrone }           from "../../context/DroneContext";
import { STATION_LOCATION, PRIORITY_BANDS } from "../../constants";
import { payloadPercent }     from "../../utils/calculations";
import ConfigInput            from "./ConfigInput";

// ─── Thin horizontal divider with centred label ───────────────────────────────
function SectionDivider({ label }) {
  const line = { flex: 1, height: "1px", background: "#0f2a1a" };
  return (
    <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", color: "#2a5a3a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={line} /> {label} <div style={line} />
    </div>
  );
}

// ─── Two-column coordinate pill ───────────────────────────────────────────────
function CoordPill({ label, value }) {
  return (
    <div style={{ flex: 1, background: "#050d08", borderRadius: "4px", padding: "6px 8px", border: "1px solid #0a1a12" }}>
      <div style={{ fontSize: "8px", color: "#2a5a3a", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "#00ff88", fontWeight: 600 }}>{value.toFixed(4)}</div>
    </div>
  );
}

// ─── Single priority legend row ───────────────────────────────────────────────
function LegendRow({ range, label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: color, boxShadow: `0 0 6px ${color}88`, flexShrink: 0 }} />
      <span style={{ fontSize: "10px", color, fontWeight: 600, flex: 1 }}>{label}</span>
      <span style={{ fontSize: "10px", color: "#2a5a3a" }}>{range}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ConfigTab() {
  const { droneConfig, updateDroneConfig, totalWeight, isOverloaded } = useDrone();
  const pct = payloadPercent(totalWeight, droneConfig.maxPayload);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeSlideIn 0.3s ease" }}>

      {/* ── Drone Parameters ── */}
      <div>
        <SectionDivider label="DRONE PARAMETERS" />
        <div style={{ background: "#0a1a12", borderRadius: "10px", padding: "14px", border: "1px solid #0f2a1a", display: "flex", flexDirection: "column", gap: "14px" }}>
          <ConfigInput
            label="Max Payload"         value={droneConfig.maxPayload}
            min={1} max={50} step={0.5} unit="kg" icon={Weight}
            onChange={(v) => updateDroneConfig("maxPayload", v)}
          />
          <ConfigInput
            label="Base Energy Cost"    value={droneConfig.baseEnergyCost}
            min={10} max={500} step={5} unit="Wh" icon={Zap}
            onChange={(v) => updateDroneConfig("baseEnergyCost", v)}
          />
          <ConfigInput
            label="Weight Impact Factor" value={droneConfig.weightImpactFactor}
            min={0.1} max={10} step={0.1} unit="×" icon={Activity}
            onChange={(v) => updateDroneConfig("weightImpactFactor", v)}
          />
        </div>
      </div>

      {/* ── Payload gauge ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#4a7a6a", marginBottom: "6px", letterSpacing: "0.1em" }}>
          <span>PAYLOAD LOAD</span>
          <span style={{ color: isOverloaded ? "#ff4444" : "#00ff88", fontWeight: 700 }}>
            {totalWeight.toFixed(1)} / {droneConfig.maxPayload} kg
          </span>
        </div>

        {/* Bar track */}
        <div style={{ height: "6px", background: "#0a1a12", borderRadius: "3px", overflow: "hidden", border: "1px solid #0f2a1a" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: isOverloaded
              ? "linear-gradient(90deg,#ff4444,#ff6666)"
              : "linear-gradient(90deg,#00cc66,#00ff88)",
            borderRadius: "3px",
            transition: "width 0.5s ease, background 0.3s ease",
            boxShadow: isOverloaded ? "0 0 8px #ff444466" : "0 0 8px #00ff8844",
          }} />
        </div>

        {/* Overload warning */}
        {isOverloaded && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", padding: "6px 10px", background: "#ff000011", borderRadius: "6px", border: "1px solid #ff222233", fontSize: "10px", color: "#ff6666" }}>
            <AlertCircle size={11} />
            Payload exceeds max capacity
          </div>
        )}
      </div>

      {/* ── Hub coordinates ── */}
      <div style={{ background: "#0a1a12", borderRadius: "8px", padding: "12px", border: "1px solid #0f2a1a" }}>
        <div style={{ fontSize: "9px", color: "#2a5a3a", letterSpacing: "0.15em", marginBottom: "8px", fontWeight: 700 }}>HUB COORDINATES</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <CoordPill label="LAT" value={STATION_LOCATION[0]} />
          <CoordPill label="LNG" value={STATION_LOCATION[1]} />
        </div>
      </div>

      {/* ── Priority legend ── */}
      <div style={{ background: "#0a1a12", borderRadius: "8px", padding: "12px", border: "1px solid #0f2a1a" }}>
        <div style={{ fontSize: "9px", color: "#2a5a3a", letterSpacing: "0.15em", marginBottom: "10px", fontWeight: 700 }}>PRIORITY LEGEND</div>
        <LegendRow range="8 – 10" label={PRIORITY_BANDS.HIGH.label}   color={PRIORITY_BANDS.HIGH.color}   />
        <LegendRow range="5 – 7"  label={PRIORITY_BANDS.MEDIUM.label} color={PRIORITY_BANDS.MEDIUM.color} />
        <LegendRow range="1 – 4"  label={PRIORITY_BANDS.LOW.label}    color={PRIORITY_BANDS.LOW.color}    />
      </div>
    </div>
  );
}
