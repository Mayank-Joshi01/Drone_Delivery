/**
 * components/map/HubMarker.jsx
 * ------------------------------
 * The dispatch hub marker: pulsing green circle at STATION_LOCATION.
 * Clicking it opens a dark-themed popup with the hub's name and coordinates.
 */

import { Marker, Popup } from "react-leaflet";
import { hubIcon }        from "../../utils/icons";
import { STATION_LOCATION } from "../../constants";

export default function HubMarker() {
  return (
    <Marker position={STATION_LOCATION} icon={hubIcon}>
      <Popup closeButton={false}>
        <div style={{
          background: "#050d08", border: "1px solid #1a3a2a",
          borderRadius: "8px", padding: "10px 14px", minWidth: "140px",
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#00ff88", letterSpacing: "0.15em", marginBottom: "4px" }}>
            🟢 DISPATCH HUB
          </div>
          <div style={{ fontSize: "10px", color: "#4a7a6a" }}>New Delhi, India</div>
          <div style={{ fontSize: "9px", color: "#1a4a2a", marginTop: "4px" }}>
            {STATION_LOCATION[0].toFixed(4)}, {STATION_LOCATION[1].toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
