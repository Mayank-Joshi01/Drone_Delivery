/**
 * components/map/MapEventHandler.jsx
 * ------------------------------------
 * Invisible component that lives inside <MapContainer> and attaches
 * Leaflet event listeners through react-leaflet's useMapEvents hook.
 *
 * Currently handles:
 *   contextmenu → right-click → open Add Parcel modal
 *
 * Props
 * ─────
 * onRightClick  ({ lat, lng }) => void
 */

import { useMapEvents } from "react-leaflet";

export default function MapEventHandler({ onRightClick }) {
  useMapEvents({
    contextmenu(e) {
      e.originalEvent.preventDefault();
      onRightClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null; // purely side-effect; renders nothing
}
