/**
 * components/map/ParcelMarker.jsx
 * ---------------------------------
 * A single delivery-stop marker.
 * Icon colour reflects parcel priority; index badge shows stop order.
 *
 * Props
 * ─────
 * parcel  { id, name, weight, priority, lat, lng }
 * index   zero-based position in the parcels array
 */

import { Marker, Popup }    from "react-leaflet";
import { createParcelIcon } from "../../utils/icons";
import { priorityColor }    from "../../utils/calculations";

export default function ParcelMarker({ parcel, index }) {
  const color = priorityColor(parcel.priority);

  return (
    <Marker
      position={[parcel.lat, parcel.lng]}
      icon={createParcelIcon(parcel.priority, index)}
    >
      <Popup closeButton={false}>
        <div style={{
          background: "#050d08", border: "1px solid #1a3a2a",
          borderRadius: "8px", padding: "10px 14px", minWidth: "150px",
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#c0d8c8", marginBottom: "6px" }}>
            📦 {parcel.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "10px", color: "#4a7a6a" }}>
            <span>Weight:   <strong style={{ color: "#c0d8c8" }}>{parcel.weight} kg</strong></span>
            <span>Priority: <strong style={{ color }}>{parcel.priority}/10</strong></span>
            <span>Stop:     <strong style={{ color: "#00ff88" }}>#{index + 1}</strong></span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
