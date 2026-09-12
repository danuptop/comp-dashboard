/**
 * Up Top crypto compensation model — the values PayUp has shown since the 2026-02 redesign,
 * consolidated here as numbers (the page previously embedded them as display strings).
 * These are Up Top ASSUMPTIONS calibrated from placements and market work, not observed
 * postings. The retired src/data/compensation.ts carried an older, divergent copy.
 */
import type { CompModel, RoleCategory, Seniority } from "@/data/model-types";

const k = (n: number) => n * 1000;
const bands = (rows: [number, number, number][]): RoleCategory["bands"] => {
  const order: Seniority[] = ["JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"];
  return Object.fromEntries(rows.map(([min, mid, max], i) => [order[i], { min: k(min), mid: k(mid), max: k(max) }])) as RoleCategory["bands"];
};

export const CRYPTO_MODEL: CompModel = {
  id: "crypto",
  label: "Crypto",
  version: "2026.02",
  asOf: "2026-02-27",
  sourceNote:
    "Up Top model bands, North America baseline, base salary in USD before multipliers. Calibrated from Up Top placements and search work; not a posting sample.",
  categories: [
    { key: "ENGINEERING_GENERAL", label: "Engineering (general)", group: "TECH", component: "base_salary", bands: bands([[60, 75, 90], [100, 125, 150], [150, 185, 220], [180, 220, 260], [200, 240, 280]]) },
    { key: "PROTOCOL_INFRA", label: "Protocol / infra", group: "TECH", component: "base_salary", bands: bands([[70, 85, 100], [120, 145, 170], [170, 210, 250], [200, 250, 300], [220, 270, 320]]) },
    { key: "ZK_CRYPTOGRAPHY", label: "ZK / cryptography", group: "TECH", component: "base_salary", bands: bands([[90, 105, 120], [140, 170, 200], [200, 250, 300], [260, 320, 380], [280, 340, 400]]) },
    { key: "SECURITY_AUDIT", label: "Security / audit", group: "TECH", component: "base_salary", bands: bands([[70, 85, 100], [120, 145, 170], [170, 210, 250], [220, 270, 320], [250, 305, 360]]) },
    { key: "AI_CRYPTO", label: "AI × crypto", group: "TECH", component: "base_salary", bands: bands([[80, 95, 110], [130, 155, 180], [180, 220, 260], [230, 280, 330], [260, 310, 360]]) },
    { key: "BD_SALES_PARTNERSHIPS", label: "BD / sales / partnerships", group: "BD", component: "base_salary", bands: bands([[50, 65, 80], [90, 115, 140], [140, 170, 200], [160, 200, 240], [180, 230, 280]]) },
    { key: "SOCIAL_COMMUNITY", label: "Social / community", group: "BD", component: "base_salary", bands: bands([[40, 55, 70], [70, 95, 120], [120, 145, 170], [140, 170, 200], [150, 185, 220]]) },
    { key: "MARKETING_EXECUTIVE", label: "Marketing executive", group: "BD", component: "base_salary", bands: bands([[120, 145, 170], [150, 185, 220], [180, 220, 260], [190, 235, 280], [200, 250, 300]]) },
    { key: "PRODUCT", label: "Product", group: "CREATIVE", component: "base_salary", bands: bands([[70, 85, 100], [110, 135, 160], [160, 195, 230], [190, 235, 280], [200, 250, 300]]) },
    { key: "DESIGN", label: "Design", group: "CREATIVE", component: "base_salary", bands: bands([[55, 70, 85], [90, 115, 140], [140, 170, 200], [170, 210, 250], [190, 235, 280]]) },
    { key: "EXECUTIVE_TECH", label: "Executive — tech", group: "EXEC", component: "base_salary", bands: bands([[150, 175, 200], [180, 215, 250], [220, 260, 300], [260, 305, 350], [280, 340, 400]]) },
    { key: "EXECUTIVE_BUSINESS", label: "Executive — business", group: "EXEC", component: "base_salary", bands: bands([[120, 145, 170], [150, 185, 220], [200, 240, 280], [230, 275, 320], [250, 300, 350]]) },
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
    { key: "REMOTE_US", label: "Remote US", value: 0.9 },
    { key: "WESTERN_EUROPE", label: "Western Europe (UK, DE, FR)", value: 0.8 },
    { key: "DUBAI_UAE", label: "Dubai / UAE", value: 0.75, note: "0% income tax offset" },
    { key: "SINGAPORE", label: "Singapore", value: 0.72 },
    { key: "EASTERN_EUROPE", label: "Eastern Europe (PL, UA, RS)", value: 0.52 },
    { key: "REMOTE_GLOBAL", label: "Remote global", value: 0.52 },
    { key: "LATIN_AMERICA", label: "Latin America (AR, BR, MX)", value: 0.47 },
    { key: "SOUTH_SE_ASIA", label: "South / SE Asia", value: 0.42 },
  ],
  stage: [
    { key: "PRE_SEED", label: "Pre-seed", value: 0.75, note: "Lower base; 1.0–2.0% tokens for key hires" },
    { key: "SEED", label: "Seed", value: 0.82, note: "Lower base; 0.5–1.5% tokens for key hires" },
    { key: "SERIES_A", label: "Series A", value: 0.93, note: "Balanced; 0.25–0.75% token grants typical" },
    { key: "SERIES_B_PLUS", label: "Series B+", value: 1.0, note: "Market-rate base; smaller but liquid tokens" },
    { key: "POST_TGE", label: "Post-TGE / public", value: 1.1, note: "Premium for stability; tokens may be liquid" },
  ],
  scarcity: [
    { key: "ZK_PHD", label: "ZK / cryptography PhD", group: "TECH", multiplier: 1.4, description: "Advanced cryptography research background" },
    { key: "SECURITY_AUDIT", label: "Security audit background", group: "TECH", multiplier: 1.2, description: "Formal security auditing experience" },
    { key: "FORMAL_VERIFICATION", label: "Formal verification", group: "TECH", multiplier: 1.2, description: "Formal verification and mathematical proofs" },
    { key: "L1_L2_CORE", label: "Prior L1 / L2 core team", group: "TECH", multiplier: 1.17, description: "Core team experience at a major blockchain" },
    { key: "RUST_SOLANA", label: "Rust + Solana", group: "TECH", multiplier: 1.15, description: "Specialised Solana / Rust development" },
    { key: "REGULATORY", label: "Regulatory navigation", group: "BD", multiplier: 1.15, description: "Proven compliance and regulatory experience" },
    { key: "CATEGORY_NETWORK", label: "Category-defining network", group: "BD", multiplier: 1.15, description: "Exceptional industry network and relationships" },
    { key: "RWA_TRADFI", label: "RWA / TradFi bridge", group: "BD", multiplier: 1.12, description: "Real-world asset tokenisation experience" },
    { key: "INSTITUTIONAL_SALES", label: "Institutional sales", group: "BD", multiplier: 1.12, description: "Institutional sales background" },
  ],
  equity: {
    kind: "token",
    allocationBySeniority: { JUNIOR: [0.01, 0.05], MID: [0.05, 0.1], SENIOR: [0.1, 0.25], LEAD: [0.2, 0.4], EXECUTIVE: [0.5, 1.0] },
    discountStack: [
      { key: "PRE_TGE", label: "Pre-TGE discount", typical: 0.7, range: [0.6, 0.8], description: "Token has not launched; value is speculative" },
      { key: "VESTING", label: "Vesting discount", typical: 0.35, range: [0.3, 0.4], description: "Multi-year vest with cliff" },
      { key: "LIQUIDITY", label: "Liquidity discount", typical: 0.25, range: [0.2, 0.3], description: "Thin markets, lockups, sell pressure" },
    ],
    note:
      "Realistic token value = FDV × allocation × retained share after each discount. The pre-2026-09 page quoted the retained share as ~15.9%; multiplying the three retained shares (0.30 × 0.65 × 0.75) gives 14.6%, which is what the calculator now uses.",
  },
  resolverDefaults: { seniority: "MID", geoKey: "REMOTE_US", stageKey: "SERIES_A" },
};
