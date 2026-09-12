"use client";

import { useMemo, useState } from "react";
import { AI_MODEL } from "@/data/ai-model";
import { CRYPTO_MODEL } from "@/data/crypto-model";
import { SENIORITY_LABEL, SENIORITY_ORDER, type CompModel, type Seniority } from "@/data/model-types";
import { adjustedBase, levelTierForScore, retainedAfterDiscounts } from "@/lib/model";
import type { MarketId } from "@/lib/benchmark";
import type { Summary } from "@/lib/stats";
import { fmtMult, fmtPct, fmtRange, fmtUSD } from "@/lib/format";
import { Field } from "@/components/section";

function modelFor(market: MarketId): CompModel {
  return market === "ai" ? AI_MODEL : CRYPTO_MODEL;
}

export function Calculator({ market, fdePosted }: { market: MarketId; fdePosted: Summary | null }) {
  const model = modelFor(market);
  const base = useMemo(() => model.categories.filter((c) => c.component === "base_salary"), [model]);
  const refs = useMemo(() => model.categories.filter((c) => c.component === "total_compensation"), [model]);

  const [categoryKey, setCategoryKey] = useState(market === "ai_crypto" ? "AI_CRYPTO" : base[1]?.key ?? base[0].key);
  const [seniority, setSeniority] = useState<Seniority>("SENIOR");
  const [score, setScore] = useState(85);
  const [geoKey, setGeoKey] = useState(model.geo[0].key);
  const [stageKey, setStageKey] = useState("SERIES_A");
  const [scarcityKeys, setScarcityKeys] = useState<string[]>([]);

  // Remounted with key={market} by PayUpApp, so state resets when the market changes.

  const category = base.find((c) => c.key === categoryKey) ?? base[0];
  const geo = model.geo.find((g) => g.key === geoKey) ?? model.geo[0];
  const stage = model.stage.find((s) => s.key === stageKey) ?? model.stage[0];
  const scarcity = model.scarcity.filter((s) => scarcityKeys.includes(s.key));
  const result = adjustedBase({ band: category.bands[seniority], score, tiers: model.levelTiers, geo, stage, scarcity });
  const tier = levelTierForScore(score, model.levelTiers);
  const retained = retainedAfterDiscounts(model.equity.discountStack.map((d) => d.typical));

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Role category">
            <select className="select" value={category.key} onChange={(e) => setCategoryKey(e.target.value)}>
              {base.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Seniority">
            <select className="select" value={seniority} onChange={(e) => setSeniority(e.target.value as Seniority)}>
              {SENIORITY_ORDER.map((s) => <option key={s} value={s}>{SENIORITY_LABEL[s]}</option>)}
            </select>
          </Field>
          <Field label="Geography">
            <select className="select" value={geoKey} onChange={(e) => setGeoKey(e.target.value)}>
              {model.geo.map((g) => <option key={g.key} value={g.key}>{g.label} ({fmtMult(g.value)})</option>)}
            </select>
          </Field>
          <Field label="Company stage">
            <select className="select" value={stageKey} onChange={(e) => setStageKey(e.target.value)}>
              {model.stage.map((s) => <option key={s.key} value={s.key}>{s.label} ({fmtMult(s.value)})</option>)}
            </select>
          </Field>
          <div className="field sm:col-span-2">
            <span>
              Candidate score — {score} · {tier.label} ({fmtMult(tier.multiplier)}) <span className="badge badge-accent ml-2 normal-case tracking-normal">Up Top model assumption</span>
            </span>
            <input className="range" type="range" min={0} max={100} value={score} onChange={(e) => setScore(Number(e.target.value))} aria-label="Candidate score" />
            <div className="flex justify-between text-[0.7rem] text-subtle">
              {model.levelTiers.map((t) => (
                <span key={t.key}>{t.label} {t.minScore}–{t.maxScore}</span>
              ))}
            </div>
            <p className="text-xs normal-case tracking-normal text-subtle">
              The score multiplier is how Up Top prices candidate quality internally. It is not an observed market relationship and has not been validated against outcomes.
            </p>
          </div>
          <div className="field sm:col-span-2">
            <span>Scarcity premiums <span className="badge badge-accent ml-2 normal-case tracking-normal">Up Top model assumption</span></span>
            <div className="flex flex-wrap gap-2">
              {model.scarcity.map((s) => {
                const on = scarcityKeys.includes(s.key);
                return (
                  <button key={s.key} type="button" className="chip" aria-pressed={on} title={s.description} onClick={() => setScarcityKeys((prev) => (on ? prev.filter((k) => k !== s.key) : [...prev, s.key]))}>
                    {s.label} · {fmtMult(s.multiplier)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-l border-line pl-6" aria-live="polite">
          <p className="stat-label">Adjusted base (Up Top model)</p>
          <p className="stat-value num mt-2 text-4xl">{fmtUSD(result.adjustedBase)}</p>
          <p className="mt-2 text-sm text-muted">
            {category.label} · {SENIORITY_LABEL[seniority]} · {geo.label} · {stage.label}
          </p>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-subtle">Band midpoint</dt><dd className="num text-right">{fmtUSD(result.baseMid)}</dd>
            <dt className="text-subtle">Band range</dt><dd className="num text-right">{fmtRange(category.bands[seniority].min, category.bands[seniority].max, false)}</dd>
            <dt className="text-subtle">Level</dt><dd className="num text-right">{fmtMult(result.tier.multiplier)}</dd>
            <dt className="text-subtle">Geography</dt><dd className="num text-right">{fmtMult(result.geo)}</dd>
            <dt className="text-subtle">Stage</dt><dd className="num text-right">{fmtMult(result.stage)}</dd>
            <dt className="text-subtle">Scarcity</dt><dd className="num text-right">{fmtMult(result.scarcity)}</dd>
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-subtle">
            Adjusted base = band midpoint × level × geography × stage × scarcity. Base salary only. Do not apply these multipliers to a posted range above — postings already reflect the employer’s geography and stage.
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl">Band matrix — {model.label} model {model.version}</h3>
        <p className="mt-1 text-sm text-muted">{model.sourceNote} Click a row to load it into the calculator.</p>
        <div className="table-wrap mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                {SENIORITY_ORDER.map((s) => <th key={s} className="right">{SENIORITY_LABEL[s]}</th>)}
              </tr>
            </thead>
            <tbody>
              {base.map((c) => (
                <tr key={c.key} data-selected={c.key === category.key}>
                  <td>
                    <button type="button" className="rowlink" onClick={() => setCategoryKey(c.key)}>
                      <span className="text-fg">{c.label}</span>
                      <span className="block text-xs text-subtle">base salary</span>
                    </button>
                  </td>
                  {SENIORITY_ORDER.map((s) => (
                    <td key={s} className="right num">
                      <span className="text-fg">{fmtUSD(c.bands[s].mid, { compact: true })}</span>
                      <span className="block text-xs text-subtle">{fmtRange(c.bands[s].min, c.bands[s].max)}</span>
                    </td>
                  ))}
                </tr>
              ))}
              {refs.map((c) => (
                <tr key={c.key}>
                  <td>
                    <span className="text-fg">{c.label}</span>
                    <span className="badge badge-warn ml-2">total comp · reference only</span>
                    <span className="block text-xs text-subtle">
                      {c.source ? <a className="link-accent" href={c.source.url} target="_blank" rel="noopener noreferrer">{c.source.name}</a> : null}
                    </span>
                  </td>
                  {SENIORITY_ORDER.map((s) => (
                    <td key={s} className="right num text-muted">
                      {fmtUSD(c.bands[s].mid, { compact: true })}
                      <span className="block text-xs text-subtle">{fmtRange(c.bands[s].min, c.bands[s].max)}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {refs.length && refs[0].source ? (
          <div className="callout mt-4">
            <p className="text-fg">Forward deployed engineer: total compensation, not base.</p>
            <p className="mt-1">{refs[0].source.note}</p>
            {fdePosted && fdePosted.posted_midpoint ? (
              <p className="mt-2">
                Employer-posted FDE base ranges in this release: {fdePosted.usd_annual_eligible} postings from {fdePosted.eligible_employers} employers, median posted low{" "}
                <span className="num text-fg">{fmtUSD(fdePosted.posted_low?.p50, { compact: true })}</span>, median posted high{" "}
                <span className="num text-fg">{fmtUSD(fdePosted.posted_high?.p50, { compact: true })}</span>, median midpoint{" "}
                <span className="num text-fg">{fmtUSD(fdePosted.posted_midpoint.p50, { compact: true })}</span>. The survey figure and the posted base are different quantities and are never combined.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="font-display text-xl">{model.equity.kind === "token" ? "Token allocation by seniority" : "Equity allocation by seniority"}</h3>
          <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
            {SENIORITY_ORDER.map((s) => (
              <div key={s} className="flex justify-between py-2.5">
                <dt className="text-muted">{SENIORITY_LABEL[s]}</dt>
                <dd className="num">{model.equity.allocationBySeniority[s][0]}% – {model.equity.allocationBySeniority[s][1]}% of supply</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3 className="font-display text-xl">Discount stack <span className="badge badge-accent ml-2 align-middle">Up Top model assumption</span></h3>
          <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
            {model.equity.discountStack.map((d) => (
              <div key={d.key} className="flex justify-between gap-4 py-2.5">
                <dt>
                  <span className="text-muted">{d.label}</span>
                  <span className="block text-xs text-subtle">{d.description} · range {fmtPct(d.range[0] * 100)}–{fmtPct(d.range[1] * 100)}</span>
                </dt>
                <dd className="num whitespace-nowrap">{fmtPct(d.typical * 100)} haircut → {fmtPct((1 - d.typical) * 100)} kept</dd>
              </div>
            ))}
            <div className="flex justify-between py-2.5">
              <dt className="text-fg">Retained share of grant value</dt>
              <dd className="num text-fg">{fmtPct(retained * 100, 1)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-subtle">{model.equity.note}</p>
        </div>
      </div>
    </div>
  );
}
