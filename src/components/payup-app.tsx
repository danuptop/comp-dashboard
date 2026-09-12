"use client";

import { useEffect, useMemo, useState } from "react";
import { loadObservations, MANIFEST, type LoadState } from "@/data/release";
import type { MarketId } from "@/lib/benchmark";
import { summarize } from "@/lib/stats";
import { MarketSelector } from "@/components/market-selector";
import { BenchmarkExplorer } from "@/components/benchmark-explorer";
import { CompanyComparison } from "@/components/company-comparison";
import { PackageComparison } from "@/components/package-comparison";
import { Calculator } from "@/components/calculator";
import { Section } from "@/components/section";
import { fmtInt } from "@/lib/format";

export function PayUpApp() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [market, setMarket] = useState<MarketId>("ai");

  useEffect(() => {
    let alive = true;
    loadObservations()
      .then((observations) => alive && setState({ status: "ready", observations }))
      .catch((e: unknown) => alive && setState({ status: "error", message: e instanceof Error ? e.message : String(e) }));
    return () => {
      alive = false;
    };
  }, []);

  const observations = useMemo(() => (state.status === "ready" ? state.observations : []), [state]);
  const fdePosted = useMemo(() => {
    if (state.status !== "ready") return null;
    const rows = observations.filter((o) => o.markets.includes("ai") && o.role_family === "forward_deployed_engineer");
    return rows.length ? summarize(rows, MANIFEST.display_rules) : null;
  }, [observations, state.status]);

  const mk = MANIFEST.markets[market];

  return (
    <>
      <Section
        id="benchmarks"
        eyebrow="Observed · employer postings"
        title="What employers are posting right now."
        lede={
          <>
            Base-salary ranges from {fmtInt(MANIFEST.counts.market_companies)} companies’ own job boards, verified open on {MANIFEST.observation_window.verified_open_on}. Filter, read the spread, and open the
            posting. Percentiles appear only above the display rule; otherwise you see examples, not a distribution.
          </>
        }
        aside={<MarketSelector market={market} onChange={setMarket} manifest={MANIFEST} />}
      >
        <BenchmarkExplorer key={market} market={market} observations={observations} state={state} manifest={MANIFEST} />
      </Section>

      <Section
        id="companies"
        eyebrow="Observed · by employer"
        title="Who is setting the range."
        lede={`Per-company medians for the ${mk.label} market, with each employer’s share of the postings that disclose pay. Compare the posting-weighted midpoint with the company-balanced one before quoting a market number.`}
      >
        <CompanyComparison key={market} market={market} observations={observations} state={state} manifest={MANIFEST} />
      </Section>

      <Section
        id="packages"
        eyebrow="Arithmetic · your inputs"
        title="Compare two packages without blending them."
        lede="Base, target bonus, commission, sign-on, equity vesting, and token vesting stay on separate lines. First-year and recurring totals are computed at grant value; the risk-adjusted lines apply Up Top’s discount assumptions and are labelled as such."
      >
        <PackageComparison key={market} market={market} />
      </Section>

      <Section
        id="calculator"
        eyebrow="Modelled · Up Top assumptions"
        title="Up Top’s compensation model."
        lede="Band midpoint × level × geography × stage × scarcity gives an adjusted base salary. These are the assumptions Up Top uses in search work — not observed data, and not to be layered on the posted ranges above."
      >
        <Calculator key={market} market={market} fdePosted={fdePosted} />
      </Section>
    </>
  );
}
