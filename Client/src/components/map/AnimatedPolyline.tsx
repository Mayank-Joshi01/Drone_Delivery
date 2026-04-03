import { Polyline } from "react-leaflet";
import  type { LatLngExpression } from "leaflet";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface AnimatedPolylineProps {
  /** * An array of coordinates defining the drone's flight path.
   * Can be [number, number] or {lat: number, lng: number}
   */
  positions: LatLngExpression[];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnimatedPolyline({ positions }: AnimatedPolylineProps) {
  // Safety check to prevent Leaflet from crashing on empty paths
  if (!positions || positions.length < 2) return null;

  return (
    <>
      {/* ── Glow Halo ── */}
      {/* Provides a soft green outer glow for the flight path */}
      <Polyline
        positions={positions}
        pathOptions={{ 
          color: "#00ff88", 
          weight: 6, 
          opacity: 0.12 
        }}
      />

      {/* ── Dashed Route ── */}
      {/* The primary animated-style path line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#00ff88",
          weight: 2,
          opacity: 0.9,
          dashArray: "10, 6",
          lineCap: "round",
        }}
      />
    </>
  );
}