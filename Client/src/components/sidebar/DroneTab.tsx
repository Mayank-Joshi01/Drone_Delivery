import { Navigation2, Battery, Navigation, Package, Activity, Cpu } from "lucide-react";
import { useDrone } from "../../context/DroneContext";
import type { Drone as DroneType } from "../../context/DroneContext";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface DroneCardProps {
  drone: DroneType;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function DroneCard({ drone }: DroneCardProps) {
  // Determine battery color based on level
  const batteryColor = 
    drone.batteryLeft > 60 ? "#00ff88" : 
    drone.batteryLeft > 20 ? "#ffaa00" : "#ff4444";

  return (
    <div className="bg-[#0a1a12] border border-[#0f2a1a] rounded-xl p-4 transition-all duration-300 hover:border-[#00ff8844] hover:shadow-[0_0_20px_#00ff8808] group animate-[fadeSlideIn_0.3s_ease]">
      
      {/* Header: Name & ID */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-[#0f2a1a] flex items-center justify-center group-hover:bg-[#00ff8811] transition-colors`}>
            <Navigation2 size={20} style={{ color: drone.color }} />
          </div>
          <div>
            <h3 className={`text-[11px] font-extrabold text-[${drone.color}] tracking-widest uppercase font-['Syne',sans-serif]`}>
              {drone.name}
            </h3>
            <span className="text-[8px] text-[#2a5a3a] font-bold tracking-tighter uppercase">
              UID: {drone.id.split('-')[0]}
            </span>
          </div>
        </div>
        
        {/* Connection Status Pulse */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[#050d08] border border-[#0f2a1a]">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${drone.status === 'idle' ? 'bg-[#00ff88]' : 'bg-[#44aaff]'}`} />
          <span className="text-[9px] font-bold text-[#4a7a6a] uppercase tracking-widest">{drone.status}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Battery Stat */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[8px] text-[#2a5a3a] font-bold tracking-widest uppercase">
            <Battery size={10} /> Battery
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-[#050d08] rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500" 
                style={{ width: `${drone.batteryLeft}%`, backgroundColor: batteryColor }} 
              />
            </div>
            <span className="text-[10px] font-bold font-['JetBrains_Mono',monospace]" style={{ color: batteryColor }}>
              {drone.batteryLeft}%
            </span>
          </div>
        </div>

        {/* Altitude Stat */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[8px] text-[#2a5a3a] font-bold tracking-widest uppercase">
            <Navigation size={10} /> Altitude
          </div>
          <span className="text-[10px] text-[#c0d8c8] font-bold font-['JetBrains_Mono',monospace]">
            {drone.altitude}m <span className="text-[8px] opacity-40">AGL</span>
          </span>
        </div>

        {/* Payload Stat */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[8px] text-[#2a5a3a] font-bold tracking-widest uppercase">
            <Package size={10} /> Loadout
          </div>
          <span className="text-[10px] text-[#c0d8c8] font-bold font-['JetBrains_Mono',monospace]">
            {drone.parcelsLeft?.length || 0} <span className="text-[8px] opacity-40">PARCELS</span>
          </span>
        </div>

        {/* Connection Stat */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[8px] text-[#2a5a3a] font-bold tracking-widest uppercase">
            <Activity size={10} /> Signal
          </div>
          <span className="text-[10px] text-[#00ff88] font-bold font-['JetBrains_Mono',monospace]">
            -42 <span className="text-[8px] opacity-40">dBm</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DroneTab() {
  const { drones } = useDrone();

  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="text-[9px] text-[#2a5a3a] tracking-[0.2em] font-extrabold mb-1 uppercase">
        Active Fleet Status
      </div>

      {drones && drones.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {drones.map((drone) => (
            <DroneCard key={drone.id} drone={drone} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border border-[#0f2a1a] border-dashed rounded-xl">
          <div className="w-10 h-10 bg-[#0a1a12] rounded-full flex items-center justify-center mb-3">
            <Cpu size={20} className="text-[#1a4a2a] opacity-40" />
          </div>
          <p className="text-[10px] text-[#2a5a3a] font-bold tracking-widest uppercase">
            No Drones Linked to Hub
          </p>
        </div>
      )}
    </div>
  );
}