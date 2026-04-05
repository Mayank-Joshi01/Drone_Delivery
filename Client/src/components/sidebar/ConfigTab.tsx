import { Zap, Weight, Activity } from "lucide-react";
import { useDrone } from "../../context/DroneContext";
import { PRIORITY_BANDS, DEFAULT_DRONE_CONFIG } from "../../constants";
import ConfigInput from "./ConfigInput";
import { useState } from "react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface SectionDividerProps {
  label: string;
}

interface LegendRowProps {
  range: string;
  label: string;
  color: string;
}

// Typing the local state for form values
interface DroneFormValues {
  maxPayload: number;
  baseEnergy: number;
  weightImpactFactor: number;
  NumberOfDrone:number;
  speed: number;//m/s
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-[6px] text-[9px] font-extrabold tracking-[0.2em] text-[#2a5a3a] mb-3">
      <div className="flex-1 h-px bg-[#0f2a1a]" />
      {label}
      <div className="flex-1 h-px bg-[#0f2a1a]" />
    </div>
  );
}

function LegendRow({ range, label, color }: LegendRowProps) {
  return (
    <div className="flex items-center gap-2 mb-[6px]">
      <div
        className="w-2 h-2 rounded-[2px] shrink-0"
        style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
      />
      <span className="text-[10px] font-semibold flex-1" style={{ color }}>{label}</span>
      <span className="text-[10px] text-[#2a5a3a]">{range}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ConfigTab() {
  const { droneConfig, updateDroneConfig } = useDrone();

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Initialize state with the local interface
  const [formValues, setFormValues] = useState<DroneFormValues>({
    maxPayload: 0,
    baseEnergy: 0,
    weightImpactFactor: 0,
    NumberOfDrone: 0,
    speed: 0,//m/s
  });

  const btnBase = "border-none rounded-[10px] px-6 h-11 text-[11px] font-extrabold tracking-[0.15em] flex items-center gap-2 transition-all duration-300 font-['JetBrains_Mono',monospace] min-w-[100px] justify-center";
  const btnActive = "bg-gradient-to-br from-[#00cc66] to-[#00ff88] text-[#001a0d] cursor-pointer shadow-[0_0_24px_#00ff8844,0_4px_16px_#00cc6633]";
  const btnDisabled = "bg-[#0a1a12] text-[#1a4a2a] cursor-not-allowed shadow-none";

  // Use keyof to ensure only valid fields are updated
  const handleChange = (field: keyof DroneFormValues, val: number) => {
    setFormValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    
    const droneConfigUpdates: Partial<DroneFormValues> = {
      maxPayload: formValues.maxPayload || droneConfig.maxPayload,
      baseEnergy: formValues.baseEnergy || droneConfig.baseEnergy,
      weightImpactFactor: formValues.weightImpactFactor || droneConfig.weightImpactFactor,
      NumberOfDrone: formValues.NumberOfDrone || droneConfig.NumberOfDrone,
      speed: formValues.speed || droneConfig.speed,
    };

    updateDroneConfig(droneConfigUpdates);

    setFormValues({ maxPayload: 0, baseEnergy: 0, weightImpactFactor: 0, NumberOfDrone: 0, speed: 0 });
    
    // Optional: Add a small delay to simulate processing
    setTimeout(() => setIsUpdating(false), 500);
  };

  const handleReset = () => {
    updateDroneConfig(DEFAULT_DRONE_CONFIG);
    setIsUpdating(false);
    setFormValues({ maxPayload: 0, baseEnergy: 0, weightImpactFactor: 0, NumberOfDrone: 0, speed: 0 });
  };

  return (
    <div className="flex flex-col gap-4" style={{ animation: "fadeSlideIn 0.3s ease" }}>
      <div>
        <SectionDivider label="DRONE PARAMETERS" />
        <div className="bg-[#0a1a12] rounded-[10px] p-[14px] border border-[#0f2a1a] flex flex-col gap-[14px]">
          <ConfigInput
            label="Max Payload"
            value={formValues.maxPayload || droneConfig.maxPayload}
            min={1} max={50} step={0.5} unit="kg" icon={Weight}
            onChange={(v) => handleChange("maxPayload", v)}
          />
          <ConfigInput
            label="Base Energy Cost"
            value={formValues.baseEnergy || droneConfig.baseEnergy}
            min={10} max={500} step={5} unit="Wh" icon={Zap}
            onChange={(v) => handleChange("baseEnergy", v)}
          />
          <ConfigInput
            label="Weight Impact Factor"
            value={formValues.weightImpactFactor || droneConfig.weightImpactFactor}
            min={0.1} max={10} step={0.1} unit="×" icon={Activity}
            onChange={(v) => handleChange("weightImpactFactor", v)}
          />
          <ConfigInput
            label="Number of Drones"
            value={formValues.NumberOfDrone || droneConfig.NumberOfDrone}
            min={1} max={20} step={1} unit="" icon={Activity}
            onChange={(v) => handleChange("NumberOfDrone", v)}
          />
          <ConfigInput
            label="Speed"
            value={formValues.speed || droneConfig.speed}
            min={0.1} max={10} step={0.1} unit="m/s" icon={Activity}
            onChange={(v) => handleChange("speed", v)}
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className={`${btnBase} ${isUpdating ? btnDisabled : btnActive}`}
            >
              Save Config
            </button>
            <button
              onClick={handleReset}
              disabled={isUpdating}
              className={`${btnBase} ${isUpdating ? btnDisabled : btnActive}`}
            >
              Reset All
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0a1a12] rounded-lg p-3 border border-[#0f2a1a]">
        <div className="text-[9px] text-[#2a5a3a] tracking-[0.15em] mb-[10px] font-bold">
          PRIORITY LEGEND
        </div>
        <LegendRow range="8 – 10" label={PRIORITY_BANDS.HIGH.label} color={PRIORITY_BANDS.HIGH.color} />
        <LegendRow range="5 – 7" label={PRIORITY_BANDS.MEDIUM.label} color={PRIORITY_BANDS.MEDIUM.color} />
        <LegendRow range="1 – 4" label={PRIORITY_BANDS.LOW.label} color={PRIORITY_BANDS.LOW.color} />
      </div>
    </div>
  );
}