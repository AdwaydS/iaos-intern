import type { ReactNode } from "react";

const GOOD = ["closed", "reviewed", "approved", "active", "on_track", "released", "complete", "compliant"];
const WARN = ["open", "pending", "held", "idle", "in_progress", "sent", "behind"];

export function statusBadge(status: string): ReactNode {
  const s = status || "—";
  const cls = GOOD.includes(s)
    ? "badge-success"
    : WARN.includes(s)
      ? "badge-gold"
      : "badge-slate";
  return <span className={`badge ${cls}`}>{s}</span>;
}

export function yesNoBadge(v: unknown): ReactNode {
  const s = String(v ?? "");
  const cls = s === "yes" ? "badge-success" : s === "no" ? "badge-danger" : "badge-slate";
  return <span className={`badge ${cls}`}>{s}</span>;
}

export function qualityBadge(v: unknown): ReactNode {
  const s = String(v ?? "");
  const cls =
    s === "good" ? "badge-success" : s === "average" ? "badge-gold" : s === "poor" ? "badge-danger" : "badge-slate";
  return <span className={`badge ${cls}`}>{s}</span>;
}
