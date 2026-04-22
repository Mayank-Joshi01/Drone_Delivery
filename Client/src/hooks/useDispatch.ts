import { useCallback } from "react";
import { useDrone } from "../context/DroneContext";
import { useParcel } from "../context/ParcleContext";
import { usePath } from "../context/PathContext";
import type { LatLngTuple } from "leaflet";
import { useDepo } from "../context/DepoContext";
import axios from "axios";
import { useNoFlyZoneStore } from "../components/map/NoFlyZone";
import * as turf from '@turf/turf';


// ─── Interfaces ──────────────────────────────────────────────────────────────

interface UseDispatchReturn {
  handleCalculatePath: () => Promise<void>;
}

interface Paths{
  Time: number;
  Energy: number;
  Distance: number;
  Parcels: number;
  Parcels_Delivered: number[];
  Waypoints: LatLngTuple[];
}

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

interface Response {
  paths: Paths[];
}

type NoFlyZone = [number, number][]; // Array of [latitude, longitude] tuples representing the vertices of the no-fly zone polygon

export type CoordTuple = [number, number];

export function generateDroneColor(index: number): string {
  const goldenRatioConjugate = 0.618033988749895;
  
  // We use the index to ensure the color is deterministic 
  // (Drone #1 always gets the same color on refresh)
  let hue = (index * goldenRatioConjugate) % 1;
  hue = hue * 360;

  // Saturation: 80% (Vibrant)
  // Lightness: 60% (Bright enough for dark mode, but keeps color)
  return `hsl(${Math.round(hue)}, 80%, 60%)`;
}

