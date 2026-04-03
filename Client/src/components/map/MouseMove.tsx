import { useState } from "react";
import { useMapEvents } from "react-leaflet";

export default function MouseCoordinateOverlay() {
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

  useMapEvents({
    mousemove(e) {
      setCoords(e.latlng);
    },
  });

  return (
    <div style={{
      position: "absolute", bottom: "10px", left: "10px", zIndex: 1000,
      background: "#050d08ee", color: "#00ff88", padding: "4px 8px",
      fontSize: "10px", fontFamily: "monospace", borderRadius: "4px",
      border: "1px solid #1a3a2a"
    }}>
      LAT: {coords.lat.toFixed(5)} | LNG: {coords.lng.toFixed(5)}
    </div>
  );
}