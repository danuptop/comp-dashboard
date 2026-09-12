"use client";

import { useMemo, useState } from "react";
import type { LoadState, Observation, ReleaseManifest } from "@/data/release";
import { ARRANGEMENT_LABEL, COHORT_LABEL, COUNTRY_LABEL, METRO_LABEL } from "@/data/markets";
import { benchmark, DEFAULT_FILTER, examples, optionsFor, type BenchmarkFilter, type MarketId } from "@/lib/benchmark";
import type { Summary } from "@/lib/stats";
import { fmtDate, fmtInt, fmtRange, fmtUSD } from "@/lib/format";
import { Field, Stat } from "@/components/section";
import { RangeStrip } from "@/components/range-strip";

export function BenchmarkExplorer({ market, observations, state, manifest }: {
  market: MarketId;
  observations: Observation[];
  state: LoadState;
  manifest: ReleaseManifest;
}) {
  const rules = manifest.display_rules;
  // Remounted with key={market} by PayUpApp, so the filter resets when the market changes.
  const [filter, setFilter] = useState<BenchmarkFilter>({ ...DEFAULT_FILTER, market });

  const families = useMemo(() => optionsFor(observations, market, "role_family"), [observations, market]);
  const levels = useMemo(() => optionsFor(observations, market, "level"), [observations, market]);
  const cohorts = useMemo(() => optionsFor(observations, market, "cohort"), [observations, market]);
  const arrangements = useMemo(() => optionsFor(observations, market, "work_arrangement"), [observations, market]);
  const metros = useMemo(
    () => optionsFor(observations, market, "metro").filter((m) => !["multiple", "unspecified", "remote_unspecified", "remote_global", "us_unspecified", "north_america"].includes(m.value) && m.n >= 10),
    [observations, market],
  );
  const countries = useMemo(() => optionsFor(observations, market, "country").filter((c) => !["US", "multiple", "unspecified"].includes(c.value) && c.n >= 5), [observations, market]);

  const result = useMemo(() => benchmark(observations, filter, rules), [observations, filter, rules]);
  const shown = result.strict.summary.meets_display_rule ? result.strict : result.broadened;
  const exampleRows = useMemo(() => examples(result.strict.rows, 12), [result]);
  const set = (patch: Partial<BenchmarkFilter>) => setFilter((f) => ({ ...f, ...patch }));

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,17rem)_1fr]">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
        <Field label="Role family">
          <select className="select" value={filter.role_family} onChange={(e) => set({ role_family: e.target.value })}>
            <option value="all">All role families</option>
            {families.map((f) => (
              <option key={f.value} value={f.value}>
                {manifest.role_families[f.value] ?? f.value} ({f.n})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Level" hint="Parsed from the title. “Not stated” is the employer’s omission, not mid-level.">
          <select className="select" value={filter.level} onChange={(e) => set({ level: e.target.value })}>
            <option value="all">All levels</option>
            {levels.map((l) => (
              <option key={l.value} value={l.value}>
                {manifest.levels[l.value] ?? l.value} ({l.n})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Geography">
          <select className="select" value={filter.geo} onChange={(e) => set({ geo: e.target.value })}>
            <option value="all">All geographies</option>
            <option value="US">United States (all)</option>
            {metros.map((m) => (
              <option key={m.value} value={`metro:${m.value}`}>
                {METRO_LABEL[m.value] ?? m.value} ({m.n})
              </option>
            ))}
            <option value="remote">Remote or remote-optional</option>
            <option value="non_us">Outside the US</option>
            {countries.map((c) => (
              <option key={c.value} value={c.value}>
                {COUNTRY_LABEL[c.value] ?? c.value} ({c.n})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Work arrangement">
          <select className="select" value={filter.work_arrangement} onChange={(e) => set({ work_arrangement: e.target.value })}>
            <option value="all">Any arrangement</option>
            {arrangements.map((a) => (
              <option key={a.value} value={a.value}>
                {ARRANGEMENT_LABEL[a.value] ?? a.value} ({a.n})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Company cohort">
          <select className="select" value={filter.cohort} onChange={(e) => set({ cohort: e.target.value })} disabled={cohorts.length < 2}>
            <option value="all">All cohorts</option>
            {cohorts.map((c) => (
              <option key={c.value} value={c.value}>
                {COHORT_LABEL[c.value] ?? c.value} ({c.n})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Funding stage" hint="Not in this data. Boards carry no dated funding evidence, so stage is never inferred.">
          <select className="select" disabled value="na">
            <option value="na">Not available</option>
          </select>
        </Field>
      </div>

      <div className="min-w-0">
        {state.status === "loading" ? (
          <p className="text-sm text-muted" role="status">
            Loading {fmtInt(manifest.counts.observations)} observations and verifying the release checksum…
          </p>
        ) : state.status === "error" ? (
          <div className="callout" role="alert">
            <p className="text-fg">Benchmarks withheld.</p>
            <p className="mt-1">{state.message}</p>
          </div>
        ) : (
          <ResultPanel strict={result.strict.summary} shown={shown} manifest={manifest} exampleRows={exampleRows} />
        )}
      </div>
    </div>
  );
}

function ResultPanel({ strict, shown, manifest, exampleRows }: {
  strict: Summary;
  shown: { summary: Summary; relaxed?: string[] } | null;
  manifest: ReleaseManifest;
  exampleRows: Observation[];
}) {
  const rules = manifest.display_rules;
  const s = shown?.summary ?? null;
  const scale: [number, number] = s?.posted_low && s.posted_high ? [s.posted_low.min, s.posted_high.max] : [0, 1];
  const broadened = shown && shown.relaxed && shown.relaxed.length > 0;
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label="Matched postings" value={fmtInt(strict.postings)} sub={`${fmtInt(strict.usd_annual_eligible)} with a USD annual range`} />
        <Stat label="Distinct employers" value={fmtInt(strict.employers)} sub={`${fmtInt(strict.eligible_employers)} disclosing pay`} />
        <Stat label="Disclosure" value={strict.disclosure_coverage_pct === null ? "—" : `${strict.disclosure_coverage_pct}%`} sub="postings with a posted range" />
        <Stat
          label="Posted between"
          value={strict.posted_window ? <span className="text-[1.05rem]">{fmtDate(strict.posted_window.min)} – {fmtDate(strict.posted_window.max)}</span> : "—"}
          sub={`all still open on ${fmtDate(manifest.observation_window.verified_open_on)}`}
        />
      </div>

      {!strict.meets_display_rule ? (
        <div className="callout">
          <p className="text-fg">
            Under the display rule — percentiles need at least {rules.min_postings} postings with pay from {rules.min_employers} employers.
          </p>
          <p className="mt-1">
            This exact filter has {fmtInt(strict.usd_annual_eligible)} posting{strict.usd_annual_eligible === 1 ? "" : "s"} with pay from {fmtInt(strict.eligible_employers)} employer
            {strict.eligible_employers === 1 ? "" : "s"}.{" "}
            {broadened
              ? `Percentiles below come from a broadened cohort: ${shown!.relaxed!.join(", ")}. The examples stay on your exact filter.`
              : "No broadening reaches the rule; examples below are source-linked postings, not a distribution."}
          </p>
        </div>
      ) : null}

      {s && s.meets_display_rule ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className={`badge ${broadened ? "badge-warn" : "badge-ok"}`}>{broadened ? "Broadened view" : "Exact filter"}</span>
            <span className="text-xs text-subtle">
              {fmtInt(s.usd_annual_eligible)} postings with pay · {fmtInt(s.eligible_employers)} employers · base salary as posted, USD, annual
            </span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Statistic</th>
                  <th className="right">p25</th>
                  <th className="right">p50</th>
                  <th className="right">p75</th>
                  <th className="right">Range</th>
                  <th className="w-[28%]">Spread (p25–p75, tick = p50)</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Posted lower bound", s.posted_low],
                    ["Posted range midpoint", s.posted_midpoint],
                    ["Posted upper bound", s.posted_high],
                  ] as const
                ).map(([label, band]) => (
                  <tr key={label}>
                    <td className="text-fg">{label}</td>
                    <td className="right num">{fmtUSD(band?.p25, { compact: true })}</td>
                    <td className="right num text-fg">{fmtUSD(band?.p50, { compact: true })}</td>
                    <td className="right num">{fmtUSD(band?.p75, { compact: true })}</td>
                    <td className="right num text-subtle">{band ? fmtRange(band.min, band.max) : "—"}</td>
                    <td>
                      <RangeStrip band={band} scale={scale} label={label} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-4 text-sm text-muted sm:grid-cols-3">
            <p>
              <span className="stat-label block">Company-balanced midpoint</span>
              <span className="num text-fg">{fmtUSD(s.company_balanced_midpoint_p50, { compact: true })}</span>
              <span className="block text-xs text-subtle">median of per-company medians vs {fmtUSD(s.posted_midpoint?.p50, { compact: true })} posting-weighted</span>
            </p>
            <p>
              <span className="stat-label block">Largest employer share</span>
              <span className="num text-fg">
                {s.top_employer ? `${s.top_employer.share_pct}%` : "—"}
              </span>
              <span className="block text-xs text-subtle">
                {s.top_employer ? `${s.top_employer.postings} of ${s.usd_annual_eligible} postings with pay` : ""}
                {s.top_employer && s.top_employer.share_pct >= 30 ? " · concentrated" : ""}
              </span>
            </p>
            <p>
              <span className="stat-label block">Employer concentration (HHI)</span>
              <span className="num text-fg">{s.employer_hhi ?? "—"}</span>
              <span className="block text-xs text-subtle">0–10,000; under 1,500 is diffuse</span>
            </p>
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl">Source-linked examples</h3>
          <span className="text-xs text-subtle">exact filter · newest first · at most two per employer</span>
        </div>
        {exampleRows.length === 0 ? (
          <p className="text-sm text-muted">No postings with a USD annual range match this filter.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Level</th>
                  <th>Location</th>
                  <th className="right">Posted range</th>
                  <th>Posted</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {exampleRows.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap text-fg">{o.company}</td>
                    <td className="min-w-[14rem]">{o.title}</td>
                    <td className="whitespace-nowrap text-muted">{manifest.levels[o.level] ?? o.level}</td>
                    <td className="max-w-[14rem] truncate text-muted" title={o.location_raw}>{o.location_raw || "—"}</td>
                    <td className="right num whitespace-nowrap">{fmtRange(o.amount_low, o.amount_high)}{o.equity_offered ? <span className="ml-1 text-subtle" title="board flags equity">+eq</span> : null}</td>
                    <td className="whitespace-nowrap text-muted">{fmtDate(o.observed_at)}</td>
                    <td>
                      {o.source_url ? (
                        <a className="link-accent whitespace-nowrap" href={o.source_url} target="_blank" rel="noopener noreferrer">
                          Posting ↗
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
