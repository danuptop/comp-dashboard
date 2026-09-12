/**
 * Up Top compensation MODEL — assumptions, not observations. The formula and every
 * multiplier here are labelled as such in the UI. Numbers live in src/data/*-model.ts;
 * this file only does arithmetic on them.
 */
import type { Band, LevelTier, Multiplier, ScarcityPremium } from "@/data/model-types";

export function levelTierForScore(score: number, tiers: LevelTier[]): LevelTier {
  return tiers.find((t) => score >= t.minScore && score <= t.maxScore) ?? tiers[0];
}

export interface CalcInput {
  band: Band;
  score: number;
  tiers: LevelTier[];
  geo: Multiplier;
  stage: Multiplier;
  scarcity: ScarcityPremium[];
}

export interface CalcResult {
  baseMid: number;
  tier: LevelTier;
  geo: number;
  stage: number;
  scarcity: number;
  adjustedBase: number;
}

/** Adjusted Base = Base Band midpoint × level × geo × stage × Π scarcity (Up Top model). */
export function adjustedBase(i: CalcInput): CalcResult {
  const tier = levelTierForScore(i.score, i.tiers);
  const scarcity = i.scarcity.reduce((acc, s) => acc * s.multiplier, 1);
  const result = i.band.mid * tier.multiplier * i.geo.value * i.stage.value * scarcity;
  return { baseMid: i.band.mid, tier, geo: i.geo.value, stage: i.stage.value, scarcity, adjustedBase: Math.round(result) };
}

/** Retained share after a stack of haircuts expressed as discount fractions (0.7 discount → 0.3 retained). */
export function retainedAfterDiscounts(discounts: number[]): number {
  return discounts.reduce((acc, d) => acc * (1 - d), 1);
}
