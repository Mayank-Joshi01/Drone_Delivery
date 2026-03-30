/**
 * components/sidebar/ManifestTab.jsx
 * ------------------------------------
 * Scrollable list of queued delivery parcels with individual delete buttons.
 * Shows an empty-state placeholder when no parcels have been added.
 */

import { Package, Trash2 } from "lucide-react";
import { useDrone }         from "../../context/DroneContext";
import { priorityColor }    from "../../utils/calculations";
import { PRIORITY_BANDS }   from "../../constants";

// ─── Coloured priority badge ──────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const color = priorityColor(priority);
  const label =
    priority >= PRIORITY_BANDS.HIGH.minScore   ? "CRIT" :
    priority >= PRIORITY_BANDS.MEDIUM.minScore ? "MED"  : "STD";
  return (
    <span style={{
      fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em",
      padding: "2px 6px", borderRadius: "3px",
      background: `${color}22`, color, border: `1px solid ${color}66`,
      fontFamily: "'JetBrains Mono',monospace",
    }}>
      {label}
    </span>
  );
}

// ─── Single parcel row ────────────────────────────────────────────────────────
function ParcelRow({ parcel, index, onDelete }) {
  return (
    <div
      style={{
        background: "#0a1a12", borderRadius: "8px", padding: "10px 12px",
        border: "1px solid #0f2a1a", display: "flex", alignItems: "center",
        gap: "10px", animation: "fadeSlideIn 0.3s ease", transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#1a3a2a")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#0f2a1a")}
    >
      {/* Stop number */}
      <div style={{
        width: "22px", height: "22px", borderRadius: "50%", background: "#0f2a1a",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "10px", color: "#00ff88", fontWeight: 800, flexShrink: 0,
      }}>
        {index + 1}
      </div>

      {/* Name + badges */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "11px", fontWeight: 700, color: "#c0d8c8",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {parcel.name}
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "4px", alignItems: "center" }}>
          <PriorityBadge priority={parcel.priority} />
          <span style={{ fontSize: "10px", color: "#4a7a6a" }}>{parcel.weight} kg</span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(parcel.id)}
        title="Remove parcel"
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          color: "#1a3a2a", padding: "4px", borderRadius: "4px",
          display: "flex", alignItems: "center", transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4444")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#1a3a2a")}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Empty-state ──────────────────────────────────────────────────────────────
function EmptyManifest() {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "#1a4a2a" }}>
      <Package size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
      <div style={{ fontSize: "11px", letterSpacing: "0.1em" }}>NO PARCELS LOADED</div>
      <div style={{ fontSize: "10px", marginTop: "6px", color: "#0f2a1a" }}>
        Right-click the map to add
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ManifestTab() {
  const { parcels, deleteParcel } = useDrone();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", animation: "fadeSlideIn 0.3s ease" }}>
      {parcels.length === 0
        ? <EmptyManifest />
        : parcels.map((parcel, i) => (
            <ParcelRow key={parcel.id} parcel={parcel} index={i} onDelete={deleteParcel} />
          ))
      }
    </div>
  );
}
