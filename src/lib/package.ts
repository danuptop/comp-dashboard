/**
 * Package comparison arithmetic. Every component stays separate; the two totals are
 * first-year cash+vest and recurring annual. Risk adjustments are Up Top model
 * assumptions, reported on their own line and never folded into the headline totals.
 */
export interface PackageInput {
  label: string;
  base: number;
  /** Target bonus as a percentage of base (0–100). */
  targetBonusPct: number;
  /** Annual commission / OTE variable in dollars (0 for non-sales roles). */
  variableAnnual: number;
  signOn: number;
  /** Total equity grant value at the grant price, dollars. */
  equityGrantValue: number;
  equityVestYears: number;
  /** Cliff in months; a 12-month cliff still vests inside year one. */
  equityCliffMonths: number;
  /** Token grant: FDV in dollars × allocation percent of supply (0–100). */
  tokenFdv: number;
  tokenAllocationPct: number;
  tokenVestYears: number;
}

export interface RiskAssumptions {
  /** Haircuts, as fractions retained (e.g. vesting 0.35 discount → 0.65 retained). */
  equityRetained: number;
  tokenRetained: number;
  equityLabel: string;
  tokenLabel: string;
}

export interface PackageBreakdown {
  base: number;
  targetBonus: number;
  variableAnnual: number;
  signOn: number;
  equityAnnualVest: number;
  equityYearOneVest: number;
  tokenGrantValue: number;
  tokenAnnualVest: number;
  tokenYearOneVest: number;
  targetCashAnnual: number;
  firstYearTotal: number;
  recurringTotal: number;
  riskAdjustedEquityAnnual: number;
  riskAdjustedTokenAnnual: number;
  riskAdjustedRecurring: number;
}

const nz = (x: number) => (Number.isFinite(x) && x > 0 ? x : 0);

export function breakdown(p: PackageInput, risk: RiskAssumptions): PackageBreakdown {
  const base = nz(p.base);
  const targetBonus = Math.round(base * (nz(p.targetBonusPct) / 100));
  const variableAnnual = nz(p.variableAnnual);
  const signOn = nz(p.signOn);
  const vestYears = Math.max(1, nz(p.equityVestYears) || 4);
  const equityAnnualVest = Math.round(nz(p.equityGrantValue) / vestYears);
  const equityYearOneVest = nz(p.equityCliffMonths) > 12 ? 0 : equityAnnualVest;
  const tokenGrantValue = Math.round(nz(p.tokenFdv) * (nz(p.tokenAllocationPct) / 100));
  const tokenVestYears = Math.max(1, nz(p.tokenVestYears) || 4);
  const tokenAnnualVest = Math.round(tokenGrantValue / tokenVestYears);
  const tokenYearOneVest = tokenAnnualVest;
  const targetCashAnnual = base + targetBonus + variableAnnual;
  const firstYearTotal = targetCashAnnual + signOn + equityYearOneVest + tokenYearOneVest;
  const recurringTotal = targetCashAnnual + equityAnnualVest + tokenAnnualVest;
  const riskAdjustedEquityAnnual = Math.round(equityAnnualVest * risk.equityRetained);
  const riskAdjustedTokenAnnual = Math.round(tokenAnnualVest * risk.tokenRetained);
  return {
    base,
    targetBonus,
    variableAnnual,
    signOn,
    equityAnnualVest,
    equityYearOneVest,
    tokenGrantValue,
    tokenAnnualVest,
    tokenYearOneVest,
    targetCashAnnual,
    firstYearTotal,
    recurringTotal,
    riskAdjustedEquityAnnual,
    riskAdjustedTokenAnnual,
    riskAdjustedRecurring: targetCashAnnual + riskAdjustedEquityAnnual + riskAdjustedTokenAnnual,
  };
}
