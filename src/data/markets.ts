import type { MarketId } from "@/lib/benchmark";

/** Display copy for the market selector. Definitions mirror the release manifest; membership is per company and reviewed. */
export const MARKETS: { id: MarketId; label: string; short: string }[] = [
  { id: "ai", label: "AI", short: "AI-native companies — labs, model developers, infra & compute, silicon, applied AI, physical AI" },
  { id: "crypto", label: "Crypto", short: "Crypto-native companies — protocols, market makers, wallets, tokenisation" },
  { id: "ai_crypto", label: "AI × Crypto", short: "Companies explicitly building AI-native products on crypto rails" },
];

export const COHORT_LABEL: Record<string, string> = {
  frontier_lab: "Frontier labs",
  ai_model_developer: "AI model developers",
  ai_infrastructure_compute: "AI infrastructure & compute",
  ai_hardware_silicon: "AI hardware & silicon",
  applied_ai: "Applied-AI startups",
  physical_ai_robotics: "Physical AI & robotics",
  crypto: "Crypto",
};

export const ARRANGEMENT_LABEL: Record<string, string> = {
  remote: "Remote",
  remote_or_office: "Remote or office",
  hybrid: "Hybrid",
  onsite: "On-site",
  unspecified: "Not stated",
};

export const METRO_LABEL: Record<string, string> = {
  sf_bay_area: "SF Bay Area",
  nyc: "New York",
  seattle: "Seattle",
  los_angeles: "Los Angeles",
  austin: "Austin",
  boston: "Boston",
  dc: "Washington DC",
  chicago: "Chicago",
  denver: "Denver / Boulder",
  dallas: "Dallas",
  miami: "Miami",
  atlanta: "Atlanta",
  phoenix: "Phoenix",
  salt_lake: "Salt Lake City",
  portland: "Portland",
  san_diego: "San Diego",
  pittsburgh: "Pittsburgh",
  houston: "Houston",
  london: "London",
  toronto: "Toronto",
  multiple: "Multiple locations",
  us_unspecified: "US (city not stated)",
  north_america: "North America",
  remote_unspecified: "Remote (region not stated)",
  remote_global: "Remote global",
  unspecified: "Not stated",
};

export const COUNTRY_LABEL: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", FR: "France", DE: "Germany", NL: "Netherlands", IE: "Ireland",
  CH: "Switzerland", SE: "Sweden", ES: "Spain", PT: "Portugal", PL: "Poland", IL: "Israel", AE: "UAE", SG: "Singapore",
  IN: "India", JP: "Japan", KR: "South Korea", AU: "Australia", BR: "Brazil", MX: "Mexico", CO: "Colombia", HU: "Hungary",
  multiple: "Multiple countries", unspecified: "Not stated",
};
