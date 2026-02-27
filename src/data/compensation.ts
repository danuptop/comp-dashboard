// ============================================================
// UP TOP SEARCH — PROTOCOL RANK COMPENSATION DATA
// Source: Live config from compensation.ts + contextResolver.ts
// ============================================================

export interface SalaryBand {
  role: string;
  roleLabel: string;
  seniority: string;
  min: number;
  midpoint: number;
  max: number;
}

export interface Multiplier {
  key: string;
  label: string;
  value: number;
  note?: string;
}

export interface ScarcityPremium {
  key: string;
  name: string;
  category: "TECH" | "BD";
  multiplier: number;
  description: string;
}

export interface TokenAllocation {
  seniority: string;
  minPct: number;
  maxPct: number;
}

export interface TokenDiscount {
  type: string;
  min: number;
  max: number;
  typical: number;
}

export interface TokenQualityTier {
  label: string;
  range: string;
  adjustment: number;
  color: string;
}

// ── ROLE CATEGORIES ──
export const ROLE_CATEGORIES = [
  { key: "ENGINEERING_GENERAL", label: "Engineering (General)" },
  { key: "PROTOCOL_INFRA", label: "Protocol / Infra" },
  { key: "ZK_CRYPTOGRAPHY", label: "ZK / Cryptography" },
  { key: "SECURITY_AUDIT", label: "Security / Audit" },
  { key: "AI_CRYPTO", label: "AI + Crypto" },
  { key: "BD_SALES_PARTNERSHIPS", label: "BD / Sales / Partnerships" },
  { key: "BIZ_OPS", label: "Biz Ops" },
  { key: "MARKETING_COMMUNITY", label: "Marketing / Community" },
  { key: "MARKETING_EXECUTIVE", label: "Marketing (Executive)" },
  { key: "PRODUCT", label: "Product" },
  { key: "DESIGN", label: "Design" },
  { key: "EXECUTIVE_TECH", label: "Executive (Tech)" },
] as const;

export const SENIORITY_LEVELS = ["JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"] as const;

