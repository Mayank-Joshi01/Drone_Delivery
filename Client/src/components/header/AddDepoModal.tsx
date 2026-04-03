import { X, MapPin } from "lucide-react";
import { useState} from "react";
import type { ChangeEvent } from "react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface SearchParams {
  countryCode: string;
  city: string;
  postalCode: string;
}

export interface GeocodedLocation {
  city: string;
  lat: number;
  lon: number;
}

// Nominatim API specific response shape
interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  [key: string]: any; // For other fields we don't strictly need
}

interface AddDepoModalProps {
  onClose: () => void;
  onSave: (location: GeocodedLocation | null) => Promise<void>;
}

interface FormState {
  country: string;
  city: string;
  pincode: string;
}

// ─── Geocoding Logic ─────────────────────────────────────────────────────────

async function searchLocation({ 
  countryCode, 
  city, 
  postalCode 
}: SearchParams): Promise<GeocodedLocation | null> {
  let url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1`;

  if (city) url += `&city=${encodeURIComponent(city)}`;
  if (countryCode) url += `&countrycodes=${encodeURIComponent(countryCode)}`;
  if (postalCode) url += `&postalcode=${encodeURIComponent(postalCode)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "DroneDeliveryApp/1.0 (mayank@gmail.com)",
        "Accept-Language": "en"
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: NominatimResponse[] = await response.json();

    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0];
      console.log("Location Found:", display_name);
      
      return {
        city: display_name,
        lat: parseFloat(lat), // API returns strings, convert to numbers
        lon: parseFloat(lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error("Geocoding Request Failed:", error);
    return null;
  }
}

// ─── Modal Component ─────────────────────────────────────────────────────────

export default function AddDepoModal({ onClose, onSave }: AddDepoModalProps) {
  const [form, setForm] = useState<FormState>({ country: "", city: "", pincode: "" });
  const [saving, setSaving] = useState<boolean>(false);

  const handleChange = (field: keyof FormState, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    if (!form.country || !form.city || !form.pincode) return;

    setSaving(true);
    
    // Fixed: Passing form as a single object to match searchLocation definition
    const location = await searchLocation({
      countryCode: form.country,
      city: form.city,
      postalCode: form.pincode
    });
    
    await onSave(location);
    setSaving(false);
    onClose();
  };

  const fields: { key: keyof FormState; label: string; placeholder: string }[] = [
    { key: "country",  label: "COUNTRY_CODE",  placeholder: "e.g. In" },
    { key: "city",     label: "CITY",          placeholder: "e.g. New Delhi" },
    { key: "pincode",  label: "PINCODE",       placeholder: "e.g. 110001" },
  ];

  const isValid = Object.values(form).every((v) => v.trim() !== "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm "
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#050d08] border border-[#0f2a1a] rounded-2xl w-full max-w-md mx-4 shadow-[0_0_60px_#00ff8811] animate-[fadeSlideIn_0.25s_ease]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0f2a1a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00cc66] to-[#00ff88] flex items-center justify-center">
              <MapPin size={15} color="#001a0d" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[13px] font-extrabold text-white tracking-[0.05em]">ADD NEW DEPO</div>
              <div className="text-[9px] text-[#2a5a3a] tracking-[0.15em]">REGISTER DISPATCH HUB</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-[#0a1a12] border border-[#0f2a1a] flex items-center justify-center text-[#2a5a3a] hover:text-[#00ff88] hover:border-[#00ff8844] transition-colors duration-200 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[9px] font-bold text-[#2a5a3a] tracking-[0.2em] mb-[6px]">
                {label}
              </label>
              <input
                type={key === "pincode" ? "number" : "text"}
                value={form[key]}
                placeholder={placeholder}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(key, e.target.value)}
                className="w-full bg-[#0a1a12] border border-[#0f2a1a] rounded-lg px-3 py-2 text-[12px] text-[#00ff88] placeholder-[#1a4a2a] tracking-[0.05em] outline-none focus:border-[#00ff8855] focus:shadow-[0_0_0_2px_#00ff8811] transition-all duration-200 font-['JetBrains_Mono',monospace]"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-[#0a1a12] border border-[#0f2a1a] text-[#2a5a3a] hover:text-[#00ff88] hover:border-[#00ff8833] text-[11px] font-extrabold tracking-[0.15em] transition-all duration-200 cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className={`flex-1 h-10 rounded-xl text-[11px] font-extrabold tracking-[0.15em] border-none transition-all duration-200 font-['JetBrains_Mono',monospace]
              ${isValid && !saving
                ? "bg-gradient-to-br from-[#00cc66] to-[#00ff88] text-[#001a0d] cursor-pointer shadow-[0_0_20px_#00ff8833]"
                : "bg-[#0a1a12] text-[#1a4a2a] cursor-not-allowed"
              }`}
          >
            {saving ? "SAVING…" : "SAVE DEPO"}
          </button>
        </div>
      </div>
    </div>
  );
}