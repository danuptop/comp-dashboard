/**
 * The shipped release must honour the public-data contract: checksums match, no private
 * evidence, eligibility flags are truthful, every row has a public source, and only
 * companies with a reviewed market cohort are present.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hydrate, MANIFEST, RELEASE_ID, type ColumnarPayload, type ReleaseManifest } from "@/data/release";

/**
 * A release ships from a complete batch, or from a partial one whose failed boards are all in
 * no market: those boards cannot change a number on this page. `no_failed_board_in_a_market`
 * is what separates that from an exporter --allow-partial override, which must not ship.
 */
function batchClearedGate(m: Pick<ReleaseManifest, "source" | "quality_checks">): boolean {
  const statusOf = (name: string) => m.quality_checks.find((c) => c.name === name)?.status;
  const { status, failed_boards } = m.source.batch;
  if (status === "complete") return failed_boards === 0 && statusOf("latest_batch_complete") === "pass";
  return (
    status === "partial" &&
    failed_boards > 0 &&
    statusOf("latest_batch_complete") === "warn" &&
    statusOf("no_failed_board_in_a_market") === "pass"
  );
}

const ROOT = join(__dirname, "..", "..", "..");
const REL = join(ROOT, "public", "data", "ai-comp", RELEASE_ID);
const obsBytes = readFileSync(join(REL, "observations.json"));
const observations = hydrate(JSON.parse(obsBytes.toString("utf8")) as ColumnarPayload);
const latest = JSON.parse(readFileSync(join(ROOT, "public", "data", "ai-comp", "latest.json"), "utf8"));
const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");

describe("release integrity", () => {
  it("observations.json matches the manifest checksum, size, and row count", () => {
    const f = MANIFEST.files["observations.json"];
    expect(sha256(obsBytes)).toBe(f.sha256);
    expect(obsBytes.length).toBe(f.bytes);
    expect(observations.length).toBe(f.rows);
  });
  it("latest.json points at the imported manifest", () => {
    expect(latest.release_id).toBe(RELEASE_ID);
    expect(latest.observations_sha256).toBe(MANIFEST.files["observations.json"].sha256);
    const manifestOnDisk = readFileSync(join(REL, "manifest.json"), "utf8");
    expect(JSON.parse(manifestOnDisk).files).toEqual(MANIFEST.files);
  });
  it("records no failing quality checks and no private evidence", () => {
    expect(MANIFEST.quality_checks.filter((c) => c.status === "fail")).toEqual([]);
    expect(MANIFEST.privacy.private_evidence_included).toBe(false);
  });
  it("ships from a batch that cleared the exporter's gate", () => {
    expect(batchClearedGate(MANIFEST)).toBe(true);
  });
});

describe("batch gate", () => {
  type Status = "pass" | "warn" | "fail";
  const release = (status: string, failed_boards: number, checks: Record<string, Status>) => ({
    source: { ...MANIFEST.source, batch: { ...MANIFEST.source.batch, status, failed_boards } },
    quality_checks: Object.entries(checks).map(([name, s]) => ({ name, status: s, detail: "" })),
  });

  it.each([
    ["a complete batch from before the market check existed", release("complete", 0, { latest_batch_complete: "pass" })],
    ["a complete batch", release("complete", 0, { latest_batch_complete: "pass", no_failed_board_in_a_market: "pass" })],
    ["a partial batch whose failed boards are all in no market", release("partial", 2, { latest_batch_complete: "warn", no_failed_board_in_a_market: "pass" })],
  ])("accepts %s", (_name, manifest) => {
    expect(batchClearedGate(manifest)).toBe(true);
  });

  it.each([
    ["an --allow-partial override past a failed market board", release("partial", 1, { latest_batch_complete: "warn", no_failed_board_in_a_market: "warn" })],
    ["a partial batch with no market check", release("partial", 1, { latest_batch_complete: "warn" })],
    ["a partial batch reporting no failed boards", release("partial", 0, { latest_batch_complete: "warn", no_failed_board_in_a_market: "pass" })],
    ["a batch whose report write failed", release("report_failed", 1, { latest_batch_complete: "warn", no_failed_board_in_a_market: "pass" })],
    ["a complete batch that lists failed boards", release("complete", 1, { latest_batch_complete: "pass" })],
  ])("rejects %s", (_name, manifest) => {
    expect(batchClearedGate(manifest)).toBe(false);
  });
});

describe("observation contract", () => {
  it("every row is an employer posting with a public https source", () => {
    for (const o of observations) {
      expect(o.evidence_kind).toBe("employer_posting");
      expect(o.component).toBe("base_salary");
      expect(o.source_url).toMatch(/^https:\/\//);
    }
  });
  it("eligible rows are USD, annual, ordered, inside the annual window, and full-time-eligible", () => {
    const eligible = observations.filter((o) => o.usd_annual_eligible);
    expect(eligible.length).toBe(MANIFEST.counts.usd_annual_eligible);
    for (const o of eligible) {
      expect(o.currency).toBe("USD");
      expect(o.pay_period).toBe("annual");
      expect(o.amount_low).not.toBeNull();
      expect(o.amount_low as number).toBeLessThanOrEqual(o.amount_high as number);
      expect(o.amount_low as number).toBeGreaterThanOrEqual(40_000);
      expect(o.amount_high as number).toBeLessThanOrEqual(2_000_000);
      expect(o.employment_type).toBe("unspecified");
      expect(o.exclusion_reasons).toEqual([]);
    }
  });
  it("non-eligible rows carry a reason and non-USD ranges are never converted", () => {
    for (const o of observations.filter((x) => !x.usd_annual_eligible)) expect(o.exclusion_reasons.length).toBeGreaterThan(0);
    const gbp = observations.filter((o) => o.currency === "GBP");
    expect(gbp.length).toBeGreaterThan(0);
    for (const o of gbp) expect(o.exclusion_reasons).toContain("non_usd");
  });
  it("only reviewed market cohorts are present, and every row belongs to at least one market", () => {
    const marketCohorts = new Set(Object.values(MANIFEST.markets).flatMap((m) => m.cohorts));
    for (const o of observations) {
      expect(o.markets.length).toBeGreaterThan(0);
      if (!o.markets.includes("ai_crypto") || o.markets.includes("ai") || o.markets.includes("crypto")) expect(marketCohorts.has(o.cohort)).toBe(true);
      expect(["fintech", "health", "defense_space", "energy_climate", "developer_tools", "consumer_other", "other", "unknown"]).not.toContain(o.cohort);
    }
  });
  it("sales and solutions families are flagged for possible on-target figures", () => {
    for (const o of observations) {
      if (o.role_family === "gtm_sales" || o.role_family === "solutions_engineer") expect(o.component_confidence).toBe("medium");
      else expect(o.component_confidence).toBe("high");
    }
  });
});
