/** Presentation-layer formatting. Data modules store numbers; nothing parses display strings. */

export function fmtUSD(n: number | null | undefined, opts: { compact?: boolean } = {}): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (opts.compact) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${Math.round(n)}`;
  }
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function fmtRange(low: number | null | undefined, high: number | null | undefined, compact = true): string {
  if (low === null || low === undefined || high === null || high === undefined) return "—";
  if (low === high) return fmtUSD(low, { compact });
  return `${fmtUSD(low, { compact })}–${fmtUSD(high, { compact })}`;
}

export function fmtMult(x: number): string {
  return `${x.toFixed(2)}×`;
}

export function fmtPct(x: number | null | undefined, digits = 0): string {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  return `${x.toFixed(digits)}%`;
}

export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-US");
}

/** ISO date (YYYY-MM-DD or full timestamp) → "Sep 8, 2026". */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
