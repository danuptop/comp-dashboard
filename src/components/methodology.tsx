import type { ReleaseManifest } from "@/data/release";
import { fmtDate, fmtInt } from "@/lib/format";
import { AI_MODEL } from "@/data/ai-model";
import { CRYPTO_MODEL } from "@/data/crypto-model";

export function Methodology({ manifest }: { manifest: ReleaseManifest }) {
  const m = manifest;
  const flags = m.counts.observation_flags;
  const warns = m.quality_checks.filter((c) => c.status === "warn");
  const fails = m.quality_checks.filter((c) => c.status === "fail");
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div className="flex flex-col gap-8 text-sm leading-relaxed text-muted">
        <div>
          <h3 className="font-display text-xl text-fg">Two kinds of numbers</h3>
          <p className="mt-2">
            <span className="text-fg">Observed:</span> ranges employers published on their own applicant-tracking boards (Ashby, Greenhouse, Lever, Google Careers), pulled first-party by Up Top’s monitor and
            released as a versioned dataset. Every observation links to its posting. <span className="text-fg">Modelled:</span> Up Top’s band matrix, multipliers, score tiers, and discount stacks — assumptions we use
            in search work, labelled wherever they appear. The two are never mixed in one figure.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-fg">What a posted range is</h3>
          <p className="mt-2">{m.definitions.component}</p>
          <p className="mt-2">{m.definitions.component_confidence}</p>
          <p className="mt-2">
            Statistics are named for what they measure: percentiles of posted lower bounds, of posted upper bounds, and of range midpoints. A median upper bound is the median advertised ceiling — it is not
            median pay. Percentiles use only USD, annual, full-time-eligible ranges; counts and disclosure use every matched posting.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-fg">Display rule</h3>
          <p className="mt-2">
            Cohort percentiles appear only with at least {m.display_rules.min_postings} postings with pay from {m.display_rules.min_employers} employers. Below that the view broadens one dimension at a time and says
            so, or shows source-linked examples with no distribution claim. This is a product heuristic, set centrally in the release, not a statistical guarantee. Company-balanced medians and the employer
            concentration index are shown so a few large boards cannot quietly define a market.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-fg">What is not here</h3>
          <p className="mt-2">{m.privacy.statement}</p>
          <p className="mt-2">
            Bonus, commission, sign-on, equity, and token value are not in posted ranges. Funding stage is never inferred from a company name. Level comes from the title alone, so “level not stated” is common.
            Non-USD ranges ({fmtInt(flags.non_usd ?? 0)}), monthly or hourly rates ({fmtInt((flags.pay_period_monthly ?? 0) + (flags.pay_period_hourly ?? 0) + (flags.pay_period_unspecified ?? 0))}), and intern,
            contract, or part-time postings ({fmtInt((flags.employment_intern ?? 0) + (flags.employment_contract ?? 0) + (flags.employment_part_time ?? 0))}) are kept as observations but excluded from every
            percentile. {fmtInt(m.counts.duplicates_collapsed)} exact duplicate postings were collapsed.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-fg">Model provenance</h3>
          <p className="mt-2">
            Crypto model {CRYPTO_MODEL.version} ({fmtDate(CRYPTO_MODEL.asOf)}): {CRYPTO_MODEL.sourceNote} AI model {AI_MODEL.version} ({fmtDate(AI_MODEL.asOf)}): {AI_MODEL.sourceNote} The forward-deployed
            engineer row is a total-compensation survey figure and is shown as a reference, never as a base band; an earlier version of this file ran it through the base formula and then added equity, which
            double-counted.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 text-sm sm:grid-cols-3">
          <Item k="Release" v={m.release_id} />
          <Item k="Generated" v={fmtDate(m.generated_at)} />
          <Item k="Source batch" v={`${m.source.batch.success_boards}/${m.source.batch.expected_boards} boards · ${m.source.batch.status}`} />
          <Item k="Verified open on" v={fmtDate(m.observation_window.verified_open_on)} />
          <Item k="Posted between" v={`${fmtDate(m.observation_window.posted_at_min)} – ${fmtDate(m.observation_window.posted_at_max)}`} />
          <Item k="Boards configured" v={fmtInt(m.source.boards_configured)} />
          <Item k="Open roles in store" v={fmtInt(m.counts.store_open_roles)} />
          <Item k="In a market" v={`${fmtInt(m.counts.observations)} postings · ${fmtInt(m.counts.market_companies)} companies`} />
          <Item k="With USD annual range" v={fmtInt(m.counts.usd_annual_eligible)} />
          <Item k="Schema / rules" v={`${m.schema_version} / ${m.generator.rules_version}`} />
          <Item k="Cohort review" v={fmtDate(m.generator.cohort_config.reviewed_at)} />
          <Item k="Private evidence" v={m.privacy.private_evidence_included ? "included" : "none"} />
        </dl>

        <div>
          <h3 className="font-display text-xl">Company cohorts in this release</h3>
          <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
            {Object.entries(m.cohorts)
              .filter(([, c]) => c.companies_in_release > 0)
              .map(([id, c]) => (
                <div key={id} className="grid gap-1 py-2.5 sm:grid-cols-[12rem_1fr_auto] sm:gap-4">
                  <dt className="text-fg">{c.label}</dt>
                  <dd className="text-muted">{c.definition}</dd>
                  <dd className="num text-right text-muted">{c.companies_in_release}</dd>
                </div>
              ))}
          </dl>
          <p className="mt-2 text-xs text-subtle">
            Excluded from every market: {Object.entries(m.counts.excluded_rows).map(([k, v]) => `${k.replace(/_/g, " ")} ${fmtInt(v)}`).join(" · ")}.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl">Release quality checks</h3>
          <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
            {m.quality_checks.map((c) => (
              <li key={c.name} className="flex gap-3 py-2">
                <span className={`badge shrink-0 ${c.status === "pass" ? "badge-ok" : c.status === "warn" ? "badge-warn" : ""}`}>{c.status}</span>
                <span>
                  <span className="text-fg">{c.name.replace(/_/g, " ")}</span>
                  <span className="block text-xs text-subtle">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-subtle">
            {fails.length ? `${fails.length} failing check(s) — this release should not have been published.` : `No failing checks. ${warns.length} informational warning(s).`}
          </p>
        </div>

        <div className="text-xs leading-relaxed text-subtle">
          <p>
            Refresh: run <code className="text-muted">scripts/frontier_public_export.py</code> in uptop-crons against the monitor store and commit the new <code className="text-muted">public/data/ai-comp/</code> release. The
            exporter refuses partial batches and failing checks, so a broken collection leaves this page on the last valid release.
          </p>
        </div>
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="stat-label">{k}</dt>
      <dd className="num mt-1 text-fg">{v}</dd>
    </div>
  );
}
