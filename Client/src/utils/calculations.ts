// ─── Priority → accent colour ─────────────────────────────────────────────────
/**
 * Maps a numeric priority (1-10) to a Hex color string.
 */
export function priorityColor(priority: number): string {
  if (priority >= 8) return "#ff4444"; // High/Critical
  if (priority >= 5) return "#ffaa00"; // Medium
  return "#44aaff";                   // Low/Standard
}

// ─── Payload percentage (0-100, clamped) ─────────────────────────────────────
export function payloadPercent(totalWeight: number, maxPayload: number): number {
  if (maxPayload <= 0) return 0;
  return Math.min(Math.round((totalWeight / maxPayload) * 100), 100);
}