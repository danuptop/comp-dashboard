/** Shared types for Up Top's compensation MODEL data (assumptions, not observations). */
export interface Band {
  min: number;
  mid: number;
  max: number;
}

export type Seniority = "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
export const SENIORITY_ORDER: Seniority[] = ["JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"];
export const SENIORITY_LABEL: Record<Seniority, string> = {
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead / Staff",
  EXECUTIVE: "Executive",
};

export type CompComponent = "base_salary" | "total_compensation";

export interface RoleCategory {
  key: string;
  label: string;
  group: "TECH" | "BD" | "CREATIVE" | "EXEC";
  /** What the numbers in `bands` measure. Only base_salary categories may enter the calculator. */
  component: CompComponent;
  bands: Record<Seniority, Band>;
  /** Provenance for reviewed reference figures (surveys), shown next to the numbers. */
  source?: { name: string; url: string; note: string };
}

export interface LevelTier {
  key: string;
  label: string;
  minScore: number;
  maxScore: number;
  multiplier: number;
  meaning: string;
}

export interface Multiplier {
  key: string;
  label: string;
  value: number;
  note?: string;
}

export interface ScarcityPremium {
  key: string;
  label: string;
  group: "TECH" | "BD";
  multiplier: number;
  description: string;
}

export interface DiscountStep {
  key: string;
  label: string;
  /** Discount as a fraction of value removed (0.35 = 35% haircut). */
  typical: number;
  range: [number, number];
  description: string;
}

export interface EquityModel {
  kind: "token" | "equity";
  allocationBySeniority: Record<Seniority, [number, number]>;
  discountStack: DiscountStep[];
  note: string;
}

export interface CompModel {
  id: "crypto" | "ai";
  label: string;
  version: string;
  asOf: string;
  sourceNote: string;
  categories: RoleCategory[];
  levelTiers: LevelTier[];
  geo: Multiplier[];
  stage: Multiplier[];
  scarcity: ScarcityPremium[];
  equity: EquityModel;
  resolverDefaults: { seniority: Seniority; geoKey: string; stageKey: string };
}
