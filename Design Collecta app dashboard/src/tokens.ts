export const T = {
  bg: "#13100c",
  card: "#1c1710",
  cardRaised: "#231d14",
  amber: "#f59e0b",
  amberMuted: "rgba(245,158,11,0.1)",
  amberBorder: "rgba(245,158,11,0.12)",
  cream: "#f5e6cb",
  muted: "#6b5a42",
  mutedMid: "#a08050",
  green: "#5cb88a",
  greenMuted: "rgba(92,184,138,0.1)",
  red: "#ef4444",
  redMuted: "rgba(239,68,68,0.12)",
  border: "rgba(245,158,11,0.07)",
  ff: "'Fraunces', serif",
  fb: "'Outfit', sans-serif",
  fm: "'DM Mono', monospace",
  cardShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 4px 20px rgba(0,0,0,0.4)",
  cardShadowRaised:
    "0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(245,158,11,0.1)",
};

export function statusColor(status: string): string {
  if (status === "overdue") return T.red;
  if (status === "paid") return T.green;
  if (status === "draft") return T.muted;
  return T.amber; // sent / pending
}

export function statusBg(status: string): string {
  if (status === "overdue") return T.redMuted;
  if (status === "paid") return T.greenMuted;
  if (status === "draft") return "rgba(107,90,66,0.15)";
  return T.amberMuted;
}

export function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
