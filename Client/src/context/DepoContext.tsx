import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { STATION_LOCATION , STATION_NAME } from "../constants";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Depo {
  name: string;
  lat: number;
  lon: number;
}

interface DepoContextType {
  depo: Depo | null;
  // tempLocation: LatLngTuple | null;
  isModalOpen: boolean;
  addDepo: (data: { city: string; lat: number; lon: number }) => void;
  openAddDeopoModal: () => void;
  closeModal: () => void;
}

// Initialize with null but cast for internal usage
const DepoContext = createContext<DepoContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface DepoProviderProps {
  children: ReactNode;
}

export function DepoProvider({ children }: DepoProviderProps) {
  const [depo, setDepo] = useState<Depo | null>({
    name: STATION_NAME,
    lat: STATION_LOCATION[0],
    lon: STATION_LOCATION[1],
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // ── Actions ────────────────────────────────────────────────────────────────

  const openAddDeopoModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const addDepo = useCallback(({ city, lat, lon }: { city: string; lat: number; lon: number }) => {

    const newDepo: Depo = {
      name: city,
      lat: lat,
      lon: lon,
    };

    setDepo((prev) => ({...prev, ...newDepo}));
    closeModal();
  }, [closeModal]);

  const value: DepoContextType = {
    depo,
    isModalOpen,
    addDepo,
    openAddDeopoModal,
    closeModal,
  };

  return <DepoContext.Provider value={value}>{children}</DepoContext.Provider>;
}

// ─── Consumer hook ─────────────────────────────────────────────────────────────

export function useDepo(): DepoContextType {
  const ctx = useContext(DepoContext);
  if (!ctx) {
    throw new Error("useDepo must be used inside <DepoProvider>");
  }
  return ctx;
}