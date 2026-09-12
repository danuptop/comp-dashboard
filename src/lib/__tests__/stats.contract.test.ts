/**
 * The TypeScript statistics must reproduce the exporter's summaries.json exactly for the
 * shipped release — same percentiles, same balanced medians, same concentration figures —
 * so the UI can never show a number the release did not.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hydrate, MANIFEST, RELEASE_ID, type ColumnarPayload } from "@/data/release";
import { percentile, summarize, type Summary } from "@/lib/stats";
import { applyFilter, companyRows, DEFAULT_FILTER, type MarketId } from "@/lib/benchmark";

const REL = join(__dirname, "..", "..", "..", "public", "data", "ai-comp", RELEASE_ID);
const observations = hydrate(JSON.parse(readFileSync(join(REL, "observations.json"), "utf8")) as ColumnarPayload);
const summaries = JSON.parse(readFileSync(join(REL, "summaries.json"), "utf8")) as {
  markets: Record<string, { overall: Summary; by_role_family: Record<string, Summary>; by_level: Record<string, Summary>; by_cohort: Record<string, Summary>; companies: unknown[] }>;
};
const rules = MANIFEST.display_rules;

describe("percentile", () => {
  it("interpolates linearly and rounds half up, matching the exporter", () => {
    expect(percentile([], 0.5)).toBeNull();
    expect(percentile([7], 0.5)).toBe(7);
    expect(percentile([100, 201], 0.5)).toBe(151);
    expect(percentile([10, 20, 30, 40], 0.25)).toBe(18);
    expect(percentile([10, 20, 30, 40], 0.75)).toBe(33);
  });
});

describe.each(["ai", "crypto", "ai_crypto"] as MarketId[])("market %s reproduces summaries.json", (market) => {
  const rows = observations.filter((o) => o.markets.includes(market));
  const expected = summaries.markets[market];
  it("overall", () => {
    expect(summarize(rows, rules)).toEqual(expected.overall);
  });
  it("by role family, level, and cohort", () => {
    for (const [fam, exp] of Object.entries(expected.by_role_family)) expect(summarize(rows.filter((o) => o.role_family === fam), rules)).toEqual(exp);
    for (const [lv, exp] of Object.entries(expected.by_level)) expect(summarize(rows.filter((o) => o.level === lv), rules)).toEqual(exp);
    for (const [c, exp] of Object.entries(expected.by_cohort)) expect(summarize(rows.filter((o) => o.cohort === c), rules)).toEqual(exp);
  });
  it("company rollups", () => {
    expect(companyRows(applyFilter(observations, { ...DEFAULT_FILTER, market }))).toEqual(expected.companies);
  });
});

describe("display rule on the shipped AI market", () => {
  it("forward deployed engineer clears the rule; the crypto market does not", () => {
    const fde = summaries.markets.ai.by_role_family.forward_deployed_engineer;
    expect(fde.meets_display_rule).toBe(true);
    expect(fde.usd_annual_eligible).toBeGreaterThanOrEqual(rules.min_postings);
    expect(summaries.markets.crypto.overall.meets_display_rule).toBe(false);
  });
});
