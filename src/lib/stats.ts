/**
 * Named statistics over employer-posted observations.
 *
 * This file MIRRORS the Python in uptop-crons scripts/frontier_public_export.py
 * (percentile / summarize). A vitest contract test compares its output against the
 * summaries.json the exporter shipped, so the two cannot drift silently.
 */
import type { Observation } from "@/data/release";

export interface Band {
  n: number;
  min: number;
  p25: number;
  p50: number;
  p75: number;
  max: number;
}

export interface DisplayRules {
  min_postings: number;
  min_employers: number;
}

export interface Summary {
  postings: number;
  employers: number;
  with_posted_range: number;
  disclosure_coverage_pct: number | null;
  usd_annual_eligible: number;
  eligible_employers: number;
  posted_low: Band | null;
  posted_high: Band | null;
  posted_midpoint: Band | null;
  company_balanced_midpoint_p50: number | null;
  top_employer: { company_id: string; postings: number; share_pct: number } | null;
  employer_hhi: number | null;
  meets_display_rule: boolean;
  posted_window: { min: string; max: string } | null;
}

const roundHalfUp = (x: number) => Math.floor(x + 0.5);

/** Linear interpolation between order statistics; round half up. null on empty. */
export function percentile(values: number[], q: number): number | null {
  if (values.length === 0) return null;
  const vals = [...values].sort((a, b) => a - b);
  if (vals.length === 1) return vals[0];
  const pos = (vals.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return vals[lo];
  const frac = pos - lo;
  return roundHalfUp(vals[lo] + (vals[hi] - vals[lo]) * frac);
}

function band(values: number[]): Band | null {
  if (values.length === 0) return null;
  return {
    n: values.length,
    min: Math.min(...values),
    p25: percentile(values, 0.25) as number,
    p50: percentile(values, 0.5) as number,
    p75: percentile(values, 0.75) as number,
    max: Math.max(...values),
  };
}

export const midpoint = (o: Observation): number => roundHalfUp((o.amount_low! + o.amount_high!) / 2);

export function summarize(rows: Observation[], rules: DisplayRules): Summary {
  const postings = rows.length;
  const employers = new Set(rows.map((r) => r.company_id)).size;
  const withRange = rows.filter((r) => r.amount_high !== null && r.amount_high !== undefined);
  const eligible = rows.filter((r) => r.usd_annual_eligible);
  const lows = eligible.map((r) => r.amount_low as number);
  const highs = eligible.map((r) => r.amount_high as number);
  const mids = eligible.map(midpoint);

  const perCompany = new Map<string, number[]>();
  const counts = new Map<string, number>();
  for (const r of eligible) {
    perCompany.set(r.company_id, [...(perCompany.get(r.company_id) ?? []), midpoint(r)]);
    counts.set(r.company_id, (counts.get(r.company_id) ?? 0) + 1);
  }
  const companyMedians = [...perCompany.values()].map((v) => percentile(v, 0.5) as number).sort((a, b) => a - b);

  let top: { company_id: string; postings: number } | null = null;
  for (const [cid, c] of counts) if (!top || c > top.postings) top = { company_id: cid, postings: c };
  const nEl = eligible.length;
  let hhi: number | null = null;
  if (nEl) {
    let acc = 0;
    for (const c of counts.values()) acc += (c / nEl) ** 2;
    hhi = roundHalfUp(acc * 10000);
  }
  const posted = rows.map((r) => r.observed_at).filter((d): d is string => !!d).sort();
  const eligibleEmployers = perCompany.size;

  return {
    postings,
    employers,
    with_posted_range: withRange.length,
    disclosure_coverage_pct: postings ? roundHalfUp((100 * withRange.length) / postings) : null,
    usd_annual_eligible: nEl,
    eligible_employers: eligibleEmployers,
    posted_low: band(lows),
    posted_high: band(highs),
    posted_midpoint: band(mids),
    company_balanced_midpoint_p50: companyMedians.length ? percentile(companyMedians, 0.5) : null,
    top_employer: top ? { ...top, share_pct: roundHalfUp((100 * top.postings) / nEl) } : null,
    employer_hhi: hhi,
    meets_display_rule: nEl >= rules.min_postings && eligibleEmployers >= rules.min_employers,
    posted_window: posted.length ? { min: posted[0], max: posted[posted.length - 1] } : null,
  };
}
