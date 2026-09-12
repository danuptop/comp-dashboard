# Pay Up — compensation intelligence by Up Top Search

Next.js (App Router) + Tailwind v4. Deployed on Vercel at payup.uptopsearch.com.

Pay Up shows two kinds of numbers and keeps them apart:

- **Observed** — employer-posted base-salary ranges pulled first-party from company job boards
  by Up Top's frontier monitor and shipped here as a versioned static release
  (`public/data/ai-comp/`). Every observation links to its posting.
- **Modelled** — Up Top's band matrix, multipliers, score tiers, and discount stacks
  (`src/data/crypto-model.ts`, `src/data/ai-model.ts`). Assumptions, labelled as such.

## Develop

```bash
npm ci
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test           # vitest: data-contract, statistics-mirror, benchmark, package, model tests
npm run build
```

## Data release

The release is produced by `scripts/frontier_public_export.py` in the `uptop-crons` repository
(read-only over the monitor's SQLite store, deterministic, fail-closed). It writes
`public/data/ai-comp/<release_id>/{observations,summaries,manifest}.json`, then
`latest.json` and `latest-manifest.json` — the last two only after the release verified.
`src/data/release.ts` imports `latest-manifest.json` at build time and fetches
`observations.json` at runtime, verifying its SHA-256 against the manifest before any
statistic is rendered.

Refresh (Mac, store copied read-only from EC2):

```bash
ssh ec2 'cat /data/uptop/crons/state/frontier-labs-monitor/frontier_comp.sqlite' > /tmp/frontier_comp.sqlite
python3 ~/uptop-crons/scripts/frontier_public_export.py --db /tmp/frontier_comp.sqlite --out public/data/ai-comp
npm test && npm run build
```

The exporter exits 75 and writes nothing when the latest monitor batch is not complete, and
exits 1 and writes nothing when any quality check fails, so a broken collection leaves the
site on the last valid release. Company → market membership is a reviewed decision in
`uptop-crons/config/frontier_company_cohorts.json`; unknown or low-confidence companies are
excluded from every market.

Private recruiting evidence (calls, budgets, candidate expectations, offers) has no path into
this repository.

Brand assets and their provenance: `public/BRAND-ASSETS.md`.
