"use client";

import { useMemo, useState } from "react";
import type { LoadState, Observation, ReleaseManifest } from "@/data/release";
import { COHORT_LABEL } from "@/data/markets";
import { applyFilter, companyRows, DEFAULT_FILTER, optionsFor, type MarketId } from "@/lib/benchmark";
import { summarize } from "@/lib/stats";
import { fmtDate, fmtInt, fmtRange, fmtUSD } from "@/lib/format";
import { Field } from "@/components/section";

export function CompanyComparison({ market, observations, state, manifest }: {
  market: MarketId;
  observations: Observation[];
  state: LoadState;
  manifest: ReleaseManifest;
}) {
  const [family, setFamily] = useState<string>("all");
  const [minPostings, setMinPostings] = useState(3);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const families = useMemo(() => optionsFor(observations, market, "role_family"), [observations, market]);
  const rows = useMemo(() => applyFilter(observations, { ...DEFAULT_FILTER, market, role_family: family }), [observations, market, family]);
  const overall = useMemo(() => summarize(rows, manifest.display_rules), [rows, manifest.display_rules]);
  const companies = useMemo(() => companyRows(rows).filter((c) => c.usd_annual_eligible >= minPostings), [rows, minPostings]);
  const visible = showAll ? companies : companies.slice(0, 20);
  const scale: [number, number] = useMemo(() => {
    const lows = companies.map((c) => c.posted_low_p50).filter((v): v is number => v !== null);
    const highs = companies.map((c) => c.posted_high_p50).filter((v): v is number => v !== null);
    return lows.length ? [Math.min(...lows), Math.max(...highs)] : [0, 1];
  }, [companies]);
  const selectedRows = useMemo(
    () => (selected ? rows.filter((o) => o.company_id === selected && o.usd_annual_eligible).sort((a, b) => (b.amount_high ?? 0) - (a.amount_high ?? 0)).slice(0, 8) : []),
    [rows, selected],
  );

  if (state.status !== "ready") {
    return <p className="text-sm text-muted">{state.status === "loading" ? "Waiting for the verified release…" : "Company view withheld — the release failed its integrity check."}</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Role family">
          <select className="select" value={family} onChange={(e) => { setFamily(e.target.value); setSelected(null); }}>
            <option value="all">All role families</option>
            {families.map((f) => (
              <option key={f.value} value={f.value}>{manifest.role_families[f.value] ?? f.value} ({f.n})</option>
            ))}
          </select>
        </Field>
        <Field label="Minimum postings with pay">
          <select className="select" value={minPostings} onChange={(e) => setMinPostings(Number(e.target.value))}>
            {[1, 3, 5, 10, 20].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </Field>
        <div className="callout self-end text-xs">
          Posting-weighted midpoint <span className="num text-fg">{fmtUSD(overall.posted_midpoint?.p50, { compact: true })}</span> vs company-balanced{" "}
          <span className="num text-fg">{fmtUSD(overall.company_balanced_midpoint_p50, { compact: true })}</span>
          {overall.top_employer ? <> · largest board {overall.top_employer.share_pct}% of postings with pay</> : null}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Cohort</th>
              <th className="right">Postings with pay</th>
              <th className="right">Share</th>
              <th className="right">Low p50</th>
              <th className="right">Mid p50</th>
              <th className="right">High p50</th>
              <th className="w-[24%]">Posted low → high (medians)</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => {
              const [lo, hi] = scale;
              const span = Math.max(1, hi - lo);
              const left = c.posted_low_p50 !== null ? ((c.posted_low_p50 - lo) / span) * 100 : 0;
              const right = c.posted_high_p50 !== null ? ((c.posted_high_p50 - lo) / span) * 100 : 0;
              return (
                <tr key={c.company_id} data-selected={selected === c.company_id}>
                  <td>
                    <button type="button" className="rowlink" onClick={() => setSelected(selected === c.company_id ? null : c.company_id)} aria-expanded={selected === c.company_id}>
                      <span className="text-fg">{c.company}</span>
                      <span className="block text-xs text-subtle">{c.top_role_families.map((f) => manifest.role_families[f] ?? f).join(" · ")}</span>
                    </button>
                  </td>
                  <td className="whitespace-nowrap text-muted">{COHORT_LABEL[c.cohort] ?? c.cohort}</td>
                  <td className="right num">{fmtInt(c.usd_annual_eligible)}<span className="text-subtle"> / {fmtInt(c.open_postings)}</span></td>
                  <td className="right num text-muted">{c.share_of_market_eligible_pct}%</td>
                  <td className="right num">{fmtUSD(c.posted_low_p50, { compact: true })}</td>
                  <td className="right num text-fg">{fmtUSD(c.posted_midpoint_p50, { compact: true })}</td>
                  <td className="right num">{fmtUSD(c.posted_high_p50, { compact: true })}</td>
                  <td>
                    <div className="bar min-w-[6rem]" aria-hidden="true">
                      <i style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(1, right - left)}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-subtle">
        <span>
          {fmtInt(companies.length)} companies with {minPostings}+ postings with pay · share is of all postings with pay in this view · medians are per company, so one board never defines another’s row
        </span>
        {companies.length > 20 ? (
          <button type="button" className="chip" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show top 20" : `Show all ${companies.length}`}
          </button>
        ) : null}
      </div>

      {selected && selectedRows.length ? (
        <div>
          <h3 className="font-display text-xl">{selectedRows[0].company} — highest posted ranges in this view</h3>
          <div className="table-wrap mt-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Level</th>
                  <th>Location</th>
                  <th className="right">Posted range</th>
                  <th>Posted</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {selectedRows.map((o) => (
                  <tr key={o.id}>
                    <td className="min-w-[14rem]">{o.title}</td>
                    <td className="whitespace-nowrap text-muted">{manifest.levels[o.level] ?? o.level}</td>
                    <td className="max-w-[14rem] truncate text-muted" title={o.location_raw}>{o.location_raw || "—"}</td>
                    <td className="right num whitespace-nowrap">{fmtRange(o.amount_low, o.amount_high)}</td>
                    <td className="whitespace-nowrap text-muted">{fmtDate(o.observed_at)}</td>
                    <td>{o.source_url ? <a className="link-accent whitespace-nowrap" href={o.source_url} target="_blank" rel="noopener noreferrer">Posting ↗</a> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
