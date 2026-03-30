/**
 * components/sidebar/Sidebar.jsx
 * --------------------------------
 * Left panel (300 px) with a two-tab switcher:
 *   CONFIG   → <ConfigTab />
 *   MANIFEST → <ManifestTab />  (shows live parcel count badge)
 */

import { useState }    from "react";
import { Settings, Package } from "lucide-react";
import { useDrone }    from "../../context/DroneContext";
import ConfigTab       from "./ConfigTab";
import ManifestTab     from "./ManifestTab";

const TABS = [
  { id: "config",   label: "CONFIG",   Icon: Settings },
  { id: "manifest", label: "MANIFEST", Icon: Package  },
];

// ─── Single tab button ────────────────────────────────────────────────────────
function TabButton({ tab, active, badge, onClick }) {
  return (
    <button
      onClick={() => onClick(tab.id)}
      style={{
        flex: 1, padding: "12px 8px", background: "transparent", border: "none",
        borderBottom: `2px solid ${active ? "#00ff88" : "transparent"}`,
        color: active ? "#00ff88" : "#2a5a3a",
        fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em",
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", gap: "6px",
        transition: "all 0.2s", fontFamily: "'JetBrains Mono',monospace",
      }}
    >
      <tab.Icon size={11} />
      {tab.label}
      {badge > 0 && (
        <span style={{ background: "#00ff8833", color: "#00ff88", borderRadius: "10px", padding: "1px 5px", fontSize: "9px" }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("config");
  const { parcels } = useDrone();

  return (
    <aside style={{
      width: "300px", flexShrink: 0,
      background: "#050d08", borderRight: "1px solid #0f2a1a",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>

      {/* Tab header row */}
      <div style={{ display: "flex", borderBottom: "1px solid #0f2a1a", flexShrink: 0 }}>
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
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {activeTab === "config"   && <ConfigTab />}
        {activeTab === "manifest" && <ManifestTab />}
      </div>
    </aside>
  );
}
