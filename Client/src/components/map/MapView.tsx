import { MapContainer, TileLayer } from "react-leaflet";
import { Crosshair, CheckCircle2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { MAP_TILE_URL, STATION_LOCATION } from "../../constants";
import { fixLeafletDefaultIcons } from "../../utils/icons";

import MapEventHandler from "./MapEventHandler";
import AnimatedPolyline from "./AnimatedPolyline";
import HubMarker from "./HubMarker";
import ParcelMarker from "./ParcelMarker";
import { useParcel } from "../../context/ParcleContext";
import { usePath} from "../../context/PathContext";
import type { PathStats } from "../../context/PathContext";
import MouseCoordinateOverlay from "./MouseMove";
import MapController from "./MapController";

// Patch Leaflet icon paths once at module evaluation time
fixLeafletDefaultIcons();

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface PathStatsOverlayProps {
  stats: PathStats;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function RightClickHint() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#050d08ee] border border-[#1a3a2a] rounded-lg px-4 py-[10px] flex items-center gap-2 text-[11px] text-[#4a7a6a] backdrop-blur-md pointer-events-none animate-[fadeSlideIn_0.5s_ease]">
      <Crosshair size={13} className="text-[#00ff88]" />
      <span>
        <strong className="text-[#00ff88]">Right-click</strong> anywhere on the map to place a delivery parcel
      </span>
    </div>
  );
}

function PathStatsOverlay({ stats }: PathStatsOverlayProps) {
  // Define standard display rows
  const rows = [
    { label: "DISTANCE", value: `${stats.totalDistance.toFixed(2)} km` },
    { label: "ENERGY",   value: `${Math.round(stats.estimatedEnergy)} Wh` },
    { label: "ETA",      value: `~${Math.round(stats.estimatedTime)} min` },
  ];

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-[#050d08ee] border border-[#00ff8833] rounded-[10px] p-[14px_16px] backdrop-blur-md animate-[fadeSlideIn_0.4s_ease] min-w-[180px] shadow-[0_0_40px_#00ff8811]">
      <div className="flex items-center gap-[6px] mb-3">
        <CheckCircle2 size={12} className="text-[#00ff88]" />
        <span className="text-[9px] font-extrabold tracking-[0.15em] text-[#00ff88]">
          PATH COMPUTED
        </span>
      </div>
      
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between mb-[6px] gap-4">
          <span className="text-[9px] text-[#2a5a3a] tracking-[0.1em]">{label}</span>
          <span className="text-[11px] text-[#c0d8c8] font-bold">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapView() {
  const { parcels, openAddParcelModal } = useParcel();
  const { flightPath, pathStats } = usePath();

  return (
    <div className="flex-1 relative">
      {/* ── Overlays ── */}
      {parcels.length === 0 && <RightClickHint />}
      {pathStats && <PathStatsOverlay stats={pathStats} />}

      

      {/* ── Leaflet Map ── */}
      <MapContainer
        center={STATION_LOCATION}
        zoom={12}
        className="h-full w-full bg-[#020a05]"
        zoomControl
      >
        <TileLayer url={MAP_TILE_URL} attribution="" />

        <MouseCoordinateOverlay />
        <MapController />

        {/* Captures right-clicks and sends coordinates to ParcelContext */}
        <MapEventHandler onRightClick={openAddParcelModal} />

        {/* Static Hub at STATION_LOCATION */}
        <HubMarker />

        {/* Dynamic Parcel Drop Markers */}
        {parcels.map((parcel, i) => (
          <ParcelMarker 
            key={parcel.id} 
            parcel={parcel} 
            index={i} 
          />
        ))}

        {/* Render the flight path if coordinates exist */}
        {flightPath.length > 1 && (
          <AnimatedPolyline positions={flightPath} />
        )}
      </MapContainer>
    </div>
  );
}