// ── BASE SALARY MATRIX (60 rows) ──
export const SALARY_MATRIX: SalaryBand[] = [
  // ENGINEERING_GENERAL
  { role: "ENGINEERING_GENERAL", roleLabel: "Engineering (General)", seniority: "JUNIOR", min: 70000, midpoint: 85000, max: 100000 },
  { role: "ENGINEERING_GENERAL", roleLabel: "Engineering (General)", seniority: "MID", min: 120000, midpoint: 145000, max: 170000 },
  { role: "ENGINEERING_GENERAL", roleLabel: "Engineering (General)", seniority: "SENIOR", min: 172500, midpoint: 197500, max: 222500 },
  { role: "ENGINEERING_GENERAL", roleLabel: "Engineering (General)", seniority: "LEAD", min: 195000, midpoint: 220000, max: 245000 },
  { role: "ENGINEERING_GENERAL", roleLabel: "Engineering (General)", seniority: "EXECUTIVE", min: 195000, midpoint: 220000, max: 245000 },
  // PROTOCOL_INFRA
  { role: "PROTOCOL_INFRA", roleLabel: "Protocol / Infra", seniority: "JUNIOR", min: 70000, midpoint: 85000, max: 100000 },
  { role: "PROTOCOL_INFRA", roleLabel: "Protocol / Infra", seniority: "MID", min: 120000, midpoint: 145000, max: 170000 },
  { role: "PROTOCOL_INFRA", roleLabel: "Protocol / Infra", seniority: "SENIOR", min: 185000, midpoint: 210000, max: 235000 },
  { role: "PROTOCOL_INFRA", roleLabel: "Protocol / Infra", seniority: "LEAD", min: 225000, midpoint: 250000, max: 275000 },
  { role: "PROTOCOL_INFRA", roleLabel: "Protocol / Infra", seniority: "EXECUTIVE", min: 225000, midpoint: 250000, max: 275000 },
  // ZK_CRYPTOGRAPHY
  { role: "ZK_CRYPTOGRAPHY", roleLabel: "ZK / Cryptography", seniority: "JUNIOR", min: 90000, midpoint: 105000, max: 120000 },
  { role: "ZK_CRYPTOGRAPHY", roleLabel: "ZK / Cryptography", seniority: "MID", min: 145000, midpoint: 170000, max: 195000 },
  { role: "ZK_CRYPTOGRAPHY", roleLabel: "ZK / Cryptography", seniority: "SENIOR", min: 225000, midpoint: 250000, max: 275000 },
  { role: "ZK_CRYPTOGRAPHY", roleLabel: "ZK / Cryptography", seniority: "LEAD", min: 295000, midpoint: 320000, max: 345000 },
  { role: "ZK_CRYPTOGRAPHY", roleLabel: "ZK / Cryptography", seniority: "EXECUTIVE", min: 315000, midpoint: 340000, max: 365000 },
  // SECURITY_AUDIT
  { role: "SECURITY_AUDIT", roleLabel: "Security / Audit", seniority: "JUNIOR", min: 70000, midpoint: 85000, max: 100000 },
  { role: "SECURITY_AUDIT", roleLabel: "Security / Audit", seniority: "MID", min: 120000, midpoint: 145000, max: 170000 },
  { role: "SECURITY_AUDIT", roleLabel: "Security / Audit", seniority: "SENIOR", min: 185000, midpoint: 210000, max: 235000 },
  { role: "SECURITY_AUDIT", roleLabel: "Security / Audit", seniority: "LEAD", min: 245000, midpoint: 270000, max: 295000 },
  { role: "SECURITY_AUDIT", roleLabel: "Security / Audit", seniority: "EXECUTIVE", min: 280000, midpoint: 305000, max: 330000 },
  // AI_CRYPTO
  { role: "AI_CRYPTO", roleLabel: "AI + Crypto", seniority: "JUNIOR", min: 90000, midpoint: 105000, max: 120000 },
  { role: "AI_CRYPTO", roleLabel: "AI + Crypto", seniority: "MID", min: 145000, midpoint: 170000, max: 195000 },
  { role: "AI_CRYPTO", roleLabel: "AI + Crypto", seniority: "SENIOR", min: 225000, midpoint: 250000, max: 275000 },
  { role: "AI_CRYPTO", roleLabel: "AI + Crypto", seniority: "LEAD", min: 295000, midpoint: 320000, max: 345000 },
  { role: "AI_CRYPTO", roleLabel: "AI + Crypto", seniority: "EXECUTIVE", min: 315000, midpoint: 340000, max: 365000 },
  // BD_SALES_PARTNERSHIPS
  { role: "BD_SALES_PARTNERSHIPS", roleLabel: "BD / Sales / Partnerships", seniority: "JUNIOR", min: 80000, midpoint: 102500, max: 125000 },
  { role: "BD_SALES_PARTNERSHIPS", roleLabel: "BD / Sales / Partnerships", seniority: "MID", min: 125000, midpoint: 147500, max: 170000 },
  { role: "BD_SALES_PARTNERSHIPS", roleLabel: "BD / Sales / Partnerships", seniority: "SENIOR", min: 185000, midpoint: 210000, max: 235000 },
  { role: "BD_SALES_PARTNERSHIPS", roleLabel: "BD / Sales / Partnerships", seniority: "LEAD", min: 185000, midpoint: 210000, max: 235000 },
  { role: "BD_SALES_PARTNERSHIPS", roleLabel: "BD / Sales / Partnerships", seniority: "EXECUTIVE", min: 250000, midpoint: 275000, max: 300000 },
  // BIZ_OPS
  { role: "BIZ_OPS", roleLabel: "Biz Ops", seniority: "JUNIOR", min: 80000, midpoint: 100000, max: 120000 },
  { role: "BIZ_OPS", roleLabel: "Biz Ops", seniority: "MID", min: 125000, midpoint: 150000, max: 175000 },
  { role: "BIZ_OPS", roleLabel: "Biz Ops", seniority: "SENIOR", min: 190000, midpoint: 215000, max: 240000 },
  { role: "BIZ_OPS", roleLabel: "Biz Ops", seniority: "LEAD", min: 190000, midpoint: 215000, max: 240000 },
  { role: "BIZ_OPS", roleLabel: "Biz Ops", seniority: "EXECUTIVE", min: 260000, midpoint: 285000, max: 310000 },
  // MARKETING_COMMUNITY
  { role: "MARKETING_COMMUNITY", roleLabel: "Marketing / Community", seniority: "JUNIOR", min: 40000, midpoint: 55000, max: 70000 },
  { role: "MARKETING_COMMUNITY", roleLabel: "Marketing / Community", seniority: "MID", min: 70000, midpoint: 95000, max: 120000 },
  { role: "MARKETING_COMMUNITY", roleLabel: "Marketing / Community", seniority: "SENIOR", min: 120000, midpoint: 145000, max: 170000 },
  { role: "MARKETING_COMMUNITY", roleLabel: "Marketing / Community", seniority: "LEAD", min: 145000, midpoint: 170000, max: 195000 },
  { role: "MARKETING_COMMUNITY", roleLabel: "Marketing / Community", seniority: "EXECUTIVE", min: 160000, midpoint: 185000, max: 210000 },
  // MARKETING_EXECUTIVE
  { role: "MARKETING_EXECUTIVE", roleLabel: "Marketing (Executive)", seniority: "JUNIOR", min: 100000, midpoint: 125000, max: 150000 },
  { role: "MARKETING_EXECUTIVE", roleLabel: "Marketing (Executive)", seniority: "MID", min: 100000, midpoint: 125000, max: 150000 },
  { role: "MARKETING_EXECUTIVE", roleLabel: "Marketing (Executive)", seniority: "SENIOR", min: 150000, midpoint: 175000, max: 200000 },
  { role: "MARKETING_EXECUTIVE", roleLabel: "Marketing (Executive)", seniority: "LEAD", min: 200000, midpoint: 225000, max: 250000 },
  { role: "MARKETING_EXECUTIVE", roleLabel: "Marketing (Executive)", seniority: "EXECUTIVE", min: 250000, midpoint: 275000, max: 300000 },
  // PRODUCT
  { role: "PRODUCT", roleLabel: "Product", seniority: "JUNIOR", min: 70000, midpoint: 85000, max: 100000 },
  { role: "PRODUCT", roleLabel: "Product", seniority: "MID", min: 110000, midpoint: 135000, max: 160000 },
  { role: "PRODUCT", roleLabel: "Product", seniority: "SENIOR", min: 170000, midpoint: 195000, max: 220000 },
  { role: "PRODUCT", roleLabel: "Product", seniority: "LEAD", min: 210000, midpoint: 235000, max: 260000 },
  { role: "PRODUCT", roleLabel: "Product", seniority: "EXECUTIVE", min: 225000, midpoint: 250000, max: 275000 },
  // DESIGN
  { role: "DESIGN", roleLabel: "Design", seniority: "JUNIOR", min: 55000, midpoint: 70000, max: 85000 },
  { role: "DESIGN", roleLabel: "Design", seniority: "MID", min: 90000, midpoint: 115000, max: 140000 },
  { role: "DESIGN", roleLabel: "Design", seniority: "SENIOR", min: 145000, midpoint: 170000, max: 195000 },
  { role: "DESIGN", roleLabel: "Design", seniority: "LEAD", min: 185000, midpoint: 210000, max: 235000 },
  { role: "DESIGN", roleLabel: "Design", seniority: "EXECUTIVE", min: 185000, midpoint: 210000, max: 235000 },
  // EXECUTIVE_TECH
  { role: "EXECUTIVE_TECH", roleLabel: "Executive (Tech)", seniority: "JUNIOR", min: 160000, midpoint: 185000, max: 210000 },
  { role: "EXECUTIVE_TECH", roleLabel: "Executive (Tech)", seniority: "MID", min: 160000, midpoint: 185000, max: 210000 },
  { role: "EXECUTIVE_TECH", roleLabel: "Executive (Tech)", seniority: "SENIOR", min: 225000, midpoint: 250000, max: 275000 },
  { role: "EXECUTIVE_TECH", roleLabel: "Executive (Tech)", seniority: "LEAD", min: 280000, midpoint: 300000, max: 320000 },
  { role: "EXECUTIVE_TECH", roleLabel: "Executive (Tech)", seniority: "EXECUTIVE", min: 325000, midpoint: 350000, max: 375000 },
];

