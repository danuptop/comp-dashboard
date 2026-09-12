"use client";

import { useMemo, useState } from "react";
import { breakdown, type PackageInput, type RiskAssumptions } from "@/lib/package";
import { retainedAfterDiscounts } from "@/lib/model";
import { AI_MODEL } from "@/data/ai-model";
import { CRYPTO_MODEL } from "@/data/crypto-model";
import { fmtPct, fmtUSD } from "@/lib/format";
import type { MarketId } from "@/lib/benchmark";
import { Field } from "@/components/section";

const DEFAULT_A: PackageInput = {
  label: "Package A",
  base: 255_000,
  targetBonusPct: 10,
  variableAnnual: 0,
  signOn: 0,
  equityGrantValue: 400_000,
  equityVestYears: 4,
  equityCliffMonths: 12,
  tokenFdv: 0,
  tokenAllocationPct: 0,
  tokenVestYears: 4,
};
const DEFAULT_B: PackageInput = { ...DEFAULT_A, label: "Package B", base: 230_000, targetBonusPct: 0, signOn: 25_000, equityGrantValue: 600_000 };
const DEFAULT_CRYPTO_B: PackageInput = { ...DEFAULT_B, equityGrantValue: 0, tokenFdv: 50_000_000, tokenAllocationPct: 0.15 };

