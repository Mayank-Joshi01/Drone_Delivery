import { useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import { useNoFlyZoneStore } from "./NoFlyZone";
import * as turf from '@turf/turf';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Location {
  lat: number;
  lon: number;
}

interface MapEventHandlerProps {

  onRightClick: ({ lat, lon }: Location) => void;
}


const isPointInNoFlyZone = async(point: Location, zones: any): Promise<boolean> => {
  const clickPoint = turf.point([point.lon, point.lat]); // Note: GeoJSON format is [lon, lat]
  let isInsideNFZ = false;

  // 3. Loop through every active No-Fly Zone
      for (const zone of zones) {
        if (!zone.coordinates || zone.coordinates.length < 3) continue;

        // Convert Leaflet [Lat, Lng] to Turf [Lng, Lat]
        const turfCoords = zone.coordinates.map((coord: any) => [coord[1], coord[0]]);
        
        // Turf requires polygons to be "closed" (the first and last point must be identical)
        const firstPt = turfCoords[0];
        const lastPt = turfCoords[turfCoords.length - 1];
        if (firstPt[0] !== lastPt[0] || firstPt[1] !== lastPt[1]) {
          turfCoords.push(firstPt);
        }
        try {
          // Create the Turf Polygon
          const restrictedPolygon = turf.polygon([turfCoords]);

          // 4. The Magic Math: Is the point inside the polygon?
          if (turf.booleanPointInPolygon(clickPoint, restrictedPolygon)) {
            isInsideNFZ = true;
            // You can replace this alert with a nice UI Toast notification
            alert(`ACTION BLOCKED: You cannot place a parcel inside ${zone.name || 'Restricted Airspace'}`);
            break; // Stop looping, we already found a violation
          }
        } catch (error) {
          console.warn("Skipping malformed polygon data from OSM", error);
        }
      }

  return isInsideNFZ;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapEventHandler({ onRightClick }: MapEventHandlerProps) {
  const zonesDict = useNoFlyZoneStore((state) => state.zones);
  const allZones = Object.values(zonesDict);

  useMapEvents({
    async contextmenu(e: LeafletMouseEvent) {
      // 1. Prevent the browser's default right-click menu from appearing
      e.originalEvent.preventDefault();

      const  isInNoFlyZone = await isPointInNoFlyZone({ lat: e.latlng.lat, lon: e.latlng.lng }, allZones);

      if (isInNoFlyZone) {
        return; // Block the action, don't proceed to open the modal
      }
      // 2. Pass the coordinates to the parent component (e.g., to open the AddParcelModal)
      onRightClick({
        lat: e.latlng.lat,
        lon: e.latlng.lng
      });
    },
  });

  return null;
}