// ── LEVEL MULTIPLIERS (Classification → Comp) ──
export const LEVEL_MULTIPLIERS: Multiplier[] = [
  { key: "HARD_PASS", label: "Hard Pass", value: 0.6, note: "Score 0-49" },
  { key: "MID", label: "Mid", value: 0.75, note: "Score 50-65" },
  { key: "SOLID", label: "Solid", value: 0.9, note: "Score 66-80" },
  { key: "STRONG", label: "Strong", value: 1.0, note: "Score 81-89" },
  { key: "TOP_SHELF", label: "Top Shelf", value: 1.2, note: "Score 90-100" },
];

// ── GEO MULTIPLIERS ──
export const GEO_MULTIPLIERS: Multiplier[] = [
  { key: "NORTH_AMERICA", label: "North America (US/Canada)", value: 1.0 },
  { key: "REMOTE_US", label: "Remote (US-based)", value: 0.9 },
  { key: "WESTERN_EUROPE", label: "Western Europe (UK, DE, FR)", value: 0.8 },
  { key: "DUBAI_UAE", label: "Dubai / UAE", value: 0.75, note: "0% tax offset" },
  { key: "SINGAPORE", label: "Singapore", value: 0.72 },
  { key: "REMOTE_GLOBAL", label: "Remote (Global)", value: 0.52 },
  { key: "EASTERN_EUROPE", label: "Eastern Europe (PL, UA, RS)", value: 0.52 },
  { key: "LATIN_AMERICA", label: "Latin America (AR, BR, MX)", value: 0.47 },
  { key: "SOUTH_SOUTHEAST_ASIA", label: "South / Southeast Asia", value: 0.42 },
];

