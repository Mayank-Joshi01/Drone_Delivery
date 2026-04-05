import { createContext, useContext, useState, useCallback} from "react";
import type {ReactNode} from "react";
import { DEFAULT_DRONE_CONFIG } from "../constants";

// 1. Define the shape of drone configuration
export interface DroneConfig {
  maxPayload: number;
  baseEnergy: number;
  weightImpactFactor: number;
  NumberOfDrone:number;
  speed: number; // m/s
}

// 2. Define the shape of the Context value
interface DroneContextType {
  droneConfig: DroneConfig;
  updateDroneConfig: (updatedConfig: Partial<DroneConfig>) => void;
}

// 3. Initialize context with null, but cast it for internal use
const DroneContext = createContext<DroneContextType | null>(null);

interface DroneProviderProps {
  children: ReactNode;
}

export function DroneProvider({ children }: DroneProviderProps) {
  // Use the interface for the state
  const [droneConfig, setDroneConfig] = useState<DroneConfig>(DEFAULT_DRONE_CONFIG);

  // Use Partial<DroneConfig> so you don't have to pass every single field when updating
  const updateDroneConfig = useCallback((updatedDroneConfig: Partial<DroneConfig>) => {
    setDroneConfig((prev) => ({ ...prev, ...updatedDroneConfig }));
  }, []);


  const value: DroneContextType = {
    droneConfig,
    updateDroneConfig,
  };

  return <DroneContext.Provider value={value}>{children}</DroneContext.Provider>;
}

// ─── Consumer hook ─────────────────────────────────────────────────────────────
export function useDrone(): DroneContextType {
  const ctx = useContext(DroneContext);
  
  if (!ctx) {
    throw new Error("useDrone must be used inside <DroneProvider>");
  }
  
  return ctx;
}