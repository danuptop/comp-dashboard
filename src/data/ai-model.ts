/**
 * Up Top AI compensation model — reference assumptions from uptop-crons
 * config/ai-comp-knowledge.json v1.1.0 (2026-09-11). Base-salary categories feed the
 * calculator. FORWARD_DEPLOYED_ENGINEER is a TOTAL-COMPENSATION survey reference
 * (Perspective AI, 2026) and is shown as such — never run through the base formula.
 * Observed posted ranges live in the release data, not here.
 */
import type { CompModel, RoleCategory, Seniority } from "@/data/model-types";

const k = (n: number) => n * 1000;
const bands = (rows: [number, number, number][]): RoleCategory["bands"] => {
  const order: Seniority[] = ["JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"];
  return Object.fromEntries(rows.map(([min, mid, max], i) => [order[i], { min: k(min), mid: k(mid), max: k(max) }])) as RoleCategory["bands"];
};

export const PERSPECTIVE_FDE_SOURCE = {
  name: "Perspective AI — State of Forward Deployed Engineering 2026",
  url: "https://s.getperspective.ai/blog/state-of-forward-deployed-engineering-2026-survey-report-1500-fdes",
  note:
    "Survey of 1,500 FDEs; compensation reported as median annual cash + target bonus + estimated equity at the last preferred-share price (US). The senior $385K is the survey's frontier-lab figure after its own 40% tender-equity discount; the headline is $485K. Total compensation, not base.",
};

