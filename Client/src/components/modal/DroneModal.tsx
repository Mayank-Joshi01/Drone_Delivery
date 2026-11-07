import { useState, useEffect } from "react";
import {
  X, Battery, Navigation, Navigation2, Package,
  Activity, Wifi, Zap, MapPin, Eye, RotateCcw, Power
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Drone {
  id: string;
  name: string;
  color: string;
  status: "idle" | "flying" | "charging" | "error";
  batteryLeft: number;
  altitude: number;
  parcelsLeft?: string[];
  lat?: number;
  lng?: number;
  speed?: number;
}

interface DroneModalProps {
  drone: Drone;
  onClose: () => void;
}

// ─── Flying Drone SVG Animation ───────────────────────────────────────────────

function FlyingDroneAnimation({ color }: { color: string }) {
  return (
    <div className="relative w-full h-36 flex items-center justify-center overflow-hidden">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#00ff88" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Scan line sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #00ff8808 50%, transparent 100%)",
          animation: "scanSweep 2.5s ease-in-out infinite",
        }}
      />

      {/* Altitude beam below drone */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px"
        style={{
          height: "60px",
          background: `linear-gradient(to bottom, ${color}88, transparent)`,
          animation: "beamPulse 1.8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "40px",
          height: "2px",
          background: `radial-gradient(ellipse at center, ${color}55, transparent)`,
          animation: "shadowPulse 1.8s ease-in-out infinite",
        }}
      />

      {/* Drone Body */}
      <div
        className="relative z-10"
        style={{ animation: "droneFloat 2.8s ease-in-out infinite" }}
      >
        {/* Propeller arms */}
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Arms */}
          <line x1="60" y1="40" x2="20" y2="20" stroke="#1a4a2a" strokeWidth="2" />
          <line x1="60" y1="40" x2="100" y2="20" stroke="#1a4a2a" strokeWidth="2" />
          <line x1="60" y1="40" x2="20" y2="60" stroke="#1a4a2a" strokeWidth="2" />
          <line x1="60" y1="40" x2="100" y2="60" stroke="#1a4a2a" strokeWidth="2" />

          {/* Motor rings */}
          {[
            [20, 20], [100, 20], [20, 60], [100, 60],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="10" fill="#0a1a12" stroke="#0f3a1f" strokeWidth="1.5" />
              <circle
                cx={cx} cy={cy} r="9"
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.4"
                strokeDasharray="3 3"
                style={{ animation: `spinProp${i % 2 === 0 ? "A" : "B"} 0.3s linear infinite` }}
              />
            </g>
          ))}

          {/* Body */}
          <rect x="46" y="30" width="28" height="20" rx="4" fill="#0a1a12" stroke="#0f3a1f" strokeWidth="1.5" />
          <rect x="52" y="34" width="16" height="12" rx="2" fill="#050d08" stroke={color} strokeWidth="0.5" strokeOpacity="0.6" />

          {/* Center dot */}
          <circle cx="60" cy="40" r="2.5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />

          {/* LED lights */}
          <circle cx="20" cy="20" r="2" fill={color} fillOpacity="0.8" style={{ animation: "ledBlink 1.2s ease-in-out infinite" }} />
          <circle cx="100" cy="60" r="2" fill="#ff4444" fillOpacity="0.8" style={{ animation: "ledBlink 1.2s ease-in-out infinite 0.6s" }} />
        </svg>
      </div>

      {/* Pulse rings */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "50%",
            width: `${i * 40}px`,
            height: `${i * 40}px`,
            marginTop: `-${i * 20}px`,
            marginLeft: `-${i * 20}px`,
            border: `1px solid ${color}`,
            borderRadius: "50%",
            opacity: 0,
            animation: `radarRing 2.5s ease-out infinite ${i * 0.5}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes droneFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          30% { transform: translateY(-8px) rotate(1deg); }
          70% { transform: translateY(-4px) rotate(-1deg); }
        }
        @keyframes scanSweep {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); }
        }
        @keyframes beamPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: translateX(-50%) scaleX(0.6); opacity: 0.2; }
          50% { transform: translateX(-50%) scaleX(1); opacity: 0.5; }
        }
        @keyframes spinPropA {
          from { transform: rotate(0deg); transform-origin: center; }
          to { transform: rotate(360deg); transform-origin: center; }
        }
        @keyframes spinPropB {
          from { transform: rotate(0deg); transform-origin: center; }
          to { transform: rotate(-360deg); transform-origin: center; }
        }
        @keyframes radarRing {
          0% { transform: scale(0.3); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes ledBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────

function StatRow({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#0f2a1a] last:border-0">
      <div className="flex items-center gap-2 text-[#2a5a3a]">
        <span className="w-3.5 h-3.5 flex items-center justify-center">{icon}</span>
        <span className="text-[9px] font-bold tracking-[0.18em] uppercase font-['Syne',sans-serif]">
          {label}
        </span>
      </div>
      <span
        className="text-[11px] font-bold font-['JetBrains_Mono',monospace]"
        style={{ color: accent ?? "#c0d8c8" }}
      >
        {value}
        {unit && (
          <span className="text-[9px] opacity-40 ml-1">{unit}</span>
        )}
      </span>
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────

function ActionBtn({
  icon,
  label,
  variant = "default",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "danger" | "primary";
  onClick?: () => void;
}) {
  const styles = {
    default:
      "border-[#0f2a1a] bg-[#050d08] text-[#4a8a6a] hover:border-[#00ff8833] hover:text-[#00ff88] hover:bg-[#00ff8808]",
    primary:
      "border-[#00ff8833] bg-[#00ff8810] text-[#00ff88] hover:bg-[#00ff8820] hover:shadow-[0_0_16px_#00ff8822]",
    danger:
      "border-[#ff444422] bg-[#ff44440a] text-[#ff6666] hover:bg-[#ff444418] hover:border-[#ff444444]",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-[9px] font-extrabold tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer ${styles[variant]}`}
    >
      <span className="w-3.5 h-3.5 flex items-center justify-center">{icon}</span>
      {label}
    </button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function DroneModal({ drone, onClose }: DroneModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const batteryColor =
    drone.batteryLeft > 60 ? "#00ff88" : drone.batteryLeft > 20 ? "#ffaa00" : "#ff4444";

  const statusColors: Record<string, string> = {
    idle: "#00ff88",
    flying: "#44aaff",
    charging: "#ffaa00",
    error: "#ff4444",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(2,8,4,0.85)",
        backdropFilter: "blur(6px)",
        animation: "backdropIn 0.2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0a1a12 0%, #060e09 100%)",
          border: "1px solid #0f2a1a",
          boxShadow: `0 0 60px #00ff8810, 0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 #ffffff08`,
          animation: visible ? "fadeSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)" : undefined,
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff8840] rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ff8840] rounded-tr-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ff8820] rounded-bl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff8820] rounded-br-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: `${drone.color}18`, border: `1px solid ${drone.color}30` }}
            >
              <Navigation2 size={13} style={{ color: drone.color }} />
            </div>
            <div>
              <h2
                className="text-[11px] font-extrabold tracking-[0.2em] uppercase font-['Syne',sans-serif]"
                style={{ color: drone.color }}
              >
                {drone.name}
              </h2>
              <p className="text-[8px] text-[#2a5a3a] font-bold tracking-widest uppercase">
                {drone.id.split("-")[0]} · UNIT PROFILE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#050d08] border border-[#0f2a1a] flex items-center justify-center text-[#2a5a3a] hover:text-[#ff6666] hover:border-[#ff444433] transition-all duration-200 cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>

        {/* Drone Animation */}
        <FlyingDroneAnimation color={drone.color} />

        {/* Status badge */}
        <div className="flex justify-center -mt-2 mb-4">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-extrabold tracking-[0.2em] uppercase"
            style={{
              background: `${statusColors[drone.status]}12`,
              border: `1px solid ${statusColors[drone.status]}30`,
              color: statusColors[drone.status],
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: statusColors[drone.status] }}
            />
            {drone.status}
          </div>
        </div>

        {/* Info Panel */}
        <div className="mx-5 mb-4 rounded-xl bg-[#050d08] border border-[#0f2a1a] overflow-hidden">
          <div className="px-4 py-1 border-b border-[#0f2a1a] flex items-center gap-2">
            <Wifi size={9} className="text-[#2a5a3a]" />
            <span className="text-[8px] text-[#2a5a3a] font-bold tracking-[0.2em] uppercase">
              Telemetry · Live
            </span>
            <div className="ml-auto w-1 h-1 rounded-full bg-[#00ff88] animate-pulse" />
          </div>
          <div className="px-4 py-1">
            <StatRow
              icon={<Battery size={10} />}
              label="Battery"
              value={`${drone.batteryLeft}`}
              unit="%"
              accent={batteryColor}
            />
            <StatRow
              icon={<Navigation size={10} />}
              label="Altitude"
              value={drone.altitude}
              unit="m AGL"
            />
            <StatRow
              icon={<Package size={10} />}
              label="Parcels"
              value={drone.parcelsLeft?.length ?? 0}
              unit="on board"
            />
            <StatRow
              icon={<Activity size={10} />}
              label="Signal"
              value="-42"
              unit="dBm"
              accent="#00ff88"
            />
            <StatRow
              icon={<Zap size={10} />}
              label="Speed"
              value={drone.speed ?? 0}
              unit="km/h"
            />
            <StatRow
              icon={<MapPin size={10} />}
              label="Coords"
              value={
                drone.lat != null && drone.lng != null
                  ? `${drone.lat.toFixed(4)}, ${drone.lng.toFixed(4)}`
                  : "N/A"
              }
            />
          </div>
        </div>

        {/* Battery Bar */}
        <div className="mx-5 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] text-[#2a5a3a] font-bold tracking-widest uppercase">
              Power Cell
            </span>
            <span
              className="text-[9px] font-bold font-['JetBrains_Mono',monospace]"
              style={{ color: batteryColor }}
            >
              {drone.batteryLeft}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#050d08] rounded-full overflow-hidden border border-[#0f2a1a]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${drone.batteryLeft}%`,
                background: `linear-gradient(to right, ${batteryColor}88, ${batteryColor})`,
                boxShadow: `0 0 8px ${batteryColor}66`,
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mx-5 mb-5 grid grid-cols-3 gap-2">
          <ActionBtn icon={<Eye size={11} />} label="Track" variant="primary" />
          <ActionBtn icon={<RotateCcw size={11} />} label="RTH" variant="default" />
          <ActionBtn icon={<Power size={11} />} label="Kill" variant="danger" />
        </div>
      </div>
    </div>
  );
}

// ─── Demo Wrapper (remove in production) ──────────────────────────────────────

export function DroneModalDemo() {
  const [open, setOpen] = useState(false);

  const mockDrone: Drone = {
    id: "drone-a1b2c3-xyz",
    name: "Wraith-7",
    color: "#00ff88",
    status: "flying",
    batteryLeft: 74,
    altitude: 120,
    parcelsLeft: ["PKG-001", "PKG-002"],
    lat: 28.6139,
    lng: 77.209,
    speed: 42,
  };

  return (
    <div className="min-h-screen bg-[#020804] flex items-center justify-center">
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-xl bg-[#0a1a12] border border-[#0f2a1a] text-[#00ff88] text-[10px] font-extrabold tracking-widest uppercase hover:border-[#00ff8844] hover:shadow-[0_0_20px_#00ff8815] transition-all"
      >
        Open Drone Modal
      </button>
      {open && <DroneModal drone={mockDrone} onClose={() => setOpen(false)} />}
    </div>
  );
}