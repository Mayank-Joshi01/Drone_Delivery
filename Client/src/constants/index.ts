// ─── Station / Hub ────────────────────────────────────────────────────────────
// Typing as a tuple [number, number] ensures it always has exactly two coordinates
export const STATION_LOCATION: [number, number] = [28.6139, 77.209]; 
export const STATION_NAME: string = "New Delhi";

// ─── Default drone settings ───────────────────────────────────────────────────
export interface DroneConfig {
  maxPayload: number;
  baseEnergy: number;
  weightImpactFactor: number;
  NumberOfDrone:number;
  speed: number;// m/s
}

export const DEFAULT_DRONE_CONFIG: DroneConfig = {
  maxPayload: 12,
  baseEnergy: 100,
  weightImpactFactor: 2.5,
  NumberOfDrone: 5,
  speed: 2,
};

// ─── Priority bands ───────────────────────────────────────────────────────────
export interface PriorityBand {
  minScore: number;
  color: string;
  label: string;
}

// We use Record<string, PriorityBand> to define the object structure
export const PRIORITY_BANDS: Record<"HIGH" | "MEDIUM" | "LOW", PriorityBand> = {
  HIGH:   { minScore: 8,  color: "#ff4444", label: "CRITICAL" },
  MEDIUM: { minScore: 5,  color: "#ffaa00", label: "MEDIUM"   },
  LOW:    { minScore: 1,  color: "#44aaff", label: "STANDARD" },
} as const;

// ─── Map tile ─────────────────────────────────────────────────────────────────
export const MAP_TILE_URL: string =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

// ─── Leaflet default-icon CDN paths ──────────────────────────────────────────
export interface LeafletIconUrls {
  iconRetinaUrl: string;
  iconUrl: string;
  shadowUrl: string;
}

export const LEAFLET_ICON_URLS: LeafletIconUrls = {
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
};