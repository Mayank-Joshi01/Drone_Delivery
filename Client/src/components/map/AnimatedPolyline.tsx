import { Polyline } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface AnimatedPolylineProps {
  positions: LatLngExpression[];
  onClick?: () => void; 
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnimatedPolyline({ positions, onClick }: AnimatedPolylineProps) {
  if (!positions || positions.length < 2) return null;

  // We wrap the callback in an object that Leaflet understands
  const handlers = {
    click: () => {
      if (onClick) onClick();
    },
  };

  return (
    <>
      {/* ── Glow Halo ── */}
      <Polyline
        positions={positions}
        pathOptions={{ 
          color: "#00ff88", 
          weight: 12, // Increased hit-box weight
          opacity: 0.12 
        }}
        // Adding eventHandlers here makes the "glow" area clickable too!
        eventHandlers={handlers}
      />

      {/* ── Dashed Route ── */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#00ff88",
          weight: 2,
          opacity: 0.9,
          dashArray: "10, 6",
          lineCap: "round",
          // Suggestion: Add a cursor style so user knows it's clickable
          className: onClick ? "cursor-pointer" : ""
        }}
        eventHandlers={handlers}
      />
    </>
  );
}