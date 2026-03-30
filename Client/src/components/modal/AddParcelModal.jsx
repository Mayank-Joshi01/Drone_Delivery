/**
 * components/modal/AddParcelModal.jsx
 * -------------------------------------
 * Overlay form triggered by a map right-click.
 * Collects parcel name, weight, and priority, then calls addParcel() from context.
 *
 * Backdrop click → close without saving.
 * Enter key in name field → save.
 */

import { useState }           from "react";
import { X, Package }         from "lucide-react";
import { useDrone }           from "../../context/DroneContext";
import { priorityColor }      from "../../utils/calculations";

// ─── Labelled field wrapper ───────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: "9px", fontWeight: 700,
        letterSpacing: "0.15em", color: "#4a7a6a",
        textTransform: "uppercase", marginBottom: "6px",
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Consistent styled input ──────────────────────────────────────────────────
function ModalInput({ valueColor = "#c0d8c8", ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%", boxSizing: "border-box",
        background: "#0a1a12", border: "1px solid #1a3a2a",
        borderRadius: "8px", padding: "10px 12px",
        color: valueColor, fontSize: "14px", fontWeight: 700,
        fontFamily: "'JetBrains Mono',monospace",
        outline: "none", transition: "border-color 0.2s",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#00ff88")}
      onBlur={(e)  => (e.target.style.borderColor = "#1a3a2a")}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddParcelModal() {
  const { isModalOpen, closeModal, addParcel, tempLocation, droneConfig } = useDrone();

  const [form, setForm] = useState({ name: "", weight: 1, priority: 5 });
  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  if (!isModalOpen) return null;

  const canSave = form.name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    addParcel(form);
    setForm({ name: "", weight: 1, priority: 5 }); // reset for next open
  };

  return (
    /* ── Backdrop ── */
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#00000088", backdropFilter: "blur(6px)",
        animation: "fadeSlideIn 0.2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      {/* ── Dialog card ── */}
      <div style={{
        background: "#080f0a", border: "1px solid #1a3a2a",
        borderRadius: "16px", padding: "28px", width: "360px",
        boxShadow: "0 0 0 1px #00ff8811, 0 32px 80px #000000bb, 0 0 60px #00ff8811",
        animation: "fadeSlideIn 0.3s ease",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", fontFamily: "'Syne',sans-serif" }}>
              Add Parcel
            </div>
            {tempLocation && (
              <div style={{ fontSize: "10px", color: "#2a5a3a", marginTop: "3px", letterSpacing: "0.05em" }}>
                📍 {tempLocation.lat.toFixed(4)}, {tempLocation.lng.toFixed(4)}
              </div>
            )}
          </div>

          <button
            onClick={closeModal}
            style={{
              background: "#0a1a12", border: "1px solid #1a3a2a", borderRadius: "8px",
              width: "32px", height: "32px", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: "#4a7a6a", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "#ff444444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4a7a6a"; e.currentTarget.style.borderColor = "#1a3a2a"; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <Field label="Parcel Name">
            <ModalInput
              type="text" placeholder="e.g. Medical Supplies"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </Field>

          <div style={{ display: "flex", gap: "12px" }}>
            <Field label="Weight (kg)">
              <ModalInput
                type="number" min={0.1} max={droneConfig.maxPayload} step={0.1}
                value={form.weight} valueColor="#00ff88"
                onChange={(e) => set("weight", parseFloat(e.target.value))}
              />
            </Field>
            <Field label="Priority (1–10)">
              <ModalInput
                type="number" min={1} max={10} step={1}
                value={form.priority} valueColor={priorityColor(form.priority)}
                onChange={(e) => set("priority", parseInt(e.target.value))}
              />
            </Field>
          </div>

          {/* Priority bar */}
          <div style={{ height: "4px", background: "#0a1a12", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(form.priority / 10) * 100}%`,
              background:
                form.priority >= 8 ? "linear-gradient(90deg,#cc0000,#ff4444)" :
                form.priority >= 5 ? "linear-gradient(90deg,#cc7700,#ffaa00)" :
                                     "linear-gradient(90deg,#0055cc,#44aaff)",
              borderRadius: "2px", transition: "all 0.3s ease",
            }} />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              width: "100%", padding: "12px", border: "none", borderRadius: "10px",
              background: canSave ? "linear-gradient(135deg,#00cc66,#00ff88)" : "#0a1a12",
              color: canSave ? "#001a0d" : "#1a4a2a",
              fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em",
              cursor: canSave ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "all 0.3s ease", fontFamily: "'JetBrains Mono',monospace",
              boxShadow: canSave ? "0 0 24px #00ff8833" : "none", marginTop: "4px",
            }}
          >
            <Package size={13} />
            SAVE PARCEL TO MANIFEST
          </button>
        </div>
      </div>
    </div>
  );
}
