/** Filtering and threshold logic for the AI benchmark view. Pure functions; UI-free. */
import type { Observation } from "@/data/release";
import { summarize, type DisplayRules, type Summary } from "@/lib/stats";

export type MarketId = "ai" | "crypto" | "ai_crypto";

export interface BenchmarkFilter {
  market: MarketId;
  role_family: string | "all";
  level: string | "all";
  /** country code, "US" metro id prefixed "metro:", "remote", "non_us", or "all" */
  geo: string;
  work_arrangement: string | "all";
  cohort: string | "all";
}

export const DEFAULT_FILTER: BenchmarkFilter = {
  market: "ai",
  role_family: "all",
  level: "all",
  geo: "all",
  work_arrangement: "all",
  cohort: "all",
};

export function matchesGeo(o: Observation, geo: string): boolean {
  if (geo === "all") return true;
  if (geo === "remote") return o.work_arrangement === "remote" || o.work_arrangement === "remote_or_office";
  if (geo === "non_us") return o.country !== "US" && o.country !== "unspecified";
  if (geo.startsWith("metro:")) {
    const m = geo.slice(6);
    return o.metro === m || (o.metros ?? []).includes(m);
  }
  return o.country === geo;
}

export function applyFilter(rows: Observation[], f: BenchmarkFilter): Observation[] {
  return rows.filter(
    (o) =>
      o.markets.includes(f.market) &&
      (f.role_family === "all" || o.role_family === f.role_family) &&
      (f.level === "all" || o.level === f.level) &&
      matchesGeo(o, f.geo) &&
      (f.work_arrangement === "all" || o.work_arrangement === f.work_arrangement) &&
      (f.cohort === "all" || o.cohort === f.cohort),
  );
}

/** Broadening ladder: relax the narrowest, least-load-bearing dimension first. */
export const BROADEN_STEPS: { key: keyof BenchmarkFilter; label: string }[] = [
  { key: "work_arrangement", label: "any work arrangement" },
  { key: "level", label: "all levels" },
  { key: "geo", label: "all geographies" },
  { key: "cohort", label: "all company cohorts" },
  { key: "role_family", label: "all role families" },
];

export interface BenchmarkResult {
  strict: { filter: BenchmarkFilter; rows: Observation[]; summary: Summary };
  /** First broadened view that meets the display rule; null if strict already does or nothing does. */
  broadened: { filter: BenchmarkFilter; rows: Observation[]; summary: Summary; relaxed: string[] } | null;
}

export function benchmark(all: Observation[], f: BenchmarkFilter, rules: DisplayRules): BenchmarkResult {
  const strictRows = applyFilter(all, f);
  const strict = { filter: f, rows: strictRows, summary: summarize(strictRows, rules) };
  if (strict.summary.meets_display_rule) return { strict, broadened: null };
  let current = { ...f };
  const relaxed: string[] = [];
  for (const step of BROADEN_STEPS) {
    if (current[step.key] === "all") continue;
    current = { ...current, [step.key]: "all" };
    relaxed.push(step.label);
    const rows = applyFilter(all, current);
    const summary = summarize(rows, rules);
    if (summary.meets_display_rule) return { strict, broadened: { filter: current, rows, summary, relaxed: [...relaxed] } };
  }
  return { strict, broadened: null };
}

/** Distinct option values present in a market, ordered by frequency (for filter menus). */
export function optionsFor(rows: Observation[], market: MarketId, key: "role_family" | "level" | "cohort" | "work_arrangement" | "metro" | "country") {
  const counts = new Map<string, number>();
  for (const o of rows) {
    if (!o.markets.includes(market)) continue;
    const v = o[key];
    if (typeof v !== "string") continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value, n]) => ({ value, n }));
}

/** Source-linked examples: eligible rows first, spread across employers, newest posting first. */
export function examples(rows: Observation[], limit = 12): Observation[] {
  const eligible = rows.filter((r) => r.usd_annual_eligible).sort((a, b) => (b.observed_at ?? "").localeCompare(a.observed_at ?? ""));
  const out: Observation[] = [];
  const seen = new Map<string, number>();
  for (const r of eligible) {
    const k = seen.get(r.company_id) ?? 0;
    if (k >= 2) continue;
    seen.set(r.company_id, k + 1);
    out.push(r);
    if (out.length >= limit) break;
  }
  if (out.length < limit) for (const r of eligible) if (!out.includes(r)) { out.push(r); if (out.length >= limit) break; }
  return out;
}

export interface CompanyRow {
  company_id: string;
  company: string;
  cohort: string;
  open_postings: number;
  usd_annual_eligible: number;
  share_of_market_eligible_pct: number;
  posted_low_p50: number | null;
  posted_high_p50: number | null;
  posted_midpoint_p50: number | null;
  top_role_families: string[];
}

import { percentile, midpoint } from "@/lib/stats";

/** Per-company rollup (mirrors the exporter's summaries.companies list). */
export function companyRows(rows: Observation[]): CompanyRow[] {
  const byCompany = new Map<string, Observation[]>();
  for (const o of rows) byCompany.set(o.company_id, [...(byCompany.get(o.company_id) ?? []), o]);
  const marketEligible = rows.filter((o) => o.usd_annual_eligible).length;
  const out: CompanyRow[] = [];
  const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0); // code-point order, same as the exporter
  for (const [cid, crows] of [...byCompany.entries()].sort((a, b) => cmp(a[0], b[0]))) {
    const cel = crows.filter((o) => o.usd_annual_eligible);
    const fam = new Map<string, number>();
    for (const o of crows) fam.set(o.role_family, (fam.get(o.role_family) ?? 0) + 1);
    out.push({
      company_id: cid,
      company: crows[0].company,
      cohort: crows[0].cohort,
      open_postings: crows.length,
      usd_annual_eligible: cel.length,
      share_of_market_eligible_pct: marketEligible && cel.length ? Math.floor((100 * cel.length) / marketEligible + 0.5) : 0,
      posted_low_p50: percentile(cel.map((o) => o.amount_low as number), 0.5),
      posted_high_p50: percentile(cel.map((o) => o.amount_high as number), 0.5),
      posted_midpoint_p50: percentile(cel.map(midpoint), 0.5),
      top_role_families: [...fam.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => f),
    });
  }
  return out.sort((a, b) => b.usd_annual_eligible - a.usd_annual_eligible || cmp(a.company, b.company));
}
