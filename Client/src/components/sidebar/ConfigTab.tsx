import { Zap, Weight, Activity, Info } from "lucide-react";
import { useDrone } from "../../context/DroneContext";
import { PRIORITY_BANDS, DEFAULT_DRONE_CONFIG } from "../../constants";
import ConfigInput from "./ConfigInput";
import { useState } from "react";
import MathModal from "./MathModal";

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
  Max_Payload: number;
  Battery_Voltage: number;
  Battery_Capacity: number;
  Total_Rotor_Area: number;
  Front_Area: number;
  NumberOfDrone:number;
  Drone_Weight:number;
  Speed: number;//m/s

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
    Max_Payload: 0,
    Battery_Voltage: 0,
    Battery_Capacity: 0,
    Total_Rotor_Area: 0,
    Front_Area: 0,
    NumberOfDrone: 0,
    Drone_Weight: 0,
    Speed: 0,//m/s
  });

  const [showMath, setShowMath] = useState(false);

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
      Max_Payload: formValues.Max_Payload || droneConfig.Max_Payload,
      Battery_Voltage: formValues.Battery_Voltage || droneConfig.Battery_Voltage,
      Battery_Capacity: formValues.Battery_Capacity || droneConfig.Battery_Capacity,
      Total_Rotor_Area: formValues.Total_Rotor_Area || droneConfig.Total_Rotor_Area,
      Front_Area: formValues.Front_Area || droneConfig.Front_Area,
      NumberOfDrone: formValues.NumberOfDrone || droneConfig.NumberOfDrone,
      Drone_Weight: formValues.Drone_Weight || droneConfig.Drone_Weight,
      Speed: formValues.Speed || droneConfig.Speed,
    };

    updateDroneConfig(droneConfigUpdates);

    setFormValues({ Max_Payload: 0, Battery_Voltage: 0, Battery_Capacity: 0, Total_Rotor_Area: 0, Front_Area: 0, NumberOfDrone: 0, Drone_Weight: 0, Speed: 0 });
    
    // Optional: Add a small delay to simulate processing
    setTimeout(() => setIsUpdating(false), 500);
  };

  const handleReset = () => {
    updateDroneConfig(DEFAULT_DRONE_CONFIG);
    setIsUpdating(false);
    setFormValues({ Max_Payload: 0, Battery_Voltage: 0, Battery_Capacity: 0, Total_Rotor_Area: 0, Front_Area: 0, NumberOfDrone: 0, Drone_Weight: 0, Speed: 0 });
  };

  return (
    <div className="flex flex-col gap-4" style={{ animation: "fadeSlideIn 0.3s ease" }}>
      {/* ── MATH MODAL ── */}
      <MathModal isOpen={showMath} onClose={() => setShowMath(false)} />

      <div>

        <div className="flex items-center justify-between mb-1">
           <SectionDivider label="DRONE PARAMETERS" />
           {/* ── INFO ICON BUTTON ── */}
           <button 
             onClick={() => setShowMath(true)}
             className="text-[#2a5a3a] hover:text-[#00ff88] transition-colors mb-3 flex items-center gap-1 group"
           >
             <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Explain Maths</span>
             <Info size={14} />
           </button>
        </div>

        <SectionDivider label="DRONE PARAMETERS" />
        <div className="bg-[#0a1a12] rounded-[10px] p-[14px] border border-[#0f2a1a] flex flex-col gap-[14px]">
          <ConfigInput
            label="Max Payload"
            value={formValues.Max_Payload || droneConfig.Max_Payload}
            min={1} max={50} step={0.5} unit="kg" icon={Weight}
            onChange={(v) => handleChange("Max_Payload", v)}
          />
          <ConfigInput
            label="Battery Voltage"
            value={formValues.Battery_Voltage || droneConfig.Battery_Voltage}
            min={5} max={20} step={0.1} unit="V" icon={Zap}
            onChange={(v) => handleChange("Battery_Voltage", v)}
          />
          <ConfigInput
            label="Battery Capacity"
            value={formValues.Battery_Capacity || droneConfig.Battery_Capacity}
            min={1000} max={20000} step={100} unit="mAh" icon={Zap}
            onChange={(v) => handleChange("Battery_Capacity", v)}
          />
          <ConfigInput
            label="Drone Weight"
            value={formValues.Drone_Weight || droneConfig.Drone_Weight}
            min={.5} max={5} step={0.1} unit="Kg" icon={Activity}
            onChange={(v) => handleChange("Drone_Weight", v)}
          />
          <ConfigInput
            label="Total Rotors Area"
            value={formValues.Total_Rotor_Area || droneConfig.Total_Rotor_Area}
            min={0.1} max={5} step={0.01} unit="m²" icon={Activity}
            onChange={(v) => handleChange("Total_Rotor_Area", v)}
          />
          <ConfigInput
            label="Front Area"
            value={formValues.Front_Area || droneConfig.Front_Area}
            min={0.01} max={0.5} step={0.01} unit="m²" icon={Activity}
            onChange={(v) => handleChange("Front_Area", v)}
          />
          <ConfigInput
            label="Number of Drones"
            value={formValues.NumberOfDrone || droneConfig.NumberOfDrone}
            min={1} max={20} step={1} unit="" icon={Activity}
            onChange={(v) => handleChange("NumberOfDrone", v)}
          />
          <ConfigInput
            label="Speed"
            value={formValues.Speed || droneConfig.Speed}
            min={0.1} max={10} step={0.1} unit="m/s" icon={Activity}
            onChange={(v) => handleChange("Speed", v)}
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