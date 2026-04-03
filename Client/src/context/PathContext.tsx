import { createContext, useContext, useState, useCallback, } from "react";
import type {ReactNode, Dispatch, SetStateAction } from "react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

// Coordinate as a tuple (common for Leaflet/Mapbox paths)
export type LatLngTuple = [number, number];

// Coordinate as an object (common for Parcel data)
export interface Waypoint {
  lat: number;
  lng: number;
}

export interface PathStats {
  totalDistance: number;    // km
  estimatedEnergy: number;  // Wh
  estimatedTime: number;    // mins
}
export interface deliveryStats{
  totalParcelsDelivered : number;
  TotalWeight : number;
  ParcelsLeft : number;
  PowerLeft: number;
}

interface PathContextType {
  flightPath: LatLngTuple[];
  setFlightPath: Dispatch<SetStateAction<LatLngTuple[]>>;
  calculatePath: (start: LatLngTuple, waypoints: Waypoint[]) => void;
  pathStats: PathStats | null;
  setPathStats: Dispatch<SetStateAction<PathStats | null>>;
  isCalculating: boolean;
  setIsCalculating: Dispatch<SetStateAction<boolean>>;
  deliveryStats: deliveryStats | null;
  setDeliveryStats: Dispatch<SetStateAction<deliveryStats | null>>;
}

const PathContext = createContext<PathContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface PathProviderProps {
  children: ReactNode;
}

export function PathProvider({ children }: PathProviderProps) {
  // Explicitly type the state hooks
  const [flightPath, setFlightPath] = useState<LatLngTuple[]>([]);
  const [pathStats, setPathStats] = useState<PathStats | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [deliveryStats, setDeliveryStats] = useState<deliveryStats | null>(null);

  const calculatePath = useCallback((start: LatLngTuple, waypoints: Waypoint[]) => {
    setIsCalculating(true);

    // Logic to build the path array
    const path: LatLngTuple[] = [
      start, 
      ...waypoints.map((wp): LatLngTuple => [wp.lat, wp.lng])
    ];
    
    setFlightPath(path);
      setIsCalculating(false);
    

  }, []);

  const value: PathContextType = {
    flightPath,
    setFlightPath,
    calculatePath,
    pathStats,
    setPathStats,
    isCalculating,
    setIsCalculating,
    deliveryStats,
    setDeliveryStats,
  };

  return <PathContext.Provider value={value}>{children}</PathContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePath(): PathContextType {
  const ctx = useContext(PathContext);
  if (!ctx) {
    throw new Error("usePath must be used inside <PathProvider>");
  }
  return ctx;
}