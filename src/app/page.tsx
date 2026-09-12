import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PayUpApp } from "@/components/payup-app";
import { Methodology } from "@/components/methodology";
import { Section } from "@/components/section";
import { MANIFEST } from "@/data/release";
import { fmtDate, fmtInt } from "@/lib/format";

export default function Home() {
  const m = MANIFEST;
  return (
    <div id="top" className="min-h-dvh bg-bg text-fg">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="hero-beat eyebrow">Compensation intelligence · Up Top Search</p>
            <h1 className="hero-beat hero-beat-title mt-6 max-w-[18ch] font-display text-5xl leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
              What AI and crypto employers actually post.
            </h1>
            <div className="hero-beat hero-beat-title">
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                Source-linked pay ranges from company job boards, Up Top’s compensation model kept separate and labelled, and package math that never blends base, bonus, equity, and token value.
              </p>
              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4">
                <div>
                  <dt className="stat-label">Postings in market</dt>
                  <dd className="stat-value num mt-1.5">{fmtInt(m.counts.observations)}</dd>
                </div>
                <div>
                  <dt className="stat-label">With a USD range</dt>
                  <dd className="stat-value num mt-1.5">{fmtInt(m.counts.usd_annual_eligible)}</dd>
                </div>
                <div>
                  <dt className="stat-label">Companies</dt>
                  <dd className="stat-value num mt-1.5">{fmtInt(m.counts.market_companies)}</dd>
                </div>
                <div>
                  <dt className="stat-label">Verified open</dt>
                  <dd className="stat-value num mt-1.5 text-[1.35rem] sm:text-[1.6rem]">{fmtDate(m.observation_window.verified_open_on)}</dd>
                </div>
              </dl>
              <p className="mt-6 text-sm text-subtle italic">Employer-posted base salary only. Equity, bonus, and token value are modelled separately and say so.</p>
            </div>
          </div>
        </section>
        <PayUpApp />
        <Section
          id="method"
          eyebrow="Method"
          title="How to read these numbers."
          lede="Sources, definitions, exclusions, the display rule, and the release’s own quality checks."
        >
          <Methodology manifest={m} />
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
