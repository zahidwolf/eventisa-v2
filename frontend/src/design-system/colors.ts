/**
 * Eventisa — premium all-events palette (concert lighting, dark luxury).
 * Accent pink/purple for CTA, active states, glow only.
 */
export const colors = {
  surface: {
    base: "#070B1A",
    elevated: "#10162A",
    card: "#151B31",
    glass: "rgba(21, 27, 49, 0.72)",
    border: "rgba(255, 255, 255, 0.08)",
    borderHover: "rgba(255, 62, 165, 0.35)",
  },
  accent: {
    pink: "#FF3EA5",
    purple: "#9B5CFF",
    blue: "#4F8CFF",
    pinkGlow: "rgba(255, 62, 165, 0.4)",
    purpleGlow: "rgba(155, 92, 255, 0.35)",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#94A3B8",
    muted: "#64748B",
  },
  status: {
    success: "#22C55E",
    warning: "#EAB308",
    error: "#EF4444",
    soldOut: "#475569",
  },
} as const;
