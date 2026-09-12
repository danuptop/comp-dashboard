import { describe, expect, it } from "vitest";
import { breakdown, type PackageInput } from "@/lib/package";

const RISK = { equityRetained: 0.455, tokenRetained: 0.14625, equityLabel: "", tokenLabel: "" };
const base: PackageInput = {
  label: "A", base: 200_000, targetBonusPct: 10, variableAnnual: 0, signOn: 30_000,
  equityGrantValue: 400_000, equityVestYears: 4, equityCliffMonths: 12, tokenFdv: 0, tokenAllocationPct: 0, tokenVestYears: 4,
};

describe("package breakdown keeps components apart", () => {
  it("first-year includes sign-on and year-one vest; recurring excludes sign-on", () => {
    const b = breakdown(base, RISK);
    expect(b.targetBonus).toBe(20_000);
    expect(b.equityAnnualVest).toBe(100_000);
    expect(b.targetCashAnnual).toBe(220_000);
    expect(b.firstYearTotal).toBe(220_000 + 30_000 + 100_000);
    expect(b.recurringTotal).toBe(220_000 + 100_000);
  });
  it("a cliff longer than 12 months removes equity from year one only", () => {
    const b = breakdown({ ...base, equityCliffMonths: 18 }, RISK);
    expect(b.equityYearOneVest).toBe(0);
    expect(b.equityAnnualVest).toBe(100_000);
    expect(b.firstYearTotal).toBe(250_000);
    expect(b.recurringTotal).toBe(320_000);
  });
  it("token value is FDV × allocation, vested separately from equity", () => {
    const b = breakdown({ ...base, equityGrantValue: 0, tokenFdv: 50_000_000, tokenAllocationPct: 0.15 }, RISK);
    expect(b.tokenGrantValue).toBe(75_000);
    expect(b.tokenAnnualVest).toBe(18_750);
    expect(b.equityAnnualVest).toBe(0);
    expect(b.recurringTotal).toBe(220_000 + 18_750);
  });
  it("risk adjustment is a separate line and never changes the headline totals", () => {
    const b = breakdown(base, RISK);
    expect(b.riskAdjustedEquityAnnual).toBe(Math.round(100_000 * 0.455));
    expect(b.riskAdjustedRecurring).toBe(220_000 + 45_500);
    expect(b.recurringTotal).toBe(320_000);
  });
  it("commission is target cash, not equity", () => {
    const b = breakdown({ ...base, variableAnnual: 120_000 }, RISK);
    expect(b.targetCashAnnual).toBe(340_000);
  });
  it("negative or NaN inputs are treated as zero", () => {
    const b = breakdown({ ...base, signOn: -5, variableAnnual: Number.NaN }, RISK);
    expect(b.signOn).toBe(0);
    expect(b.variableAnnual).toBe(0);
  });
});
