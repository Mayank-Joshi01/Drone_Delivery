/**
 * hooks/useDispatch.js
 * --------------------
 * Encapsulates the "Calculate Delivery Path" algorithm.
 *
 * Algorithm (greedy priority-sort):
 *   1. Sort parcels by priority DESC → highest-priority delivered first.
 *   2. Build waypoint list: [hub, ...sortedStops, hub].
 *   3. Compute total distance, energy cost, and ETA.
 *   4. Write results back into DroneContext.
 *
 * To swap in a TSP or nearest-neighbour solver, only change step 1 here.
 */

import { useCallback } from "react";
import { useDrone }     from "../context/DroneContext";
import {
  totalPathDistanceKm,
  estimateEnergyCost,
  estimateEtaMinutes,
} from "../utils/calculations";

export function useDispatch() {
  const {
    parcels,
    droneConfig,
    totalWeight,
    stationLocation,
    setFlightPath,
    setPathStats,
    setIsCalculating,
  } = useDrone();

  const handleCalculatePath = useCallback(async () => {
    if (parcels.length === 0) return;

    setIsCalculating(true);
    setFlightPath([]);

    // Simulate async compute / API call
    await new Promise((res) => setTimeout(res, 1400));

    // Step 1 — sort by priority (highest first)
    const sorted = [...parcels].sort((a, b) => b.priority - a.priority);

    // Step 2 — build full round-trip waypoint list
    const waypoints = [
      stationLocation,
      ...sorted.map((p) => [p.lat, p.lng]),
      stationLocation,
    ];

    // Step 3 — compute metrics
    const distKm = totalPathDistanceKm(waypoints);
    const energy = estimateEnergyCost(droneConfig, totalWeight, distKm);
    const eta    = estimateEtaMinutes(distKm);

    // Step 4 — write to context
    setFlightPath(waypoints);
    setPathStats({
      distance: distKm.toFixed(2),
      stops:    sorted.length,
      energy:   energy.toFixed(0),
      eta,
    });
    setIsCalculating(false);
  }, [
    parcels, droneConfig, totalWeight, stationLocation,
    setFlightPath, setPathStats, setIsCalculating,
  ]);

  return { handleCalculatePath };
}