export function useDispatch(): UseDispatchReturn {

  const { droneConfig,setDrones,drones } = useDrone();
  const { parcels, totalWeight } = useParcel();
  const { setIsCalculating , calculatePath , deliveryStats , setDeliveryStats, flightPaths} = usePath();
  const {depo} = useDepo(); 
  const stationLocation = depo ? [depo.lat, depo.lon] as LatLngTuple : [0, 0] as LatLngTuple;

        const zonesDict = useNoFlyZoneStore((state) => state.zones);
      const allZones = Object.values(zonesDict);
  const handleCalculatePath = useCallback(async () => {
    
      setIsCalculating(true);

      const Parcels = parcels.map(p => ({
        id: p.id,
        lat: p.lat,
        lon: p.lon,
        weight : p.weight *1000, // weight of the parcel (grams)
        priority : p.priority
      }));

      const Drone = {
        Max_Payload: droneConfig.Max_Payload *1000, // maximum payload capacity of the drone (grams)
        Battery_Voltage: droneConfig.Battery_Voltage,  // voltage of the battery (V) 
        Battery_Capacity: droneConfig.Battery_Capacity, // capacity of the battery (mAh)
        NumberOfDrone: droneConfig.NumberOfDrone, // Number of Drones
        Speed: droneConfig.Speed, // Drone speed (m/s)
        Front_Area: droneConfig.Front_Area, // Front area for drag calculation
        Total_Rotor_Area: droneConfig.Total_Rotor_Area, // Rotor area for hover power calculation
        Drone_Weight: droneConfig.Drone_Weight *1000, // Weight of the drone itself (grams)
      };

      const Depo = {
        lat: stationLocation[0],
        lon: stationLocation[1],
      };


// 1. First Pass: Generate Bounding Boxes for everyone
  const zonesWithBoundingBoxes = allZones.map((zone) => {
    const turfCoords = zone.coordinates.map((coord) => [coord[1], coord[0]]);

    const firstPt = turfCoords[0];
    const lastPt = turfCoords[turfCoords.length - 1];
    if (firstPt[0] !== lastPt[0] || firstPt[1] !== lastPt[1]) {
      turfCoords.push(firstPt);
    }

    try {
      const complexPoly = turf.polygon([turfCoords]);
      const boundingBoxPoly = turf.envelope(complexPoly);

      const quadCoords = boundingBoxPoly.geometry.coordinates[0].map(
        (coord: any) => [coord[1], coord[0]] as [number, number]
      );

      return {
        ...zone,
        boundingBoxCoords: quadCoords,
        // Save the Turf geometry object so we can run math on it in the next step
        turfEnvelope: boundingBoxPoly 
      };
    } catch (error) {
      console.error("Skipping a malformed polygon:", error);
      return {
        ...zone,
        boundingBoxCoords: zone.coordinates,
        turfEnvelope: null
      };
    }
  });

  // 2. THE NEW STEP: Spatial Pruning (Remove swallowed boxes)
  const optimizedZones = zonesWithBoundingBoxes.filter((zoneA, indexA) => {
    if (!zoneA.turfEnvelope) return true; // Keep it if math failed earlier

    // Check if zoneA is swallowed by ANY other zone (zoneB)
    const isSwallowed = zonesWithBoundingBoxes.some((zoneB, indexB) => {
      // Don't compare the zone against itself
      if (indexA === indexB || !zoneB.turfEnvelope) return false; 

      // Check if Zone A is completely inside Zone B
      const isInside = turf.booleanWithin(zoneA.turfEnvelope, zoneB.turfEnvelope);

      // Edge case safety: If two zones are the exact same size and stack on top of each other,
      // we don't want them to delete each other. We use the index as a tie-breaker.
      if (isInside) {
        const areaA = turf.area(zoneA.turfEnvelope);
        const areaB = turf.area(zoneB.turfEnvelope);
        
        if (areaA === areaB && indexA > indexB) {
           return false; // Let the other one swallow this one, but don't delete both!
        }
        return true; 
      }

      return false;
    });

    // Keep the zone ONLY if it was NOT swallowed by a larger zone
    return !isSwallowed;
  });

  const finalNoFlyZones = optimizedZones.map(zone => zone.boundingBoxCoords);

console.log("Simplified noFlyZones for API:", finalNoFlyZones);

      axios.post('http://localhost:5000/api/dispatch', {
        Drone,
        Depo,
        Parcels,
        noFlyZones: finalNoFlyZones
      })
      .then(response => {
        const data = response.data;
        console.log("API Response:", data);
        // Process the response data as needed
        const res = data; // Placeholder for API response

      calculatePath([Depo['lat'], Depo['lon']] , res.paths) ;

      for (const drone of res.paths) {
  const newDrone: Drone = {
    id: `drone-${Math.random().toString(36).substr(2, 9)}`,
    loc: [Depo.lat, Depo.lon] as [number, number], 
    parcels: drone.Parcels_Delivered.map((p: any) => p.toString()),
    parcelsDelivered: [],
    parcelsLeft: drone.Parcels_Delivered.map((p: any) => p.toString()),
    name: `Drone-${Math.random().toString(36).substr(2, 9)}`,
    batteryLeft: 100,
    status: "idle", 
    altitude: 5,
    color: generateDroneColor(res.paths.indexOf(drone)),
  };

  // 4. Ensure setDrones is the setter from useState<Drone[]>([])
  setDrones(prev => [...prev, newDrone]);
}

      const totalParcelsDelivered = res.paths.reduce((sum :any, path : any) => sum + path.Parcels, 0);

      parcels.forEach(p => {
        if (res.paths.some( (path : any) => path.Parcels_Delivered.includes(p.id))) {
          p.delivered = true;
        } else {
          p.delivered = false;
        }
        console.log(`Parcel ${p.id} delivered status: ${p.delivered}`);
      });

      setDeliveryStats({
        totalParcelsDelivered: totalParcelsDelivered,
        ParcelsLeft: Parcels.length - totalParcelsDelivered,
      });
      })
      .catch(error => {
        console.error("API Error:", error);
        // Handle errors as needed
      });

// const waypoints1 = Parcels.slice(0, 3).map(p => [p.lat, p.lon]);   // parcels 0–2
// const waypoints2 = Parcels.slice(3, 6).map(p => [p.lat, p.lon]);   // parcels 3–5
// const waypoints3 = Parcels.slice(6, 9).map(p => [p.lat, p.lon]);   // parcels 6–8
// const waypoints4 = Parcels.slice(9, 12).map(p => [p.lat, p.lon]);  // parcels 9–11
// const waypoints5 = Parcels.slice(12, 15).map(p => [p.lat, p.lon]); // parcels 12–14
      
// const dummyResponse = {
//   paths: [
//     {
//       "Time": 342,
//       "Energy": 78.5,
//       "Distance": 4200,
//       "Parcels": 3,
//       "Parcels_Delivered": [Parcels[0].id, Parcels[1].id, Parcels[2].id],
//       "Waypoints": waypoints1
//     },
//     {
//       "Time": 518,
//       "Energy": 91.3,
//       "Distance": 6750,
//       "Parcels": 4,
//       "Parcels_Delivered": [Parcels[3].id, Parcels[4].id, Parcels[5].id, Parcels[6].id],
//       "Waypoints": waypoints2
//     },
//     {
//       "Time": 215,
//       "Energy": 54.2,
//       "Distance": 2800,
//       "Parcels": 2,
//       "Parcels_Delivered": [Parcels[7].id, Parcels[8].id],
//       "Waypoints": waypoints3
//     },
//     {
//       "Time": 670,
//       "Energy": 88.7,
//       "Distance": 8100,
//       "Parcels": 5,
//       "Parcels_Delivered": [Parcels[9].id, Parcels[10].id, Parcels[11].id, Parcels[12].id, Parcels[13].id],
//       "Waypoints": waypoints4
//     },
//     {
//       "Time": 430,
//       "Energy": 65.9,
//       "Distance": 5300,
//       "Parcels": 3,
//       "Parcels_Delivered": [Parcels[14].id, Parcels[15].id, Parcels[16].id],
//       "Waypoints": waypoints5
//     },
//   ]
// }

      /// api code to calculate path and stats based on Parcels, Drone, and Depo data


      /// Output 
      

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