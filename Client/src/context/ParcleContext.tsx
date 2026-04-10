import { createContext, useContext, useState, useCallback, } from "react";
import type { ReactNode } from "react";
import { usePath } from "./PathContext";
import { useDrone } from "./DroneContext";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Location {
  lat: number;
  lon: number;
}

export interface Parcel {
  id: string;
  name: string;
  weight: number;
  priority: number;
  lat: number;
  lon: number;
  delivered:boolean | null;
}

interface ParcelContextType {
  parcels: Parcel[];
  tempLocation: Location | null;
  isModalOpen: boolean;
  totalWeight: number;
  addParcel: (data: { name: string; weight: number; priority: number }) => void;
  deleteParcel: (id: string) => void;
  resetAll: () => void;
  openAddParcelModal: ({lat ,lon}: Location) => void;
  closeModal: () => void; // Optional, added for completeness
}

const ParcelContext = createContext<ParcelContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface ParcelProviderProps {
  children: ReactNode;
}

export function ParcelProvider({ children }: ParcelProviderProps) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [tempLocation, setTempLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const {drones , setDrones} = useDrone();


  const { setDeliveryStats, setFlightPaths } = usePath(); 

  const totalWeight = parcels.reduce((sum, p) => sum + p.weight, 0);

  // ── Actions ────────────────────────────────────────────────────────────────

  const openAddParcelModal = useCallback(({ lat , lon } : Location) => {
    setTempLocation({ lat, lon });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTempLocation(null);
  }, []);

  const addParcel = useCallback(
    ({ name, weight, priority }: { name: string; weight: number; priority: number }) => {
      if (!tempLocation) return;

      const parcel: Parcel = {
        id: `P-${Date.now()}`,
        name: name.trim(),
        weight,
        priority,
        lat: tempLocation.lat,
        lon: tempLocation.lon,
        delivered: null,
      };

      setParcels((prev) => [...prev, parcel]);
      
      setFlightPaths([]);
      setDeliveryStats(null);
      
      closeModal();
      setDrones([]); // Clear drones to trigger recalculation with new parcel
    },
    [tempLocation, closeModal]
  );

  const deleteParcel = useCallback((id: string) => {
    setParcels((prev) => prev.filter((p) => p.id !== id));
    setFlightPaths([]);
    setDeliveryStats(null);
  }, []);

  const resetAll = useCallback(() => {
    setParcels([]);
    setFlightPaths([]);
    setDeliveryStats(null);
  }, []);

  const value: ParcelContextType = {
    parcels,
    tempLocation,
    isModalOpen,
    addParcel,
    deleteParcel,
    resetAll,
    openAddParcelModal,
    closeModal,
    totalWeight,
  };

  return <ParcelContext.Provider value={value}>{children}</ParcelContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useParcel(): ParcelContextType {
  const ctx = useContext(ParcelContext);
  if (!ctx) throw new Error("useParcel must be used inside <ParcelProvider>");
  return ctx;
}