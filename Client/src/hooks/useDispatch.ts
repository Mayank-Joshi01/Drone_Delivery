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
  const { setFlightPath, setPathStats, setIsCalculating , calculatePath , setDeliveryStats } = usePath();
  const {depo} = useDepo(); 
  const stationLocation = depo ? [depo.lat, depo.lon] as LatLngTuple : [0, 0] as LatLngTuple;

  const handleCalculatePath = useCallback(async () => {
    
      setIsCalculating(true);

      const Parcels = parcels.map(p => ({
        lat: p.lat,
        lng: p.lon,
        id : p.id,
        wt : p.weight,
        priority : p.priority
      }));

      const Drone = {
        maxPayload: droneConfig.maxPayload,
        speed: 1, // Placeholder for drone speed (m/s)
        batteryLife: droneConfig.baseEnergy,  // base enery 
        WTF : droneConfig.weightImpactFactor, // weight impact factor
      };

      const Depo = {
        lat: stationLocation[0],
        lon: stationLocation[1],
      };
      
      const dummyResponse = {
        parcels: Parcels,
        droneStats: {
          totalDistance: 5000, // in meters
          estimatedEnergy: 80, // in Wh
          estimatedTime: 1800, // in seconds
          totalWeightDelivered: totalWeight, // in kg
        },
      }

      /// api code to calculate path and stats based on Parcels, Drone, and Depo data


      /// Output 
      const response = dummyResponse; // Placeholder for API response

      calculatePath([Depo['lat'], Depo['lon']] , response.parcels ) ;

      const droneStats = response.droneStats; // Placeholder for drone stats from API response

      setPathStats({
        totalDistance: droneStats.totalDistance,
        estimatedEnergy: droneStats.estimatedEnergy,
        estimatedTime: droneStats.estimatedTime,
      });

      setDeliveryStats({
        totalParcelsDelivered: response.parcels.length,
        TotalWeight: droneStats.totalWeightDelivered,
        ParcelsLeft: Parcels.length - response.parcels.length,
        PowerLeft: droneConfig.baseEnergy - droneStats.estimatedEnergy,
      });

  }, [
    parcels, 
    droneConfig, 
    totalWeight, 
    stationLocation,
    setFlightPath, 
    setPathStats, 
    setIsCalculating
  ]);

  return { handleCalculatePath };
}