export function PackageComparison({ market }: { market: MarketId }) {
  const [a, setA] = useState<PackageInput>(DEFAULT_A);
  const [b, setB] = useState<PackageInput>(market === "ai" ? DEFAULT_B : DEFAULT_CRYPTO_B);
  const risk: RiskAssumptions = useMemo(
    () => ({
      equityRetained: retainedAfterDiscounts(AI_MODEL.equity.discountStack.map((d) => d.typical)),
      tokenRetained: retainedAfterDiscounts(CRYPTO_MODEL.equity.discountStack.map((d) => d.typical)),
      equityLabel: AI_MODEL.equity.discountStack.map((d) => `${d.label} ${fmtPct(d.typical * 100)}`).join(" · "),
      tokenLabel: CRYPTO_MODEL.equity.discountStack.map((d) => `${d.label} ${fmtPct(d.typical * 100)}`).join(" · "),
    }),
    [],
  );
  const ba = breakdown(a, risk);
  const bb = breakdown(b, risk);
  const showToken = market !== "ai" || a.tokenFdv > 0 || b.tokenFdv > 0;

  const rows: { label: string; a: number; b: number; note?: string; kind?: "total" | "assumption" }[] = [
    { label: "Base salary", a: ba.base, b: bb.base },
    { label: "Target bonus", a: ba.targetBonus, b: bb.targetBonus, note: "base × target %" },
    { label: "Commission / variable (annual)", a: ba.variableAnnual, b: bb.variableAnnual },
    { label: "Sign-on (year one only)", a: ba.signOn, b: bb.signOn },
    { label: "Equity vesting — year one", a: ba.equityYearOneVest, b: bb.equityYearOneVest, note: "grant ÷ vest years; zero if the cliff is longer than 12 months" },
    { label: "Equity vesting — recurring annual", a: ba.equityAnnualVest, b: bb.equityAnnualVest },
    ...(showToken
      ? [
          { label: "Token grant value (FDV × allocation)", a: ba.tokenGrantValue, b: bb.tokenGrantValue },
          { label: "Token vesting — annual", a: ba.tokenAnnualVest, b: bb.tokenAnnualVest },
        ]
      : []),
    { label: "Target cash (annual)", a: ba.targetCashAnnual, b: bb.targetCashAnnual, kind: "total" },
    { label: "First-year total", a: ba.firstYearTotal, b: bb.firstYearTotal, kind: "total", note: "cash + sign-on + year-one vesting at grant value" },
    { label: "Recurring annual total", a: ba.recurringTotal, b: bb.recurringTotal, kind: "total", note: "cash + annual vesting at grant value" },
    { label: "Risk-adjusted equity (annual)", a: ba.riskAdjustedEquityAnnual, b: bb.riskAdjustedEquityAnnual, kind: "assumption", note: `Up Top assumption: ${fmtPct(risk.equityRetained * 100, 1)} retained after ${risk.equityLabel}` },
    ...(showToken ? [{ label: "Risk-adjusted token (annual)", a: ba.riskAdjustedTokenAnnual, b: bb.riskAdjustedTokenAnnual, kind: "assumption" as const, note: `Up Top assumption: ${fmtPct(risk.tokenRetained * 100, 1)} retained after ${risk.tokenLabel}` }] : []),
    { label: "Risk-adjusted recurring total", a: ba.riskAdjustedRecurring, b: bb.riskAdjustedRecurring, kind: "assumption" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-2">
        {[
          { p: a, set: setA },
          { p: b, set: setB },
        ].map(({ p, set }, idx) => (
          <fieldset key={idx} className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-display text-xl">{p.label}</legend>
            <Num label="Base salary" value={p.base} onChange={(v) => set({ ...p, base: v })} />
            <Num label="Target bonus (% of base)" value={p.targetBonusPct} onChange={(v) => set({ ...p, targetBonusPct: v })} step={1} />
            <Num label="Commission / variable (annual)" value={p.variableAnnual} onChange={(v) => set({ ...p, variableAnnual: v })} />
            <Num label="Sign-on" value={p.signOn} onChange={(v) => set({ ...p, signOn: v })} />
            <Num label="Equity grant value (at grant)" value={p.equityGrantValue} onChange={(v) => set({ ...p, equityGrantValue: v })} />
            <div className="grid grid-cols-2 gap-4">
              <Num label="Vest years" value={p.equityVestYears} onChange={(v) => set({ ...p, equityVestYears: v })} step={1} />
              <Num label="Cliff (months)" value={p.equityCliffMonths} onChange={(v) => set({ ...p, equityCliffMonths: v })} step={1} />
            </div>
            <Num label="Token FDV (crypto)" value={p.tokenFdv} onChange={(v) => set({ ...p, tokenFdv: v })} />
            <div className="grid grid-cols-2 gap-4">
              <Num label="Token allocation (% supply)" value={p.tokenAllocationPct} onChange={(v) => set({ ...p, tokenAllocationPct: v })} step={0.01} />
              <Num label="Token vest years" value={p.tokenVestYears} onChange={(v) => set({ ...p, tokenVestYears: v })} step={1} />
            </div>
          </fieldset>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Component</th>
              <th className="right">Package A</th>
              <th className="right">Package B</th>
              <th className="right">B − A</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className={r.kind === "total" ? "bg-surface/60" : ""}>
                <td>
                  <span className={r.kind ? "text-fg" : ""}>{r.label}</span>
                  {r.kind === "assumption" ? <span className="badge badge-accent ml-2">model assumption</span> : null}
                  {r.note ? <span className="block text-xs text-subtle">{r.note}</span> : null}
                </td>
                <td className={`right num ${r.kind ? "text-fg" : ""}`}>{fmtUSD(r.a)}</td>
                <td className={`right num ${r.kind ? "text-fg" : ""}`}>{fmtUSD(r.b)}</td>
                <td className={`right num ${r.b - r.a > 0 ? "text-ok" : r.b - r.a < 0 ? "text-bad" : "text-subtle"}`}>{r.b - r.a === 0 ? "—" : `${r.b - r.a > 0 ? "+" : "−"}${fmtUSD(Math.abs(r.b - r.a))}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-subtle">
        Equity and token lines use grant-date value spread evenly over the vest; real vesting schedules, refreshes, strike prices, and tax are not modelled. Risk-adjusted lines apply Up Top’s
        discount stack as haircuts to retained value; they are assumptions, not market data, and sit below the totals on purpose.
      </p>
    </div>
  );
}

function Num({ label, value, onChange, step = 1000 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <Field label={label}>
      <input
        className="input num"
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </Field>
  );
}
