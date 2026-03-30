/**
 * hooks/useGlobalStyles.js
 * -------------------------
 * Injects a <style> tag containing global keyframes, font imports,
 * and Leaflet control overrides on mount; removes it on unmount.
 *
 * Called once at the AppLayout level — never inside loops or conditionals.
 */

import { useEffect } from "react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Syne:wght@400;600;700;800&display=swap');

  /* ── Animations ─────────────────────────────────────────────── */
  @keyframes hubPulse {
    0%,100% { box-shadow: 0 0 24px #00ff8888, 0 0 48px #00ff8844; }
    50%     { box-shadow: 0 0 40px #00ff88bb, 0 0 80px #00ff8866; }
  }
  @keyframes ripple {
    0%   { transform:scale(1); opacity:.6; }
    100% { transform:scale(2); opacity:0;  }
  }
  @keyframes fadeSlideIn {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes blink {
    0%,100% { opacity:1;   }
    50%     { opacity:0.3; }
  }
  @keyframes spin {
    from { transform:rotate(0deg);   }
    to   { transform:rotate(360deg); }
  }

  /* ── Leaflet overrides ──────────────────────────────────────── */
  .leaflet-container          { font-family:'JetBrains Mono',monospace !important; }
  .leaflet-control-attribution{ display:none !important; }
  .leaflet-control-zoom a     {
    background:#0a1a12 !important;
    border-color:#1a3a2a !important;
    color:#00ff88 !important;
  }
  .leaflet-popup-content-wrapper,
  .leaflet-popup-tip {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  .leaflet-popup-content { margin: 0 !important; }

  /* ── Misc ───────────────────────────────────────────────────── */
  input[type=number]::-webkit-inner-spin-button { opacity:.3; }
  ::-webkit-scrollbar       { width:4px; }
  ::-webkit-scrollbar-track { background:#050d08; }
  ::-webkit-scrollbar-thumb { background:#1a3a2a; border-radius:2px; }
  ::-webkit-scrollbar-thumb:hover { background:#00ff8844; }
`;

export function useGlobalStyles() {
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);
}
