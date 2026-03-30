/**
 * utils/icons.js
 * --------------
 * All custom Leaflet divIcon factories live here.
 * Import these into map components — never construct divIcons inside JSX.
 */

import L from "leaflet";
import { LEAFLET_ICON_URLS } from "../constants";

// ─── One-time fix for bundler-broken default Leaflet icon paths ───────────────
export function fixLeafletDefaultIcons() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions(LEAFLET_ICON_URLS);
}

// ─── Hub: animated pulsing circle ────────────────────────────────────────────
export const hubIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:44px;height:44px;
      background:radial-gradient(circle,#00ff88 0%,#00cc66 60%,transparent 100%);
      border:3px solid #00ff88;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 24px #00ff8888,0 0 48px #00ff8844;
      animation:hubPulse 2s ease-in-out infinite;
      position:relative;
    ">
      <div style="width:14px;height:14px;background:#001a0d;border-radius:50%;"></div>
      <div style="
        position:absolute;width:60px;height:60px;
        border:2px solid #00ff8844;border-radius:50%;
        top:-10px;left:-10px;
        animation:ripple 2s linear infinite;
      "></div>
    </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

// ─── Parcel: colour by priority, numbered index badge ────────────────────────
export function createParcelIcon(priority, index) {
  const color =
    priority >= 8 ? "#ff4444" : priority >= 5 ? "#ffaa00" : "#44aaff";
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:36px;height:36px;
        background:linear-gradient(135deg,${color}33,${color}11);
        border:2px solid ${color};border-radius:8px;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 12px ${color}66;
        font-size:11px;font-weight:700;
        font-family:'JetBrains Mono',monospace;
        position:relative;backdrop-filter:blur(4px);
      ">
        <span style="
          position:absolute;top:-8px;right:-8px;
          background:${color};color:#000;
          border-radius:50%;width:16px;height:16px;
          display:flex;align-items:center;justify-content:center;
          font-size:9px;font-weight:800;
        ">${index + 1}</span>
        📦
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}
