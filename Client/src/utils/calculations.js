/**
 * utils/calculations.js
 * ---------------------
 * Pure math helpers — no React, no Leaflet, fully unit-testable.
 */

// ─── Haversine great-circle distance (km) ─────────────────────────────────────
export function haversineKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Sum of consecutive-waypoint distances ────────────────────────────────────
export function totalPathDistanceKm(waypoints) {
  let dist = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    dist += haversineKm(waypoints[i], waypoints[i + 1]);
  }
  return dist;
}

// ─── Energy model: baseEnergyCost + weightImpactFactor × weight × km ──────────
export function estimateEnergyCost(droneConfig, totalWeightKg, distanceKm) {
  return (
    droneConfig.baseEnergyCost +
    droneConfig.weightImpactFactor * totalWeightKg * distanceKm
  );
}

// ─── Rough ETA assuming 80 km/h cruise speed ─────────────────────────────────
export function estimateEtaMinutes(distanceKm, speedKmh = 80) {
  return Math.ceil((distanceKm / speedKmh) * 60);
}

// ─── Priority → accent colour ─────────────────────────────────────────────────
export function priorityColor(priority) {
  if (priority >= 8) return "#ff4444";
  if (priority >= 5) return "#ffaa00";
  return "#44aaff";
}

// ─── Payload percentage (0-100, clamped) ─────────────────────────────────────
export function payloadPercent(totalWeight, maxPayload) {
  return Math.min(Math.round((totalWeight / maxPayload) * 100), 100);
}