// ── STAGE MULTIPLIERS ──
export const STAGE_MULTIPLIERS: Multiplier[] = [
  { key: "PRE_SEED", label: "Pre-Seed", value: 0.75, note: "Lower cash; 1.0-2.0% tokens" },
  { key: "SEED", label: "Seed", value: 0.82, note: "Lower cash; 0.5-1.5% tokens" },
  { key: "SERIES_A", label: "Series A", value: 0.93, note: "Balanced; 0.25-0.75% tokens" },
  { key: "SERIES_B_PLUS", label: "Series B+", value: 1.0, note: "Market-rate base" },
  { key: "POST_TGE", label: "Post-TGE / Public", value: 1.1, note: "Premium for stability" },
];

// ── SCARCITY PREMIUMS ──
export const SCARCITY_PREMIUMS: ScarcityPremium[] = [
  { key: "ZK_PHD", name: "ZK/Cryptography PhD", category: "TECH", multiplier: 1.4, description: "Advanced cryptography research background" },
  { key: "SECURITY_AUDIT", name: "Security Audit Background", category: "TECH", multiplier: 1.2, description: "Formal security auditing experience" },
  { key: "FORMAL_VERIFICATION", name: "Formal Verification", category: "TECH", multiplier: 1.2, description: "Formal verification & mathematical proofs" },
  { key: "L1_L2_CORE", name: "Prior L1/L2 Core Team", category: "TECH", multiplier: 1.17, description: "Core team experience at major blockchain" },
  { key: "RUST_SOLANA", name: "Rust + Solana Expertise", category: "TECH", multiplier: 1.15, description: "Specialized Solana/Rust development" },
  { key: "CATEGORY_NETWORK", name: "Category-Defining Network", category: "BD", multiplier: 1.15, description: "Exceptional industry network" },
  { key: "REGULATORY_TRACK", name: "Regulatory Navigation", category: "BD", multiplier: 1.15, description: "Proven compliance & regulatory experience" },
  { key: "RWA_TRADFI", name: "RWA/TradFi Bridge", category: "BD", multiplier: 1.12, description: "Real-world asset tokenization experience" },
  { key: "INSTITUTIONAL_SALES", name: "Institutional Sales", category: "BD", multiplier: 1.12, description: "Top-tier institutional sales background" },
];