export const AI_MODEL: CompModel = {
  id: "ai",
  label: "AI",
  version: "1.1.0",
  asOf: "2026-09-11",
  sourceNote:
    "Up Top reference bands (USD, North America baseline) assembled from levels.fyi, Carta's 2026 AI compensation analysis, and the Perspective AI FDE survey. Assumptions — compare with the posted ranges above.",
  categories: [
    { key: "ML_RESEARCH_ENGINEER", label: "ML research engineer", group: "TECH", component: "base_salary", bands: bands([[110, 130, 150], [160, 190, 220], [220, 242.5, 270], [280, 320, 360], [340, 400, 450]]) },
    { key: "AI_INFRA_GPU_ENGINEER", label: "AI infra / GPU engineer", group: "TECH", component: "base_salary", bands: bands([[115, 135, 155], [150, 185, 220], [200, 235, 270], [260, 300, 340], [320, 370, 420]]) },
    { key: "APPLIED_AI_ENGINEER", label: "Applied AI engineer", group: "TECH", component: "base_salary", bands: bands([[150, 150, 150], [180, 202.5, 225], [225, 255, 255], [260, 290, 320], [300, 340, 380]]) },
    { key: "MLOPS_ENGINEER", label: "MLOps engineer", group: "TECH", component: "base_salary", bands: bands([[110, 130, 150], [150, 170, 190], [180, 200, 220], [210, 235, 260], [240, 270, 300]]) },
    { key: "PRODUCT", label: "Product", group: "CREATIVE", component: "base_salary", bands: bands([[80, 95, 110], [120, 145, 170], [170, 205, 240], [200, 245, 290], [210, 260, 310]]) },
    { key: "BD_SALES_PARTNERSHIPS", label: "BD / sales / partnerships", group: "BD", component: "base_salary", bands: bands([[55, 70, 85], [95, 120, 145], [145, 175, 205], [165, 205, 245], [185, 235, 285]]) },
    { key: "MARKETING_EXECUTIVE", label: "Marketing executive", group: "BD", component: "base_salary", bands: bands([[125, 150, 175], [155, 190, 225], [185, 225, 265], [195, 240, 285], [205, 255, 305]]) },
    {
      key: "FORWARD_DEPLOYED_ENGINEER",
      label: "Forward deployed engineer",
      group: "TECH",
      component: "total_compensation",
      bands: bands([[170, 200, 230], [250, 300, 350], [340, 385, 430], [550, 610, 670], [1000, 1100, 1200]]),
      source: PERSPECTIVE_FDE_SOURCE,
    },
  ],
  levelTiers: [
    { key: "HARD_PASS", label: "Hard pass", minScore: 0, maxScore: 49, multiplier: 0.6, meaning: "Not viable — significant gaps" },
    { key: "MID", label: "Mid", minScore: 50, maxScore: 65, multiplier: 0.75, meaning: "Below market — needs development or niche fit" },
    { key: "SOLID", label: "Solid", minScore: 66, maxScore: 80, multiplier: 0.9, meaning: "Competent — slight discount, room to grow" },
    { key: "STRONG", label: "Strong", minScore: 81, maxScore: 89, multiplier: 1.0, meaning: "Market rate — no discount" },
    { key: "TOP_SHELF", label: "Top shelf", minScore: 90, maxScore: 100, multiplier: 1.2, meaning: "Top of market — competing offers expected" },
  ],
  geo: [
    { key: "NORTH_AMERICA", label: "North America (US / Canada)", value: 1.0 },
    { key: "REMOTE_US", label: "Remote US", value: 0.92 },
    { key: "CANADA_AI_HUBS", label: "Canada (Toronto / Montreal AI hubs)", value: 0.85 },
    { key: "WESTERN_EUROPE", label: "Western Europe (UK, DE, FR)", value: 0.82 },
    { key: "SINGAPORE", label: "Singapore", value: 0.75 },
    { key: "EASTERN_EUROPE", label: "Eastern Europe (PL, UA, RS)", value: 0.55 },
    { key: "REMOTE_GLOBAL", label: "Remote global", value: 0.55 },
    { key: "LATIN_AMERICA", label: "Latin America (AR, BR, MX)", value: 0.5 },
    { key: "SOUTH_SE_ASIA", label: "South / SE Asia", value: 0.45 },
  ],
  stage: [
    { key: "PRE_SEED", label: "Pre-seed", value: 0.78, note: "0.75–2.00% equity for key hires" },
    { key: "SEED", label: "Seed", value: 0.85, note: "0.10–3.00% equity (applied AI eng range)" },
    { key: "SERIES_A", label: "Series A", value: 0.95, note: "0.146–0.25% typical (top-decile AI-native)" },
    { key: "SERIES_B_PLUS", label: "Series B+", value: 1.0, note: "Smaller grant, closer to liquidity" },
    { key: "PUBLIC_LATE", label: "Public / late-stage", value: 1.05, note: "RSU refreshers; most liquid" },
  ],
  scarcity: [
    { key: "CUDA_KERNEL", label: "CUDA / kernel engineering", group: "TECH", multiplier: 1.3, description: "Low-level GPU performance work" },
    { key: "INFERENCE_OPT", label: "Inference optimisation", group: "TECH", multiplier: 1.25, description: "Serving cost and latency at scale" },
    { key: "FDE_DUAL", label: "FDE dual skillset", group: "TECH", multiplier: 1.2, description: "Engineering plus customer deployment" },
    { key: "DISTRIBUTED_TRAINING", label: "Distributed training at scale", group: "TECH", multiplier: 1.2, description: "Multi-node training systems" },
    { key: "RLHF_POST_TRAINING", label: "RLHF / post-training", group: "TECH", multiplier: 1.15, description: "Alignment and post-training pipelines" },
    { key: "EVALS", label: "Eval harness / benchmark design", group: "TECH", multiplier: 1.12, description: "Measurement and evaluation systems" },
    { key: "ENTERPRISE_DEPLOYMENT", label: "Enterprise AI deployment", group: "BD", multiplier: 1.15, description: "Shipped AI into large organisations" },
    { key: "EX_LAB", label: "Ex-lab pedigree", group: "BD", multiplier: 1.2, description: "OpenAI / DeepMind / Anthropic / FAIR alumni" },
  ],
  equity: {
    kind: "equity",
    allocationBySeniority: { JUNIOR: [0.01, 0.05], MID: [0.05, 0.146], SENIOR: [0.1, 0.25], LEAD: [0.2, 0.4], EXECUTIVE: [0.5, 1.0] },
    discountStack: [
      { key: "VESTING", label: "Vesting discount", typical: 0.35, range: [0.3, 0.4], description: "4-year vest with 1-year cliff; illiquid during lockup" },
      { key: "LIQUIDITY", label: "Liquidity discount", typical: 0.3, range: [0.2, 0.4], description: "Private equity — infrequent tenders; 409A can lag" },
    ],
    note: "RSUs / options, not tokens. Retained share after the two haircuts is 0.65 × 0.70 = 45.5%, consistent with the ~45–65% range in the source file.",
  },
  resolverDefaults: { seniority: "MID", geoKey: "REMOTE_US", stageKey: "SERIES_A" },
};

export const AI_BASE_CATEGORIES = AI_MODEL.categories.filter((c) => c.component === "base_salary");
export const AI_TC_REFERENCES = AI_MODEL.categories.filter((c) => c.component === "total_compensation");
