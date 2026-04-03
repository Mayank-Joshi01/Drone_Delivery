import { Package, Weight, Activity, RotateCcw, Send, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDrone } from "../../context/DroneContext";
import { useDispatch } from "../../hooks/useDispatch";
import { payloadPercent } from "../../utils/calculations";
import { useParcel } from "../../context/ParcleContext";
import { usePath } from "../../context/PathContext";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface StatCellProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatCell({ icon: Icon, label, value }: StatCellProps) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="w-8 h-8 bg-[#0a1a12] rounded-lg flex items-center justify-center border border-[#0f2a1a]">
        <Icon size={13} className="text-[#00ff88]" />
      </div>
      <div>
        <div className="text-[8px] text-[#2a5a3a] tracking-[0.15em] font-bold uppercase">{label}</div>
        <div className="text-sm text-[#c0d8c8] font-bold leading-none mt-[2px]">{value}</div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-[14px] h-[14px] border-2 border-[#00ff8844] border-t-[#00ff88] rounded-full animate-spin" />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BottomBar() {
  // Consuming our typed contexts
  const { parcels, totalWeight, resetAll } = useParcel();
  const { droneConfig } = useDrone();
  const { isCalculating , deliveryStats } = usePath();

  // Custom hook for pathfinding logic
  const { handleCalculatePath } = useDispatch();

  const disabled = parcels.length === 0 || isCalculating
  const pct = payloadPercent(totalWeight, droneConfig.maxPayload);

  return (
    <div className="h-[68px] bg-[#050d08] border-t border-[#0f2a1a] flex items-center px-5 gap-4 shrink-0">

      {/* ── Stats ── */}
      <div className="flex gap-6">
        <StatCell icon={Package} label="PARCELS DELIVERED" 
        value={`${deliveryStats ? deliveryStats.totalParcelsDelivered : "-/-" }`}
          />
          <StatCell icon={Package} label="PARCELS LEFT" 
        value={`${deliveryStats ? deliveryStats.ParcelsLeft : "-/-" }`}
          />
        <StatCell 
          icon={Weight}  
          label="TOTAL WEIGHT"  
          value={`${deliveryStats ? deliveryStats.TotalWeight : "-/-"} kg`} 
        />
        <StatCell 
          icon={Activity} 
          label="POWER LEFT" 
          value={`${deliveryStats ? deliveryStats.PowerLeft : "-/-" } Wh`} 
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Reset button (only when parcels exist) ── */}
      {parcels.length > 0 && (
        <button
          onClick={resetAll}
          className="bg-transparent border border-[#1a3a2a] rounded-lg px-4 h-10 text-[#4a7a6a] hover:text-[#ff6666] hover:border-[#ff444444] text-[10px] font-bold tracking-[0.1em] cursor-pointer flex items-center gap-[6px] transition-all duration-200 font-['JetBrains_Mono',monospace]"
        >
          <RotateCcw size={12} /> RESET ALL
        </button>
      )}

      {/* ── Primary dispatch button ── */}
      <button
        onClick={handleCalculatePath}
        disabled={disabled}
        className={`border-none rounded-[10px] px-6 h-11 text-[11px] font-extrabold tracking-[0.15em] flex items-center gap-2 transition-all duration-300 font-['JetBrains_Mono',monospace] min-w-[220px] justify-center
          ${disabled
            ? "bg-[#0a1a12] text-[#1a4a2a] cursor-not-allowed shadow-none"
            : "bg-gradient-to-br from-[#00cc66] to-[#00ff88] text-[#001a0d] cursor-pointer shadow-[0_0_24px_#00ff8844,0_4px_16px_#00cc6633]"
          }`}
      >
        {isCalculating ? (
          <>
            <Spinner /> COMPUTING PATH...
          </>
        ) : (
          <>
            <Send size={13} /> 
            CALCULATE DELIVERY PATH
            <ChevronRight size={13} />
          </>
        )}
      </button>
    </div>
  );
}