import { useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Location {
  lat: number;
  lon: number;
}

interface MapEventHandlerProps {

  onRightClick: ({lat , lon}: Location) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapEventHandler({ onRightClick }: MapEventHandlerProps) {
  useMapEvents({
    contextmenu(e: LeafletMouseEvent) {
      // 1. Prevent the browser's default right-click menu from appearing
      e.originalEvent.preventDefault();

      // 2. Pass the coordinates to the parent component (e.g., to open the AddParcelModal)
      onRightClick({ 
        lat: e.latlng.lat, 
        lon: e.latlng.lng 
      });
    },
  });

  return null;
}