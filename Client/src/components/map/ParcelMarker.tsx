import { Marker, Popup } from "react-leaflet";
import { createParcelIcon } from "../../utils/icons";
import { priorityColor } from "../../utils/calculations";

// 1. Define or Import the Parcel interface
// (If you have this in a types file or context, import it instead)
interface Parcel {
  id: string;
  name: string;
  weight: number;
  priority: number; // 1-10
  lat: number;
  lon: number;
}

// 2. Define the props for this component
interface ParcelMarkerProps {
  parcel: Parcel;
  index: number; // The stop number in the route
}

// ─── Component ────────────────────────────────────────────────────────────────
// Apply the defined props interface
export default function ParcelMarker({ parcel, index }: ParcelMarkerProps) {
  // TypeScript knows 'parcel.priority' is a number
  const color = priorityColor(parcel.priority);

  return (
    <Marker
      // positions expects [number, number] which lat/lng are
      position={[parcel.lat, parcel.lon]}
      // Ensure your createParcelIcon util is also typed for priority/index
      icon={createParcelIcon(parcel.priority, index)}
    >
      <Popup closeButton={false}>
        {/*
          Tip: As you convert the rest of your app, consider replacing 
          these inline styles with Tailwind classes for consistency!
        */}
        <div style={{
          background: "#050d08",
          border: "1px solid #1a3a2a",
          borderRadius: "8px",
          padding: "10px 14px",
          minWidth: "150px",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {/* Parcel Name */}
          <div style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#c0d8c8",
            marginBottom: "6px"
          }}>
            📦 {parcel.name}
          </div>

          {/* Details */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            fontSize: "10px",
            color: "#4a7a6a"
          }}>
            <span>
              Weight: <strong style={{ color: "#c0d8c8" }}>{parcel.weight} kg</strong>
            </span>
            <span>
              Priority: <strong style={{ color }}>{parcel.priority}/10</strong>
            </span>
            <span>
              Stop: <strong style={{ color: "#00ff88" }}>#{index + 1}</strong>
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}