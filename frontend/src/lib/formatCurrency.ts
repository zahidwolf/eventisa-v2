/** Indian/Bengali-style grouping: 1,25,000 */
export function formatBDT(amount: number): string {
  const n = Math.round(amount);
  const s = String(Math.abs(n));
  if (s.length <= 3) return `৳${n < 0 ? "-" : ""}${s}`;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length) parts.unshift(rest);
  const grouped = [...parts, last3].join(",");
  return `৳${n < 0 ? "-" : ""}${grouped}`;
}

export function formatNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 100_000).toFixed(1).replace(/\.0$/, "")}L`;
  if (abs >= 100_000) return `${Math.round(n / 100_000)}L`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function formatGrowth(percent: number): string {
  if (percent === 0) return "0%";
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}%`;
}

export function formatChartDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
