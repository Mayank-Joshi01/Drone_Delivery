import { createContext, useContext, useState, useCallback} from "react";
import type {ReactNode, SetStateAction , Dispatch} from "react";
import { DEFAULT_DRONE_CONFIG } from "../constants";

// 1. Define the shape of drone configuration
export interface DroneConfig {
  Max_Payload: number;
  Battery_Voltage: number;
  Battery_Capacity: number;
  Total_Rotor_Area: number;
  Front_Area: number;
  NumberOfDrone:number;
  Drone_Weight:number;
  Speed: number;//m/s
}

// 2. Define the shape of a Drone
export interface Drone {
  id:string;
  loc:[number, number]; // [latitude, longitude
  parcels: string[] | null; // List of parcel IDs
  parcelsDelivered: string[] | null; // List of delivered parcel IDs
  parcelsLeft: string[] | null ; // List of undelivered parcel IDs
  name:string;
  batteryLeft: number; // Percentage of battery left
  status: "idle" | "delivering" | "returning"; // Current status of the drone
  altitude: number; // Current altitude of the drone
  color:string;
}


// 2. Define the shape of the Context value
interface DroneContextType {
  droneConfig: DroneConfig;
  updateDroneConfig: (updatedConfig: Partial<DroneConfig>) => void;
  drones: Drone[];
  setDrones: Dispatch<SetStateAction<Drone[]>>;
}

// 3. Initialize context with null, but cast it for internal use
const DroneContext = createContext<DroneContextType | null>(null);

interface DroneProviderProps {
  children: ReactNode;
}

export function DroneProvider({ children }: DroneProviderProps) {
  // Use the interface for the state
  const [droneConfig, setDroneConfig] = useState<DroneConfig>(DEFAULT_DRONE_CONFIG);
  const [drones, setDrones] = useState<Drone[]>([]);

  // Use Partial<DroneConfig> so you don't have to pass every single field when updating
  const updateDroneConfig = useCallback((updatedDroneConfig: Partial<DroneConfig>) => {
    setDroneConfig((prev) => ({ ...prev, ...updatedDroneConfig }));
  }, []);


  const value: DroneContextType = {
    droneConfig,
    updateDroneConfig,
    drones,
    setDrones,
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