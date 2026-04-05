import { useCallback } from "react";
import { useDrone } from "../context/DroneContext";
import { useParcel } from "../context/ParcleContext";
import { usePath } from "../context/PathContext";
import type { LatLngTuple } from "leaflet";
import { useDepo } from "../context/DepoContext";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface UseDispatchReturn {
  handleCalculatePath: () => Promise<void>;
}




export type CoordTuple = [number, number];

export function useDispatch(): UseDispatchReturn {

  const { droneConfig } = useDrone();
  const { parcels, totalWeight } = useParcel();
  const { setIsCalculating , calculatePath , deliveryStats , setDeliveryStats, flightPaths} = usePath();
  const {depo} = useDepo(); 
  const stationLocation = depo ? [depo.lat, depo.lon] as LatLngTuple : [0, 0] as LatLngTuple;

  const handleCalculatePath = useCallback(async () => {
    
      setIsCalculating(true);

      const Parcels = parcels.map(p => ({
        lat: p.lat,
        lng: p.lon,
        wt : p.weight,
        priority : p.priority
      }));

      const Drone = {
        maxPayload: droneConfig.maxPayload,
        batteryLife: droneConfig.baseEnergy,  // base enery 
        WTF : droneConfig.weightImpactFactor, // weight impact factor
        NumberOfDrone: droneConfig.NumberOfDrone, // Number of Drones
        speed: droneConfig.speed, // Drone speed (m/s)
      };

      const Depo = {
        lat: stationLocation[0],
        lon: stationLocation[1],
      };


const waypoints1 = Parcels.slice(0, 3).map(p => [p.lat, p.lng]);   // parcels 0–2
const waypoints2 = Parcels.slice(3, 6).map(p => [p.lat, p.lng]);   // parcels 3–5
const waypoints3 = Parcels.slice(6, 9).map(p => [p.lat, p.lng]);   // parcels 6–8
const waypoints4 = Parcels.slice(9, 12).map(p => [p.lat, p.lng]);  // parcels 9–11
const waypoints5 = Parcels.slice(12, 15).map(p => [p.lat, p.lng]); // parcels 12–14
      
const dummyResponse = {
  paths: [
    {
      "Time": 342,
      "Energy": 78.5,
      "Distance": 4200,
      "Parcels": 3,
      "Waypoints": waypoints1
    },
    {
      "Time": 518,
      "Energy": 91.3,
      "Distance": 6750,
      "Parcels": 4,
      "Waypoints": waypoints2
    },
    {
      "Time": 215,
      "Energy": 54.2,
      "Distance": 2800,
      "Parcels": 2,
      "Waypoints": waypoints3
    },
    {
      "Time": 670,
      "Energy": 88.7,
      "Distance": 8100,
      "Parcels": 5,
      "Waypoints": waypoints4
    },
    {
      "Time": 430,
      "Energy": 65.9,
      "Distance": 5300,
      "Parcels": 3,
      "Waypoints": waypoints5
    },
  ]
}

      /// api code to calculate path and stats based on Parcels, Drone, and Depo data


      /// Output 
      const response = dummyResponse; // Placeholder for API response

      calculatePath([Depo['lat'], Depo['lon']] , response.paths) ;

      const totalParcelsDelivered = response.paths.reduce((sum, path) => sum + path.Parcels, 0);

      setDeliveryStats({
        totalParcelsDelivered: totalParcelsDelivered,
        ParcelsLeft: Parcels.length - totalParcelsDelivered,
      });

  }, [
    parcels, 
    droneConfig, 
    totalWeight, 
    stationLocation,
    calculatePath,
    deliveryStats,
    flightPaths,
    setDeliveryStats,
    setIsCalculating
  ]);

  return { handleCalculatePath };
}