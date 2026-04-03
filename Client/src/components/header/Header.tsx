import { Radio, Plus } from "lucide-react";
import { useState } from "react";
import AddDepoModal from "./AddDepoModal";
import type { GeocodedLocation } from "./AddDepoModal";
import { STATION_NAME } from "../../constants";
import { useDepo } from "../../context/DepoContext";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface StatPillProps {
  label: string;
  value: string | number;
  danger?: boolean; // Optional prop
}

// ─── Single stat pill ─────────────────────────────────────────────────────────

function StatPill({ label, value, danger }: StatPillProps) {
  return (
    <div className="text-right">
      <div className="text-[9px] text-[#2a5a3a] tracking-[0.15em] font-bold">
        {label}
      </div>
      <div 
        className={`text-[11px] font-bold tracking-[0.05em] ${
          danger ? "text-[#ff4444]" : "text-[#00ff88]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { depo, addDepo } = useDepo();

  // TypeScript now knows exactly what shape depoData should be
  const handleSaveDepo = async (depoData: GeocodedLocation | null) => {
    if (depoData) {
      // Mapping the API result to the addDepo context function
      addDepo({
        city: depoData.city,
        lat: depoData.lat,
        lon: depoData.lon
      });
    }
  };

  // Get the name of the most recently added depo, or default to constants
  const currentHubName = depo ? depo.name : STATION_NAME;

  return (
    <>
      <header className="flex items-center justify-between px-6 h-[52px] bg-[#050d08] border-b border-[#0f2a1a] shrink-0 z-10">

        {/* ── Left: brand + status ── */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#00ff88] to-[#00cc66] rounded-[6px] flex items-center justify-center">
              <Radio size={14} color="#001a0d" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-extrabold tracking-[0.05em] text-white font-['Syne',sans-serif]">
              DRONEOPS
            </span>
            <span className="text-[10px] text-[#00ff88] tracking-[0.2em] font-semibold opacity-70">
              DISPATCH v2.4
            </span>
          </div>

          <div className="h-5 w-px bg-[#0f2a1a]" />

          <div className="flex items-center gap-[6px]">
            <div
              className="w-[6px] h-[6px] rounded-full bg-[#00ff88]"
              style={{ animation: "blink 1.5s ease-in-out infinite" }}
            />
            <span className="text-[10px] text-[#4a7a6a] tracking-[0.1em]">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* ── Right: stat pills + Add Depo ── */}
        <div className="flex items-center gap-5">
          <StatPill label="HUB" value={currentHubName} />

          <div className="h-5 w-px bg-[#0f2a1a]" />

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 h-8 px-4 bg-gradient-to-br from-[#00cc66] to-[#00ff88] rounded-lg text-[#001a0d] text-[10px] font-extrabold tracking-[0.15em] border-none cursor-pointer shadow-[0_0_16px_#00ff8833] hover:shadow-[0_0_24px_#00ff8866] hover:scale-[1.03] transition-all duration-200 font-['JetBrains_Mono',monospace]"
          >
            <Plus size={12} strokeWidth={3} />
            ADD DEPO
          </button>
        </div>
      </header>

      {showModal && (
        <AddDepoModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveDepo}
        />
      )}
    </>
  );
}