// ── TOKEN ALLOCATION BY SENIORITY ──
export const TOKEN_ALLOCATIONS: TokenAllocation[] = [
  { seniority: "JUNIOR", minPct: 0.01, maxPct: 0.05 },
  { seniority: "MID", minPct: 0.05, maxPct: 0.10 },
  { seniority: "SENIOR", minPct: 0.10, maxPct: 0.25 },
  { seniority: "LEAD", minPct: 0.20, maxPct: 0.40 },
  { seniority: "EXECUTIVE", minPct: 0.50, maxPct: 1.00 },
];

// ── TOKEN DISCOUNT MODEL (3-factor) ──
export const TOKEN_DISCOUNTS: TokenDiscount[] = [
  { type: "Pre-TGE Discount", min: 0.6, max: 0.8, typical: 0.7 },
  { type: "Vesting Discount", min: 0.3, max: 0.4, typical: 0.35 },
  { type: "Liquidity Discount", min: 0.2, max: 0.3, typical: 0.25 },
];

// ── TOKEN QUALITY TIERS ──
export const TOKEN_QUALITY_TIERS: TokenQualityTier[] = [
  { label: "PREMIUM", range: "4.5 - 5.0", adjustment: 1.0, color: "#10B981" },
  { label: "SOLID", range: "3.5 - 4.4", adjustment: 0.75, color: "#34D399" },
  { label: "SPECULATIVE", range: "2.5 - 3.4", adjustment: 0.50, color: "#F59E0B" },
  { label: "DISTRESSED", range: "1.5 - 2.4", adjustment: 0.25, color: "#F97316" },
  { label: "NEAR ZERO", range: "1.0 - 1.4", adjustment: 0.10, color: "#EF4444" },
];

export const TOKEN_QUALITY_DIMENSIONS = [
  { name: "Liquidity Depth", description: "DEX/CEX depth, daily volume relative to FDV" },
  { name: "Vesting Structure", description: "Cliff, linear vs back-loaded, acceleration triggers" },
  { name: "FDV Realism", description: "FDV vs actual revenue/TVL, comparable analysis" },
  { name: "Project Traction", description: "Active users, TVL growth, developer activity" },
  { name: "Regulatory Risk", description: "Securities classification, jurisdictional exposure" },
];

export const TOKEN_RED_FLAGS = [
  "Death spiral tokenomics — inflationary emissions with no burn/sink mechanism",
  "Team allocation >30% — combined team + insider exceeding 30% of total supply",
  "No lockup for insiders — team tokens liquid at TGE while employees vest 4yrs",
  "Reflexive revenue — protocol revenue depends on own token price",
  "Zombie chain — L1/L2 with <$1M TVL and declining, still issuing tokens",
];

// ── RESOLVER DEFAULTS ──
export const RESOLVER_DEFAULTS = {
  missingSeniority: "MID",
  missingYears: 3,
  missingGeo: "REMOTE_US",
  missingStage: "SERIES_A",
};

// Default FDV for token calcs
export const DEFAULT_FDV = 50_000_000;

// ── HELPERS ──
export function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

export function formatPct(n: number): string {
  return (n * 100).toFixed(0) + "%";
}
