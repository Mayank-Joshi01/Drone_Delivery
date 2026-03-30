/**
 * components/map/MapView.jsx
 * ---------------------------
 * The main map area. Composes all map sub-components and two overlay elements:
 *   • RightClickHint  – banner visible until the first parcel is placed
 *   • PathStatsOverlay – top-right card shown after path calculation
 */

import { MapContainer, TileLayer } from "react-leaflet";
import { Crosshair, CheckCircle2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { useDrone }          from "../../context/DroneContext";
import { MAP_TILE_URL, STATION_LOCATION } from "../../constants";
import { fixLeafletDefaultIcons } from "../../utils/icons";

import MapEventHandler  from "./MapEventHandler";
import AnimatedPolyline from "./AnimatedPolyline";
import HubMarker        from "./HubMarker";
import ParcelMarker     from "./ParcelMarker";

// Patch Leaflet icon paths once at module evaluation time
fixLeafletDefaultIcons();

// ─── First-use hint banner ────────────────────────────────────────────────────
function RightClickHint() {
  return (
    <div style={{
      position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)",
      zIndex: 1000, background: "#050d08ee", border: "1px solid #1a3a2a",
      borderRadius: "8px", padding: "10px 16px",
      display: "flex", alignItems: "center", gap: "8px",
      fontSize: "11px", color: "#4a7a6a", backdropFilter: "blur(8px)",
      pointerEvents: "none", animation: "fadeSlideIn 0.5s ease",
    }}>
      <Crosshair size={13} color="#00ff88" />
      <span>
        <strong style={{ color: "#00ff88" }}>Right-click</strong> anywhere on the map to place a delivery parcel
      </span>
    </div>
  );
}

// ─── Post-calculation stats overlay ──────────────────────────────────────────
function PathStatsOverlay({ stats }) {
  const rows = [
    { label: "DISTANCE", value: `${stats.distance} km` },
    { label: "STOPS",    value: stats.stops             },
    { label: "ENERGY",   value: `${stats.energy} Wh`   },
    { label: "ETA",      value: `~${stats.eta} min`     },
  ];
  return (
    <div style={{
      position: "absolute", top: "16px", right: "16px", zIndex: 1000,
      background: "#050d08ee", border: "1px solid #00ff8833",
      borderRadius: "10px", padding: "14px 16px",
      backdropFilter: "blur(8px)", animation: "fadeSlideIn 0.4s ease",
      minWidth: "180px", boxShadow: "0 0 40px #00ff8811",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
        <CheckCircle2 size={12} color="#00ff88" />
        <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.15em", color: "#00ff88" }}>
          PATH COMPUTED
        </span>
      </div>
      {rows.map(({ label, value }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", gap: "16px" }}>
          <span style={{ fontSize: "9px", color: "#2a5a3a", letterSpacing: "0.1em" }}>{label}</span>
          <span style={{ fontSize: "11px", color: "#c0d8c8", fontWeight: 700 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MapView() {
  const { parcels, flightPath, pathStats, openAddParcelModal } = useDrone();

  return (
    <div style={{ flex: 1, position: "relative" }}>
      {parcels.length === 0 && <RightClickHint />}
      {pathStats           && <PathStatsOverlay stats={pathStats} />}

      <MapContainer
        center={STATION_LOCATION}
        zoom={12}
        style={{ height: "100%", width: "100%", background: "#020a05" }}
        zoomControl
      >
        <TileLayer url={MAP_TILE_URL} attribution="" />

        {/* Right-click → open modal */}
        <MapEventHandler onRightClick={openAddParcelModal} />

        {/* Static hub */}
        <HubMarker />

        {/* Dynamic parcel drops */}
        {parcels.map((parcel, i) => (
          <ParcelMarker key={parcel.id} parcel={parcel} index={i} />
        ))}

        {/* Computed route polyline */}
        {flightPath.length > 1 && <AnimatedPolyline positions={flightPath} />}
      </MapContainer>
    </div>
  );
}
