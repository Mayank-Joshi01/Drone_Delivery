import { Package, Trash2 } from "lucide-react";
import { useParcel } from "../../context/ParcleContext";
import { priorityColor } from "../../utils/calculations";
import { PRIORITY_BANDS } from "../../constants";

// ─── Interfaces ──────────────────────────────────────────────────────────────

// If you haven't defined this in your Context yet, do it here or in a types file
export interface Parcel {
  id: string | number;
  name: string;
  priority: number;
  weight: number;
  lat: number;
  lon : number;
}

interface PriorityBadgeProps {
  priority: number;
}

interface ParcelRowProps {
  parcel: Parcel;
  index: number;
  onDelete: (id: string | number) => void;
}

// ─── Coloured priority badge ──────────────────────────────────────────────────
function PriorityBadge({ priority }: PriorityBadgeProps) {
  const color = priorityColor(priority);
  const label =
    priority >= PRIORITY_BANDS.HIGH.minScore   ? "CRIT" :
    priority >= PRIORITY_BANDS.MEDIUM.minScore ? "MED"  : "STD";

  return (
    <span
      className="text-[9px] font-extrabold tracking-[0.1em] px-[6px] py-[2px] rounded-[3px] font-['JetBrains_Mono',monospace]"
      style={{ background: `${color}22`, color, border: `1px solid ${color}66` }}
    >
      {label}
    </span>
  );
}

// ─── Single parcel row ────────────────────────────────────────────────────────
function ParcelRow({ parcel, index, onDelete }: ParcelRowProps) {
  return (
    <div
      className="bg-[#0a1a12] rounded-lg px-3 py-[10px] border border-[#0f2a1a] flex items-center gap-[10px] transition-colors duration-200 hover:border-[#1a3a2a]"
    >
      {/* Stop number */}
      <div className="w-[22px] h-[22px] rounded-full bg-[#0f2a1a] flex items-center justify-center text-[10px] text-[#00ff88] font-extrabold shrink-0">
        {index + 1}
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-[#c0d8c8] whitespace-nowrap overflow-hidden text-ellipsis">
          {parcel.name}
        </div>
        <div className="flex gap-2 mt-1 items-center">
          <PriorityBadge priority={parcel.priority} />
          <span className="text-[10px] text-[#4a7a6a]">{parcel.weight} kg</span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(parcel.id)}
        title="Remove parcel"
        className="bg-transparent border-none cursor-pointer text-[#1a3a2a] hover:text-[#ff4444] p-1 rounded flex items-center transition-colors duration-200"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Empty-state ──────────────────────────────────────────────────────────────
function EmptyManifest() {
  return (
    <div className="text-center px-5 py-10 text-[#1a4a2a]">
      <Package size={32} className="mx-auto mb-3 opacity-40" />
      <div className="text-[11px] tracking-[0.1em]">NO PARCELS LOADED</div>
      <div className="text-[10px] mt-[6px] text-[#0f2a1a]">
        Right-click the map to add
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManifestTab() {
  // TypeScript will now know that 'parcels' is an array of Parcel objects
  const { parcels, deleteParcel } = useParcel();

  return (
    <div className="flex flex-col gap-2">
      {parcels.length === 0 ? (
        <EmptyManifest />
      ) : (
        parcels.map((parcel, i) => (
          <ParcelRow 
            key={parcel.id} 
            parcel={parcel} 
            index={i} 
            onDelete={() => deleteParcel(parcel.id)} 
          />
        ))
      )}
    </div>
  );
}