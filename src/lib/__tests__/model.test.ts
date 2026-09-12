import { describe, expect, it } from "vitest";
import { AI_BASE_CATEGORIES, AI_MODEL, AI_TC_REFERENCES } from "@/data/ai-model";
import { CRYPTO_MODEL } from "@/data/crypto-model";
import { adjustedBase, levelTierForScore, retainedAfterDiscounts } from "@/lib/model";

describe("Up Top model arithmetic", () => {
  it("reproduces the calculator's worked example (crypto: senior protocol engineer, Singapore, Series A, Rust+Solana, score 85)", () => {
    const cat = CRYPTO_MODEL.categories.find((c) => c.key === "PROTOCOL_INFRA")!;
    const r = adjustedBase({
      band: cat.bands.SENIOR,
      score: 85,
      tiers: CRYPTO_MODEL.levelTiers,
      geo: CRYPTO_MODEL.geo.find((g) => g.key === "SINGAPORE")!,
      stage: CRYPTO_MODEL.stage.find((s) => s.key === "SERIES_A")!,
      scarcity: CRYPTO_MODEL.scarcity.filter((s) => s.key === "RUST_SOLANA"),
    });
    expect(r.baseMid).toBe(210_000);
    expect(r.tier.key).toBe("STRONG");
    // 210,000 × 1.00 × 0.72 × 0.93 × 1.15 = 161,708.4 (the old static page text said $161,762; the interactive calculator never did)
    expect(r.adjustedBase).toBe(161_708);
  });
  it("score tiers are contiguous and cover 0–100", () => {
    for (const model of [CRYPTO_MODEL, AI_MODEL]) {
      const tiers = [...model.levelTiers].sort((a, b) => a.minScore - b.minScore);
      expect(tiers[0].minScore).toBe(0);
      expect(tiers[tiers.length - 1].maxScore).toBe(100);
      for (let i = 1; i < tiers.length; i++) expect(tiers[i].minScore).toBe(tiers[i - 1].maxScore + 1);
      expect(levelTierForScore(90, model.levelTiers).key).toBe("TOP_SHELF");
      expect(levelTierForScore(49, model.levelTiers).key).toBe("HARD_PASS");
    }
  });
  it("bands are ordered min ≤ mid ≤ max in every model", () => {
    for (const model of [CRYPTO_MODEL, AI_MODEL]) for (const c of model.categories) for (const b of Object.values(c.bands)) {
      expect(b.min).toBeLessThanOrEqual(b.mid);
      expect(b.mid).toBeLessThanOrEqual(b.max);
    }
  });
  it("FDE is a total-compensation reference and is excluded from base-salary calculation", () => {
    expect(AI_TC_REFERENCES.map((c) => c.key)).toEqual(["FORWARD_DEPLOYED_ENGINEER"]);
    expect(AI_BASE_CATEGORIES.some((c) => c.key === "FORWARD_DEPLOYED_ENGINEER")).toBe(false);
    expect(AI_TC_REFERENCES[0].source?.url).toMatch(/getperspective/);
    expect(AI_TC_REFERENCES[0].bands.SENIOR.mid).toBe(385_000);
  });
  it("discount stacks are haircuts: crypto tokens retain 14.6%, AI equity retains 45.5%", () => {
    expect(retainedAfterDiscounts(CRYPTO_MODEL.equity.discountStack.map((d) => d.typical))).toBeCloseTo(0.14625, 5);
    expect(retainedAfterDiscounts(AI_MODEL.equity.discountStack.map((d) => d.typical))).toBeCloseTo(0.455, 5);
  });
});
