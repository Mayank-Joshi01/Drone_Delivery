/**
 * components/map/AnimatedPolyline.jsx
 * -------------------------------------
 * Renders the computed delivery flight path as two stacked Leaflet Polylines:
 *   1. Wide, low-opacity solid line → neon glow halo
 *   2. Thin dashed line on top      → animated "scanning" look
 *
 * Props
 * ─────
 * positions  Array of [lat, lng] tuples (at least 2 points)
 */

import { Polyline } from "react-leaflet";

export default function AnimatedPolyline({ positions }) {
  if (!positions || positions.length < 2) return null;

  return (
    <>
      {/* Glow halo */}
      <Polyline
        positions={positions}
        pathOptions={{ color: "#00ff88", weight: 6, opacity: 0.12 }}
      />
      {/* Dashed route */}
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
