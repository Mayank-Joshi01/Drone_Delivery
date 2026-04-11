import React, { useEffect } from 'react';
import { useMapEvents, Polygon, Popup } from 'react-leaflet';
import { useNoFlyZoneStore  } from './NoFlyZone'; // Adjust import path

export const LiveNoFlyZones = () => {
  // 1. Connect to our Global Store!
  const addZones = useNoFlyZoneStore((state) => state.addZones);
  const zonesDict = useNoFlyZoneStore((state) => state.zones);
  const allZones = Object.values(zonesDict);

  const fetchZones = async (bounds: L.LatLngBounds) => {
    const s = bounds.getSouth();
    const w = bounds.getWest();
    const n = bounds.getNorth();
    const e = bounds.getEast();

    const query = `
      [out:json][timeout:25];
      (
        way["aeroway"~"aerodrome|helipad"](${s},${w},${n},${e});
        relation["aeroway"~"aerodrome|helipad"](${s},${w},${n},${e});
        way["landuse"="military"](${s},${w},${n},${e});
      );
      out geom;
    `;

    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      const parsedZones = data.elements
        .filter((el: any) => el.geometry)
        .map((el: any) => ({
          id: el.id,
          name: el.tags?.name || "Restricted Airspace",
          type: el.tags?.aeroway || el.tags?.landuse || "Unknown",
          coordinates: el.geometry.map((pt: any) => [pt.lat, pt.lon]) 
        }));

      // 2. Instead of setting local state, push it to the Global Store
      addZones(parsedZones);

    } catch (error) {
      console.error("Error fetching No-Fly Zones:", error);
    }
  };

  const map = useMapEvents({
    moveend: () => fetchZones(map.getBounds()),
  });

  useEffect(() => {
    fetchZones(map.getBounds());
  }, [map]);

  // 3. Render directly from the Global State array
  return (
    <>
      {allZones.map((zone) => (
        <Polygon 
          key={zone.id} 
          positions={zone.coordinates} 
          pathOptions={{ color: 'red', fillColor: '#ff0000', fillOpacity: 0.4 }}
        >
          <Popup>
            <strong>{zone.name}</strong> <br/>
            Type: {zone.type}
          </Popup>
        </Polygon>
      ))}
    </>
  );
};