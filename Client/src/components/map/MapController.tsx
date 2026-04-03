import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useDepo } from '../../context/DepoContext';
import { STATION_LOCATION } from '../../constants';



export default function MapController() {
  const map = useMap();
  const { depo } = useDepo();

  const Location = depo ? { lat: depo.lat, lng: depo.lon } : STATION_LOCATION;
  useEffect(() => {
    if (Location) {
      map.flyTo(Location, 13, { duration: 2 });
    }
  }, [Location, map]);

  return null;
}