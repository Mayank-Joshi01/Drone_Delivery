import React, { useEffect } from 'react';
import { useMapEvents, Polygon, Popup } from 'react-leaflet';
import { useNoFlyZoneStore } from './NoFlyZone'; // Adjust import path
import * as turf from '@turf/turf';

export const LiveNoFlyZones = () => {
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

  // 2. Render BOTH the original shape and the new Bounding Box outline
  return (
    <>
          {optimizedZones.map((zone) => (
        <React.Fragment key={zone.id}>
            {/* Original Complex Shape (Solid Red) */}
          <Polygon 
            positions={zone.coordinates} 
            pathOptions={{ color: 'red', fillColor: '#ff0000', fillOpacity: 0.2, weight: 1 }}
          >
            <Popup>
              <strong>{zone.name} (Original)</strong> <br/>
              Vertices: {zone.coordinates.length}
            </Popup>
          </Polygon>

          {/* New Simplified Bounding Box (Dashed Orange Outline) */}
          <Polygon 
            positions={zone.boundingBoxCoords} 
            pathOptions={{ color: 'orange', dashArray: '5, 10', fillOpacity: 0, weight: 3 }}
          >
            <Popup>
              <strong>{zone.name} (Bounding Box)</strong> <br/>
              Sent to C++ Engine
            </Popup>
          </Polygon>
        </React.Fragment>
      ))}
         
    </>
  );
};