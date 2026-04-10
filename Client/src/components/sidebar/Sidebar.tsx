import { useState } from "react";
import { Settings, Package, Drone} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useParcel } from "../../context/ParcleContext"; 
import ConfigTab from "./ConfigTab";
import ManifestTab from "./ManifestTab";
import DroneTab from "./DroneTab";

// ─── Types ───────────────────────────────────────────────────────────────────

// Defining the specific IDs allowed for our tabs
type TabId = "config" | "manifest" | "Drones"; // Add more as needed

interface Tab {
  id: TabId;
  label: string;
  Icon: LucideIcon; // Correct type for Lucide components
}

interface TabButtonProps {
  tab: Tab;
  active: boolean;
  badge: number;
  onClick: (id: TabId) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: "config",   label: "CONFIG",   Icon: Settings },
  { id: "manifest", label: "MANIFEST", Icon: Package  },
  { id : "Drones", label : "DRONES", Icon : Drone     }
];

// ─── Single tab button ────────────────────────────────────────────────────────

function TabButton({ tab, active, badge, onClick }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`flex-1 py-3 px-2 bg-transparent border-none border-b-2 text-[9px] font-bold tracking-[0.15em] cursor-pointer flex items-center justify-center gap-[6px] transition-all duration-200 font-['JetBrains_Mono',monospace]
        ${active
          ? "border-b-[#00ff88] text-[#00ff88]"
          : "border-b-transparent text-[#2a5a3a]"
        }`}
    >
      <tab.Icon size={11} />
      {tab.label}
      {badge > 0 && (
        <span className="bg-[#00ff8833] text-[#00ff88] rounded-[10px] px-[5px] py-[1px] text-[9px]">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Sidebar() {
  // TypeScript now knows activeTab is specifically one of the TabId strings
  const [activeTab, setActiveTab] = useState<TabId>("config");
  const { parcels } = useParcel();

  return (
    <aside className="w-[300px] shrink-0 bg-[#050d08] border-r border-[#0f2a1a] flex flex-col overflow-hidden">

      {/* Tab header row */}
      <div className="flex border-b border-[#0f2a1a] shrink-0">
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            badge={tab.id === "manifest" ? parcels.length : 0}
            onClick={setActiveTab}
          />
        ))}
      </div>

      {/* Scrollable tab body */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "config"   && <ConfigTab />}
        {activeTab === "manifest" && <ManifestTab />}
        {activeTab === "Drones" && <DroneTab/>}
      </div>
    </aside>
  );
}