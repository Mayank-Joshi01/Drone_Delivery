/**
 * context/DroneContext.jsx
 * -------------------------
 * Single source of truth for the entire dashboard.
 *
 * Exposes:
 *   State    – droneConfig, parcels, tempLocation, isModalOpen,
 *              flightPath, pathStats, isCalculating
 *   Derived  – totalWeight, isOverloaded, stationLocation
 *   Actions  – openAddParcelModal, closeModal, addParcel, deleteParcel,
 *              resetAll, updateDroneConfig
 *   Setters  – setFlightPath, setPathStats, setIsCalculating  (for useDispatch)
 */

import { createContext, useContext, useState, useCallback } from "react";
import { DEFAULT_DRONE_CONFIG, STATION_LOCATION } from "../constants";

const DroneContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DroneProvider({ children }) {
  const [droneConfig, setDroneConfig]     = useState(DEFAULT_DRONE_CONFIG);
  const [parcels, setParcels]             = useState([]);
  const [tempLocation, setTempLocation]   = useState(null);   // { lat, lng }
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [flightPath, setFlightPath]       = useState([]);     // [[lat,lng], ...]
  const [pathStats, setPathStats]         = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalWeight  = parcels.reduce((sum, p) => sum + p.weight, 0);
  const isOverloaded = totalWeight > droneConfig.maxPayload;

  // ── Actions ────────────────────────────────────────────────────────────────
  const openAddParcelModal = useCallback(({ lat, lng }) => {
    setTempLocation({ lat, lng });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTempLocation(null);
  }, []);

  const addParcel = useCallback(
    ({ name, weight, priority }) => {
      if (!tempLocation) return;
      const parcel = {
        id: `P-${Date.now()}`,
        name: name.trim(),
        weight,
        priority,
        lat: tempLocation.lat,
        lng: tempLocation.lng,
      };
      setParcels((prev) => [...prev, parcel]);
      setFlightPath([]);    // invalidate old route
      setPathStats(null);
      closeModal();
    },
    [tempLocation, closeModal]
  );

  const deleteParcel = useCallback((id) => {
    setParcels((prev) => prev.filter((p) => p.id !== id));
    setFlightPath([]);
    setPathStats(null);
  }, []);

  const resetAll = useCallback(() => {
    setParcels([]);
    setFlightPath([]);
    setPathStats(null);
  }, []);

  const updateDroneConfig = useCallback((key, value) => {
    setDroneConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    // state
    droneConfig,
    parcels,
    tempLocation,
    isModalOpen,
    flightPath,
    pathStats,
    isCalculating,
    // derived
    totalWeight,
    isOverloaded,
    stationLocation: STATION_LOCATION,
    // actions
    openAddParcelModal,
    closeModal,
    addParcel,
    deleteParcel,
    resetAll,
    updateDroneConfig,
    // raw setters (consumed by useDispatch hook only)
    setFlightPath,
    setPathStats,
    setIsCalculating,
  };

  return <DroneContext.Provider value={value}>{children}</DroneContext.Provider>;
}

// ─── Consumer hook ─────────────────────────────────────────────────────────────
export function useDrone() {
  const ctx = useContext(DroneContext);
  if (!ctx) throw new Error("useDrone must be used inside <DroneProvider>");
  return ctx;
}
