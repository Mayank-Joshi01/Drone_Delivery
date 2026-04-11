import { create } from 'zustand';

// 1. Define the shape of a single No-Fly Zone
export interface NFZ {
  id: number;
  name: string;
  type: string;
  coordinates: [number, number][]; // Leaflet LatLng tuples
}

// 2. Define the shape of our Store
interface NoFlyZoneStore {
  // We use a Record (dictionary) instead of an Array to prevent duplicates!
  zones: Record<number, NFZ>; 
  addZones: (newZones: NFZ[]) => void;
  getAllZones: () => NFZ[];
}

// 3. Create the Store
export const useNoFlyZoneStore = create<NoFlyZoneStore>((set, get) => ({
  zones: {}, 
  
  // This function takes newly fetched zones and merges them into the state
  addZones: (newZones) => set((state) => {
    const updatedZones = { ...state.zones };
    
    newZones.forEach(zone => {
      // By using the ID as the key, duplicates are safely overwritten
      updatedZones[zone.id] = zone; 
    });
    
    return { zones: updatedZones };
  }),

  // Helper function to convert the dictionary back into an array for mapping
  getAllZones: () => Object.values(get().zones),
}));