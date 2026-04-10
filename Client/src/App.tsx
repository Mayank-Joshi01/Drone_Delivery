import './App.css'
import { DroneProvider }  from "./context/DroneContext";
import { useGlobalStyles } from "./hooks/useGlobalStyles";
import { DepoProvider }   from "./context/DepoContext";
import { PathProvider } from './context/PathContext';
import { ParcelProvider } from './context/ParcleContext';

import Header        from "./components/header/Header";
import Sidebar       from "./components/sidebar/Sidebar";
import MapView       from "./components/map/MapView";
import BottomBar     from "./components/bottombar/BottomBar";
import AddParcelModal from "./components/modal/AddParcelModal";

// ─── Inner layout — must be a child of DroneProvider ─────────────────────────
function AppLayout() {
  useGlobalStyles(); // inject @keyframes + Leaflet overrides once on mount

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#020a05",
      color: "#c0d8c8",
      fontFamily: "'JetBrains Mono', monospace",
      overflow: "hidden",
    }}>
      {/* ── Top navigation bar ───────────────────────────────────────── */}
      <Header />

      {/* ── Body: sidebar (30%) + map column (70%) ───────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />

        {/* Map column stretches to fill remaining width */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <MapView />
          <BottomBar />
        </main>
      </div>

      {/* ── Modal rendered at root level (above all other layers) ───── */}
      <AddParcelModal />
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <DepoProvider>
    <PathProvider>
       <DroneProvider>
      <ParcelProvider>
      <AppLayout />
    </ParcelProvider>
      </DroneProvider>
    </PathProvider>
    </DepoProvider>
  );
}

