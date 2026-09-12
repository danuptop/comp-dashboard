import { describe, expect, it } from "vitest";
import type { Observation } from "@/data/release";
import { applyFilter, benchmark, DEFAULT_FILTER, examples, matchesGeo } from "@/lib/benchmark";

const RULES = { min_postings: 20, min_employers: 5 };

function obs(i: number, p: Partial<Observation>): Observation {
  return {
    id: `o${i}`,
    company_id: `ashby:c${i % 7}`,
    company: `Co ${i % 7}`,
    cohort: "applied_ai",
    markets: ["ai"],
    title: "Software Engineer",
    role_family: "software_engineer",
    role_family_confidence: "high",
    level: "senior",
    level_confidence: "high",
    employment_type: "unspecified",
    location_raw: "San Francisco, CA",
    country: "US",
    metro: "sf_bay_area",
    work_arrangement: "unspecified",
    geo_confidence: "high",
    evidence_kind: "employer_posting",
    component: "base_salary",
    component_confidence: "high",
    currency: "USD",
    pay_period: "annual",
    pay_period_confidence: "medium",
    amount_low: 150_000 + i * 1000,
    amount_high: 250_000 + i * 1000,
    range_swapped: false,
    source_text: "$150K - $250K",
    source_url: `https://jobs.example.com/${i}`,
    observed_at: `2026-0${1 + (i % 9)}-15`,
    fetched_at: "2026-09-08",
    equity_offered: true,
    usd_annual_eligible: true,
    exclusion_reasons: [],
    ...p,
  };
}

const ALL = [
  ...Array.from({ length: 30 }, (_, i) => obs(i, {})),
  ...Array.from({ length: 6 }, (_, i) => obs(100 + i, { level: "staff", work_arrangement: "remote", metro: "remote_unspecified", country: "unspecified" })),
  ...Array.from({ length: 4 }, (_, i) => obs(200 + i, { country: "GB", metro: "london", currency: "GBP", usd_annual_eligible: false, exclusion_reasons: ["non_usd"] })),
  obs(300, { markets: ["crypto"], cohort: "crypto" }),
];

describe("filters", () => {
  it("scope to the market and each dimension", () => {
    expect(applyFilter(ALL, { ...DEFAULT_FILTER, market: "ai" }).length).toBe(40);
    expect(applyFilter(ALL, { ...DEFAULT_FILTER, market: "crypto" }).length).toBe(1);
    expect(applyFilter(ALL, { ...DEFAULT_FILTER, market: "ai", level: "staff" }).length).toBe(6);
    expect(applyFilter(ALL, { ...DEFAULT_FILTER, market: "ai", geo: "metro:sf_bay_area" }).length).toBe(30);
    expect(applyFilter(ALL, { ...DEFAULT_FILTER, market: "ai", geo: "non_us" }).length).toBe(4);
    expect(applyFilter(ALL, { ...DEFAULT_FILTER, market: "ai", geo: "remote" }).length).toBe(6);
  });
  it("geo matching handles multi-metro postings and remote-optional", () => {
    const multi = obs(1, { metro: "multiple", metros: ["sf_bay_area", "nyc"] });
    expect(matchesGeo(multi, "metro:nyc")).toBe(true);
    expect(matchesGeo(multi, "metro:seattle")).toBe(false);
    expect(matchesGeo(obs(2, { work_arrangement: "remote_or_office" }), "remote")).toBe(true);
  });
});

describe("display rule and broadening", () => {
  it("passes when both thresholds are met", () => {
    const r = benchmark(ALL, { ...DEFAULT_FILTER, market: "ai" }, RULES);
    expect(r.strict.summary.meets_display_rule).toBe(true);
    expect(r.broadened).toBeNull();
  });
  it("broadens the narrowest dimension first and reports what was relaxed", () => {
    const r = benchmark(ALL, { ...DEFAULT_FILTER, market: "ai", level: "staff", work_arrangement: "remote" }, RULES);
    expect(r.strict.summary.meets_display_rule).toBe(false);
    expect(r.strict.summary.usd_annual_eligible).toBe(6);
    expect(r.broadened).not.toBeNull();
    expect(r.broadened!.relaxed).toEqual(["any work arrangement", "all levels"]);
    expect(r.broadened!.summary.meets_display_rule).toBe(true);
  });
  it("returns no broadened view when nothing reaches the rule", () => {
    const r = benchmark(ALL, { ...DEFAULT_FILTER, market: "crypto" }, RULES);
    expect(r.strict.summary.meets_display_rule).toBe(false);
    expect(r.broadened).toBeNull();
  });
  it("counts employers on postings with pay, not all postings", () => {
    const thin = Array.from({ length: 25 }, (_, i) => obs(i, { company_id: `ashby:c${i % 3}` }));
    const r = benchmark(thin, { ...DEFAULT_FILTER, market: "ai" }, RULES);
    expect(r.strict.summary.usd_annual_eligible).toBe(25);
    expect(r.strict.summary.eligible_employers).toBe(3);
    expect(r.strict.summary.meets_display_rule).toBe(false);
  });
});

describe("examples", () => {
  it("are eligible only, newest first, spread across employers", () => {
    const ex = examples(applyFilter(ALL, { ...DEFAULT_FILTER, market: "ai" }), 10);
    expect(ex.every((o) => o.usd_annual_eligible)).toBe(true);
    const perCompany = new Map<string, number>();
    for (const o of ex) perCompany.set(o.company_id, (perCompany.get(o.company_id) ?? 0) + 1);
    expect(Math.max(...perCompany.values())).toBeLessThanOrEqual(2);
    for (let i = 1; i < ex.length; i++) expect((ex[i - 1].observed_at ?? "") >= (ex[i].observed_at ?? "")).toBe(true);
  });
});
