import { Marker, Popup } from "react-leaflet";
import { hubIcon } from "../../utils/icons";
import { STATION_LOCATION } from "../../constants";
import type { CSSProperties } from "react";
import { useDepo } from "../../context/DepoContext";

// ─── Styles ──────────────────────────────────────────────────────────────────

// Using CSSProperties ensures our font-family string is valid
const popupContainerStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HubMarker() {
  const { depo} = useDepo();

  return (
    <Marker position={depo ? {lat: depo.lat , lng: depo.lon} : STATION_LOCATION} icon={hubIcon}>
      {/* Leaflet popups often have default white backgrounds. 
          The 'closeButton={false}' prop keeps our UI clean.
      */}
      <Popup closeButton={false}>
        <div 
          style={popupContainerStyle}
          className="bg-[#050d08] border border-[#1a3a2a] rounded-lg p-[10px_14px] min-w-[140px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          {/* Status Label */}
          <div className="text-[10px] font-extrabold text-[#00ff88] tracking-[0.15em] mb-1">
            🟢 DISPATCH HUB
          </div>

          {/* Location Name */}
          <div className="text-[10px] text-[#4a7a6a] font-semibold">
            New Delhi, India
          </div>

          {/* Coordinates (Safely accessing the tuple) */}
          <div className="text-[9px] text-[#1a4a2a] mt-1 font-mono">
            {STATION_LOCATION[0].toFixed(4)}, {STATION_LOCATION[1].toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}