import { createContext, useContext, useState, useCallback, } from "react";
import type {ReactNode, Dispatch, SetStateAction } from "react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

// Coordinate as a tuple (common for Leaflet/Mapbox paths)
export type LatLngTuple = number[]; // [lat, lng]
export type PathWaypoint = [number, number]; // [lat, lng]

// Coordinate as an object (common for Parcel data)
export interface Waypoint {
  lat: number;
  lng: number;
}

export interface ResponsePath {
  Time: number; // in seconds
  Energy: number; // in Wh
  Distance: number; // in meters
  Parcels: number; // count of parcels delivered on this path
  Waypoints: LatLngTuple[]; // array of coordinates for the path
}

export interface PathStats {
  totalDistance: number;    // km
  estimatedEnergy: number;  // Wh
  estimatedTime: number;    // mins
  totalParcelsDelivered: number; // count
}

export interface FlightPath {
  stats : PathStats;
  path : PathWaypoint[];
}

export interface deliveryStats{
  totalParcelsDelivered : number;
  ParcelsLeft : number;
}

interface PathContextType {
  calculatePath: (start: PathWaypoint, paths: ResponsePath[]) => void;
  currentPath: number;
  setCurrentPath: Dispatch<SetStateAction<number>>;
  isCalculating: boolean;
  setIsCalculating: Dispatch<SetStateAction<boolean>>;
  deliveryStats: deliveryStats | null;
  setDeliveryStats: Dispatch<SetStateAction<deliveryStats | null>>;
  flightPaths : FlightPath[];
  setFlightPaths : Dispatch<SetStateAction<FlightPath[]>>;
}

const PathContext = createContext<PathContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface PathProviderProps {
  children: ReactNode;
}

export function PathProvider({ children }: PathProviderProps) {
  // Explicitly type the state hooks
  const [currentPath, setCurrentPath] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [deliveryStats, setDeliveryStats] = useState<deliveryStats | null>(null);
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([]);

  const calculatePath = useCallback((start: PathWaypoint, paths: ResponsePath[]) => {
    setIsCalculating(true);

      const formattedFlightPaths: FlightPath[] = paths.map((p) => ({
        stats: {
          totalDistance: p.Distance / 1000, // convert to km
          estimatedEnergy: p.Energy, // in Wh
          estimatedTime: p.Time / 60, // convert to mins
          totalParcelsDelivered: p.Parcels,
        },
        path: [
            start, 
            ...p.Waypoints.map((wp) => [wp[0] , wp[1]] as PathWaypoint), 
            start
        ],
      }));

      setFlightPaths(formattedFlightPaths);
      setIsCalculating(false);

  }, []);

  const value: PathContextType = {
    calculatePath,
    currentPath,
    setCurrentPath,
    isCalculating,
    setIsCalculating,
    deliveryStats,
    setDeliveryStats,
    flightPaths,
    setFlightPaths,
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