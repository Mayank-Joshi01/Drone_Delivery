import { useState } from "react";
import type {ReactNode, ComponentPropsWithoutRef, KeyboardEvent} from "react";
import { X, Package } from "lucide-react";
import { useDrone } from "../../context/DroneContext";
import { priorityColor } from "../../utils/calculations";
import { useParcel } from "../../context/ParcleContext";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  children: ReactNode;
}

// Inherit all standard input attributes (type, placeholder, value, etc.)
interface ModalInputProps extends ComponentPropsWithoutRef<"input"> {
  valueColor?: string;
}

interface ParcelForm {
  name: string;
  weight: number;
  priority: number;
}

// ─── Labelled field wrapper ───────────────────────────────────────────────────

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="block text-[9px] font-bold tracking-[0.15em] text-[#4a7a6a] uppercase mb-[6px]">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Consistent styled input ──────────────────────────────────────────────────

function ModalInput({ valueColor = "#c0d8c8", className = "", ...props }: ModalInputProps) {
  return (
    <input
      {...props}
      style={{ color: valueColor }}
      className={`w-full box-border bg-[#0a1a12] border border-[#1a3a2a] rounded-lg px-3 py-[10px] text-sm font-bold font-['JetBrains_Mono',monospace] outline-none transition-colors duration-200 focus:border-[#00ff88] ${className}`}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AddParcelModal() {
  const {  droneConfig } = useDrone();
  const {isModalOpen , closeModal, addParcel, tempLocation} = useParcel();

  // Explicitly type the form state
  const [form, setForm] = useState<ParcelForm>({ 
    name: "", 
    weight: 1, 
    priority: 5 
  });

  // Type-safe helper for updating form fields
  const setField = <K extends keyof ParcelForm>(key: K, val: ParcelForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  if (!isModalOpen) return null;

  const canSave = form.name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    addParcel(form);
    setForm({ name: "", weight: 1, priority: 5 });
    closeModal(); // Ensure modal closes after saving
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
  };

  const priorityGradient =
    form.priority >= 8 ? "linear-gradient(90deg,#cc0000,#ff4444)" :
    form.priority >= 5 ? "linear-gradient(90deg,#cc7700,#ffaa00)" :
                         "linear-gradient(90deg,#0055cc,#44aaff)";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/[0.53] backdrop-blur-[6px] animate-[fadeSlideIn_0.2s_ease]"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="bg-[#080f0a] border border-[#1a3a2a] rounded-2xl p-7 w-[360px] shadow-[0_0_0_1px_#00ff8811,0_32px_80px_#000000bb,0_0_60px_#00ff8811] animate-[fadeSlideIn_0.3s_ease]">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-base font-extrabold text-white font-['Syne',sans-serif]">
              Add Parcel
            </div>
            {tempLocation && (
              <div className="text-[10px] text-[#2a5a3a] mt-[3px] tracking-[0.05em]">
                📍 {tempLocation.lat.toFixed(4)}, {tempLocation.lon.toFixed(4)}
              </div>
            )}
          </div>

          <button
            onClick={closeModal}
            className="bg-[#0a1a12] border border-[#1a3a2a] rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer text-[#4a7a6a] hover:text-[#ff6666] hover:border-[#ff444444] transition-all duration-200"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <Field label="Parcel Name">
            <ModalInput
              type="text"
              placeholder="e.g. Medical Supplies"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </Field>

          <div className="flex gap-3">
            <Field label="Weight (kg)">
              <ModalInput
                type="number" 
                min={0.1} 
                max={droneConfig.maxPayload} 
                step={0.1}
                value={form.weight} 
                valueColor="#00ff88"
                onChange={(e) => setField("weight", parseFloat(e.target.value) || 0)}
              />
            </Field>
            <Field label="Priority (1–10)">
              <ModalInput
                type="number" 
                min={1} 
                max={10} 
                step={1}
                value={form.priority} 
                valueColor={priorityColor(form.priority)}
                onChange={(e) => setField("priority", parseInt(e.target.value) || 1)}
              />
            </Field>
          </div>

          {/* Priority bar */}
          <div className="h-1 bg-[#0a1a12] rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-300"
              style={{ width: `${(form.priority / 10) * 100}%`, background: priorityGradient }}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full py-3 border-none rounded-[10px] text-[11px] font-extrabold tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-300 font-['JetBrains_Mono',monospace] mt-1
              ${canSave
                ? "bg-gradient-to-br from-[#00cc66] to-[#00ff88] text-[#001a0d] cursor-pointer shadow-[0_0_24px_#00ff8833]"
                : "bg-[#0a1a12] text-[#1a4a2a] cursor-not-allowed shadow-none"
              }`}
          >
            <Package size={13} />
            SAVE PARCEL TO MANIFEST
          </button>
        </div>
      </div>
    </div>
  );
}