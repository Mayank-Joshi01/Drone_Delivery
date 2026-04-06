import { Info, X } from "lucide-react";

// Add this to your Sub-Components section
export default function MathModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#050d08] border border-[#00ff8833] rounded-2xl w-full max-w-md shadow-[0_0_50px_#00ff8811] overflow-hidden">
  <div className="flex justify-between items-center px-6 py-4 border-b border-[#0f2a1a]">
    <h3 className="text-[#00ff88] text-[11px] font-extrabold tracking-widest uppercase">Energy Calculation Model</h3>
    <button onClick={onClose} className="text-[#2a5a3a] hover:text-[#ff4444] transition-colors">
      <X size={16} />
    </button>
  </div>
  
  <div className="p-6 space-y-5 font-['JetBrains_Mono',monospace]">
    
    {/* 1. Constants Section */}
    <section>
      <h4 className="text-[10px] text-[#4a7a6a] mb-2 uppercase font-bold tracking-tighter">1. Environmental Constants</h4>
      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8ab49a]">
        <p>Gravity (g) = 9.81 m/s²</p>
        <p>Air Density (ρ) = 1.225 kg/m³</p>
        <p>Drag Coeff (Cd) = 0.5</p>
      </div>
    </section>

    {/* 2. Variables Section */}
    <section>
      <h4 className="text-[10px] text-[#4a7a6a] mb-2 uppercase font-bold tracking-tighter">2. Flight Variables</h4>
      <div className="text-[11px] text-[#c0d8c8] space-y-1 bg-[#0a1710] p-3 rounded-lg border border-[#143322]">
        <p>m_total = m_drone + m_payload <span className="text-[#4a7a6a] ml-2">// kg</span></p>
        <p>v_flight = Speed <span className="text-[#4a7a6a] ml-2">// m/s</span></p>
        <p>A_rotor = Total_Rotor_Area <span className="text-[#4a7a6a] ml-2">// m²</span></p>
        <p>A_front = Front_Area <span className="text-[#4a7a6a] ml-2">// m²</span></p>
      </div>
    </section>

    {/* 3. Power Section */}
    <section>
      <h4 className="text-[10px] text-[#4a7a6a] mb-2 uppercase font-bold tracking-tighter">3. Power Consumption (Watts)</h4>
      <div className="text-[11px] text-[#c0d8c8] space-y-3">
        <div className="flex flex-col space-y-1">
          <span className="text-[#4a7a6a]">Hover Power (Dynamic based on payload)</span>
          <span>P_hover = √[ (m_total · g)³ / (2 · ρ · A_rotor) ]</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-[#4a7a6a]">Drag Power (Constant at steady speed)</span>
          <span>P_drag = 0.5 · ρ · Cd · A_front · v_flight³</span>
        </div>
        <div className="font-bold text-[#00ff88] pt-2 border-t border-[#143322]">
          P_total = P_hover + P_drag
        </div>
      </div>
    </section>

    {/* 4. Energy Section */}
    <section>
      <h4 className="text-[10px] text-[#4a7a6a] mb-2 uppercase font-bold tracking-tighter">4. Edge Energy Cost</h4>
      <div className="text-[11px] text-[#c0d8c8] space-y-1 bg-[#0a1710] p-3 rounded-lg border border-[#143322]">
        <p>Flight_Time (s) = Distance / v_flight</p>
        <p className="text-[#00ff88] mt-2 pt-2 border-t border-[#143322]">
          Energy (Joules) = P_total · Flight_Time
        </p>
        <p className="text-[#8ab49a] mt-1">
          Energy (Wh) = Joules / 3600
        </p>
      </div>
    </section>

  </div>
</div>
    </div>
  );
}