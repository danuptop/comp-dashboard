"use client";

import { MARKETS, COHORT_LABEL } from "@/data/markets";
import type { MarketId } from "@/lib/benchmark";
import type { ReleaseManifest } from "@/data/release";
import { fmtInt } from "@/lib/format";

export function MarketSelector({ market, onChange, manifest }: { market: MarketId; onChange: (m: MarketId) => void; manifest: ReleaseManifest }) {
  const m = manifest.markets[market];
  return (
    <div className="flex flex-col gap-4">
      <div className="seg" role="tablist" aria-label="Market">
        {MARKETS.map((opt) => (
          <button key={opt.id} type="button" role="tab" aria-selected={market === opt.id} onClick={() => onChange(opt.id)}>
            {opt.label}
          </button>
        ))}
      </div>
      <div className="text-sm leading-relaxed text-muted">
        <p>
          <span className="text-fg">{m.label}.</span> {m.definition}
        </p>
        <p className="mt-2 text-xs text-subtle">
          {fmtInt(m.companies)} companies · {fmtInt(m.open_postings)} open postings · {fmtInt(m.usd_annual_eligible)} with a USD annual range
          {m.cohorts.length ? <> · cohorts: {m.cohorts.map((c) => COHORT_LABEL[c] ?? c).join(", ")}</> : null}
        </p>
      </div>
    </div>
  );
}
