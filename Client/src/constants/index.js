// ─── Station / Hub ────────────────────────────────────────────────────────────
export const STATION_LOCATION = [28.6139, 77.209]; // New Delhi

// ─── Default drone settings ───────────────────────────────────────────────────
export const DEFAULT_DRONE_CONFIG = {
  maxPayload: 12,           // kg
  baseEnergyCost: 50,       // Wh base
  weightImpactFactor: 2.5,  // Wh per kg·km
};

// ─── Priority bands ───────────────────────────────────────────────────────────
export const PRIORITY_BANDS = {
  HIGH:   { minScore: 8,  color: "#ff4444", label: "CRITICAL" },
  MEDIUM: { minScore: 5,  color: "#ffaa00", label: "MEDIUM"   },
  LOW:    { minScore: 1,  color: "#44aaff", label: "STANDARD" },
};

// ─── Map tile ─────────────────────────────────────────────────────────────────
export const MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

// ─── Leaflet default-icon CDN paths (fixes broken icons in bundlers) ──────────
export const LEAFLET_ICON_URLS = {
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
};
