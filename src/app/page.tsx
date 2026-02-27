"use client";
import { useState, useMemo } from "react";
import {
  ROLE_CATEGORIES,
  SENIORITY_LEVELS,
  SALARY_MATRIX,
  LEVEL_MULTIPLIERS,
  GEO_MULTIPLIERS,
  STAGE_MULTIPLIERS,
  SCARCITY_PREMIUMS,
  TOKEN_ALLOCATIONS,
  TOKEN_DISCOUNTS,
  TOKEN_QUALITY_TIERS,
  TOKEN_QUALITY_DIMENSIONS,
  TOKEN_RED_FLAGS,
  RESOLVER_DEFAULTS,
  DEFAULT_FDV,
  formatUSD,
  formatPct,
} from "@/data/compensation";

const SENIORITY_COLORS: Record<string, string> = {
  JUNIOR: "#6B7280",
  MID: "#3B82F6",
  SENIOR: "#8B5CF6",
  LEAD: "#F59E0B",
  EXECUTIVE: "#EF4444",
};

const SECTIONS = [
  { id: "matrix", label: "Salary Matrix" },
  { id: "multipliers", label: "Multipliers" },
  { id: "scarcity", label: "Scarcity" },
  { id: "tokens", label: "Token Model" },
  { id: "quality", label: "Token Quality" },
  { id: "calculator", label: "Calculator" },
];

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  // Calculator state
  const [calcRole, setCalcRole] = useState<string>(ROLE_CATEGORIES[0].key);
  const [calcSeniority, setCalcSeniority] = useState<string>("SENIOR");
  const [calcLevel, setCalcLevel] = useState("STRONG");
  const [calcGeo, setCalcGeo] = useState("NORTH_AMERICA");
  const [calcStage, setCalcStage] = useState("SERIES_A");
  const [calcScarcity, setCalcScarcity] = useState<string[]>([]);

  const filteredBands = useMemo(() => {
    if (selectedRole === "ALL") return SALARY_MATRIX;
    return SALARY_MATRIX.filter((b) => b.role === selectedRole);
  }, [selectedRole]);

  const maxSalary = useMemo(() => Math.max(...SALARY_MATRIX.map((b) => b.max)), []);

  // Calculator computation
  const calcResult = useMemo(() => {
    const band = SALARY_MATRIX.find(
      (b) => b.role === calcRole && b.seniority === calcSeniority
    );
    if (!band) return null;

    const level = LEVEL_MULTIPLIERS.find((m) => m.key === calcLevel)?.value ?? 1;
    const geo = GEO_MULTIPLIERS.find((m) => m.key === calcGeo)?.value ?? 1;
    const stage = STAGE_MULTIPLIERS.find((m) => m.key === calcStage)?.value ?? 1;
    const scarcity = calcScarcity.reduce((acc, key) => {
      const s = SCARCITY_PREMIUMS.find((p) => p.key === key);
      return acc * (s?.multiplier ?? 1);
    }, 1);

    const adjustedMin = band.min * level * geo * stage * scarcity;
    const adjustedMid = band.midpoint * level * geo * stage * scarcity;
    const adjustedMax = band.max * level * geo * stage * scarcity;

    const tokenAlloc = TOKEN_ALLOCATIONS.find((t) => t.seniority === calcSeniority);
    const typicalDiscount = TOKEN_DISCOUNTS.reduce((acc, d) => acc * d.typical, 1);
    const tokenMinNominal = (tokenAlloc?.minPct ?? 0) / 100 * DEFAULT_FDV;
    const tokenMaxNominal = (tokenAlloc?.maxPct ?? 0) / 100 * DEFAULT_FDV;
    const tokenMinReal = tokenMinNominal * typicalDiscount;
    const tokenMaxReal = tokenMaxNominal * typicalDiscount;

    return {
      adjustedMin,
      adjustedMid,
      adjustedMax,
      level,
      geo,
      stage,
      scarcity,
      tokenMinReal,
      tokenMaxReal,
      totalMin: adjustedMin + tokenMinReal,
      totalMax: adjustedMax + tokenMaxReal,
    };
  }, [calcRole, calcSeniority, calcLevel, calcGeo, calcStage, calcScarcity]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── STICKY NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-primary font-mono text-sm font-bold text-white">
              UT
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">
                UP TOP SEARCH
              </div>
              <div className="text-xs text-purple-glow">
                Protocol Rank Compensation Framework
              </div>
            </div>
          </div>
          <div className="hidden gap-1 md:flex">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-surface-light hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* ── HERO STATS ── */}
        <section className="mb-12">
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            Compensation Framework
          </h1>
          <p className="mb-8 text-sm text-foreground/50">
            Market-calibrated salary bands, multipliers, and token evaluation
            for crypto/web3 recruiting.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Role Categories", value: "12", icon: "📋" },
              { label: "Salary Bands", value: "60", icon: "💰" },
              { label: "Multiplier Dimensions", value: "4", icon: "📊" },
              {
                label: "Default FDV",
                value: "$50M",
                icon: "🪙",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="mb-1 text-2xl">{stat.icon}</div>
                <div className="text-2xl font-bold text-purple-glow">
                  {stat.value}
                </div>
                <div className="text-xs text-foreground/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FORMULA ── */}
        <section className="mb-12 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-bold">PROTOCOL RANK FORMULA</h2>
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
            <span className="rounded bg-purple-dark px-2 py-1 text-purple-glow">
              Adjusted Base
            </span>
            <span className="text-foreground/40">=</span>
            <span className="rounded bg-surface-light px-2 py-1">
              Base Band
            </span>
            <span className="text-foreground/40">&times;</span>
            <span className="rounded bg-blue-900/30 px-2 py-1 text-blue-400">
              Level
            </span>
            <span className="text-foreground/40">&times;</span>
            <span className="rounded bg-emerald-900/30 px-2 py-1 text-emerald-400">
              Geo
            </span>
            <span className="text-foreground/40">&times;</span>
            <span className="rounded bg-amber-900/30 px-2 py-1 text-amber-400">
              Stage
            </span>
            <span className="text-foreground/40">&times;</span>
            <span className="rounded bg-red-900/30 px-2 py-1 text-red-400">
              Scarcity
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-sm">
            <span className="rounded bg-purple-dark px-2 py-1 text-green">
              Total Comp
            </span>
            <span className="text-foreground/40">=</span>
            <span className="rounded bg-purple-dark px-2 py-1 text-purple-glow">
              Adjusted Base
            </span>
            <span className="text-foreground/40">+</span>
            <span className="rounded bg-amber-900/30 px-2 py-1 text-amber-400">
              Realistic Token Value
            </span>
          </div>
        </section>

        {/* ── SALARY MATRIX ── */}
        <section id="matrix" className="mb-12 scroll-mt-20">
          <h2 className="mb-4 text-xl font-bold">SALARY MATRIX</h2>

          {/* Filter */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRole("ALL")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedRole === "ALL"
                  ? "bg-purple-primary text-white"
                  : "bg-surface-light text-foreground/60 hover:text-foreground"
              }`}
            >
              All Categories
            </button>
            {ROLE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedRole(cat.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedRole === cat.key
                    ? "bg-purple-primary text-white"
                    : "bg-surface-light text-foreground/60 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Seniority Legend */}
          <div className="mb-4 flex flex-wrap gap-3">
            {SENIORITY_LEVELS.map((s) => (
              <div key={s} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SENIORITY_COLORS[s] }}
                />
                {s}
              </div>
            ))}
          </div>

          {/* Band Cards */}
          <div className="space-y-2">
            {filteredBands.map((band, i) => {
              const isFirst =
                i === 0 || filteredBands[i - 1].role !== band.role;
              return (
                <div key={`${band.role}-${band.seniority}`}>
                  {isFirst && selectedRole === "ALL" && (
                    <div className="mb-1 mt-4 text-xs font-semibold text-purple-light">
                      {band.roleLabel}
                    </div>
                  )}
                  <div className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 transition-colors hover:border-purple-primary/40">
                    <div
                      className="w-20 text-xs font-semibold"
                      style={{ color: SENIORITY_COLORS[band.seniority] }}
                    >
                      {band.seniority}
                    </div>
                    <div className="flex-1">
                      <div className="relative h-5">
                        {/* Min-Max bar */}
                        <div
                          className="absolute top-1 h-3 rounded-full opacity-25"
                          style={{
                            backgroundColor: SENIORITY_COLORS[band.seniority],
                            left: `${(band.min / maxSalary) * 100}%`,
                            width: `${
                              ((band.max - band.min) / maxSalary) * 100
                            }%`,
                          }}
                        />
                        {/* Midpoint marker */}
                        <div
                          className="absolute top-0 h-5 w-1 rounded-full"
                          style={{
                            backgroundColor: SENIORITY_COLORS[band.seniority],
                            left: `${(band.midpoint / maxSalary) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex w-64 justify-between text-xs font-mono">
                      <span className="text-foreground/40">
                        {formatUSD(band.min)}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatUSD(band.midpoint)}
                      </span>
                      <span className="text-foreground/40">
                        {formatUSD(band.max)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── MULTIPLIERS ── */}
        <section id="multipliers" className="mb-12 scroll-mt-20">
          <h2 className="mb-4 text-xl font-bold">MULTIPLIERS</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Level */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-blue-400">
                CLASSIFICATION LEVEL
              </h3>
              <div className="space-y-2.5">
                {LEVEL_MULTIPLIERS.map((m) => (
                  <div key={m.key}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs font-medium">{m.label}</span>
                      <span className="font-mono text-xs text-blue-400">
                        {m.value}x
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-light">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${(m.value / 1.2) * 100}%` }}
                      />
                    </div>
                    {m.note && (
                      <div className="mt-0.5 text-[10px] text-foreground/30">
                        {m.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Geo */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-emerald-400">
                GEOGRAPHIC REGION
              </h3>
              <div className="space-y-2.5">
                {GEO_MULTIPLIERS.map((m) => (
                  <div key={m.key}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs font-medium">{m.label}</span>
                      <span className="font-mono text-xs text-emerald-400">
                        {m.value}x
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-light">
                      <div
                        className="h-2 rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${m.value * 100}%` }}
                      />
                    </div>
                    {m.note && (
                      <div className="mt-0.5 text-[10px] text-foreground/30">
                        {m.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stage */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-amber-400">
                COMPANY STAGE
              </h3>
              <div className="space-y-2.5">
                {STAGE_MULTIPLIERS.map((m) => (
                  <div key={m.key}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs font-medium">{m.label}</span>
                      <span className="font-mono text-xs text-amber-400">
                        {m.value}x
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-light">
                      <div
                        className="h-2 rounded-full bg-amber-500 transition-all"
                        style={{ width: `${(m.value / 1.1) * 100}%` }}
                      />
                    </div>
                    {m.note && (
                      <div className="mt-0.5 text-[10px] text-foreground/30">
                        {m.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resolver Defaults */}
          <div className="mt-4 rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-bold text-foreground/60">
              RESOLVER DEFAULTS
            </h3>
            <p className="mb-3 text-xs text-foreground/40">
              When data is missing, the system falls back to these conservative
              defaults:
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(RESOLVER_DEFAULTS).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-lg bg-surface-light px-3 py-2 text-center"
                >
                  <div className="text-[10px] text-foreground/40">
                    {k.replace("missing", "")}
                  </div>
                  <div className="font-mono text-sm font-semibold text-purple-glow">
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCARCITY PREMIUMS ── */}
        <section id="scarcity" className="mb-12 scroll-mt-20">
          <h2 className="mb-4 text-xl font-bold">SCARCITY PREMIUMS</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* TECH */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-red-400">
                TECH SCARCITY
              </h3>
              <div className="space-y-3">
                {SCARCITY_PREMIUMS.filter((s) => s.category === "TECH").map(
                  (s) => (
                    <div key={s.key}>
                      <div className="mb-1 flex items-baseline justify-between">
                        <span className="text-xs font-medium">{s.name}</span>
                        <span className="font-mono text-xs text-red-400">
                          {s.multiplier}x
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-light">
                        <div
                          className="h-2 rounded-full bg-red-500 transition-all"
                          style={{
                            width: `${((s.multiplier - 1) / 0.4) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="mt-0.5 text-[10px] text-foreground/30">
                        {s.description}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* BD */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-purple-light">
                BD SCARCITY
              </h3>
              <div className="space-y-3">
                {SCARCITY_PREMIUMS.filter((s) => s.category === "BD").map(
                  (s) => (
                    <div key={s.key}>
                      <div className="mb-1 flex items-baseline justify-between">
                        <span className="text-xs font-medium">{s.name}</span>
                        <span className="font-mono text-xs text-purple-light">
                          {s.multiplier}x
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-light">
                        <div
                          className="h-2 rounded-full bg-purple-light transition-all"
                          style={{
                            width: `${((s.multiplier - 1) / 0.4) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="mt-0.5 text-[10px] text-foreground/30">
                        {s.description}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── TOKEN MODEL ── */}
        <section id="tokens" className="mb-12 scroll-mt-20">
          <h2 className="mb-4 text-xl font-bold">TOKEN COMPENSATION MODEL</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Allocation */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-amber-400">
                TOKEN ALLOCATION BY SENIORITY
              </h3>
              <p className="mb-3 text-xs text-foreground/40">
                Percentage of total token supply at ${formatUSD(DEFAULT_FDV)}{" "}
                FDV
              </p>
              <div className="space-y-3">
                {TOKEN_ALLOCATIONS.map((t) => (
                  <div key={t.seniority}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: SENIORITY_COLORS[t.seniority] }}
                      >
                        {t.seniority}
                      </span>
                      <span className="font-mono text-xs text-foreground/60">
                        {t.minPct}% - {t.maxPct}%
                      </span>
                    </div>
                    <div className="mb-0.5 flex items-baseline justify-between">
                      <span className="text-[10px] text-foreground/30">
                        Nominal value
                      </span>
                      <span className="font-mono text-[10px] text-foreground/40">
                        {formatUSD((t.minPct / 100) * DEFAULT_FDV)} -{" "}
                        {formatUSD((t.maxPct / 100) * DEFAULT_FDV)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-light">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          backgroundColor: SENIORITY_COLORS[t.seniority],
                          width: `${(t.maxPct / 1.0) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Model */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-amber-400">
                3-FACTOR TOKEN DISCOUNT
              </h3>
              <p className="mb-3 text-xs text-foreground/40">
                Converts nominal token value to realistic present value
              </p>
              <div className="space-y-3">
                {TOKEN_DISCOUNTS.map((d) => (
                  <div key={d.type}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs font-medium">{d.type}</span>
                      <span className="font-mono text-xs text-amber-400">
                        {formatPct(d.typical)} typical
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[10px] text-foreground/30">
                      <span>
                        Range: {formatPct(d.min)} - {formatPct(d.max)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-light">
                      <div
                        className="h-2 rounded-full bg-amber-500 transition-all"
                        style={{ width: `${d.typical * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-surface-light p-3">
                <div className="text-xs font-medium text-foreground/60">
                  Combined Typical Factor
                </div>
                <div className="font-mono text-lg font-bold text-amber-400">
                  {(
                    TOKEN_DISCOUNTS.reduce((a, d) => a * d.typical, 1) * 100
                  ).toFixed(3)}
                  %
                </div>
                <div className="text-[10px] text-foreground/30">
                  {TOKEN_DISCOUNTS.map((d) => formatPct(d.typical)).join(
                    " x "
                  )}{" "}
                  = Realistic value as % of nominal
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TOKEN QUALITY FRAMEWORK ── */}
        <section id="quality" className="mb-12 scroll-mt-20">
          <h2 className="mb-4 text-xl font-bold">TOKEN QUALITY FRAMEWORK</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Dimensions */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-purple-glow">
                QUALITY DIMENSIONS
              </h3>
              <div className="space-y-2.5">
                {TOKEN_QUALITY_DIMENSIONS.map((d, i) => (
                  <div key={i} className="rounded-lg bg-surface-light p-2.5">
                    <div className="text-xs font-semibold text-purple-light">
                      {d.name}
                    </div>
                    <div className="mt-0.5 text-[10px] text-foreground/40">
                      {d.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Tiers */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-purple-glow">
                QUALITY TIERS
              </h3>
              <div className="space-y-2.5">
                {TOKEN_QUALITY_TIERS.map((t) => (
                  <div key={t.label}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: t.color }}
                      >
                        {t.label}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] text-foreground/30">
                          Score {t.range}
                        </span>
                        <span
                          className="font-mono text-xs font-bold"
                          style={{ color: t.color }}
                        >
                          {t.adjustment}x
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-surface-light">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          backgroundColor: t.color,
                          width: `${t.adjustment * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-bold text-red">RED FLAGS</h3>
              <div className="space-y-2">
                {TOKEN_RED_FLAGS.map((flag, i) => (
                  <div
                    key={i}
                    className="flex gap-2 rounded-lg bg-red-900/10 px-3 py-2 text-xs text-red-300"
                  >
                    <span className="mt-0.5 shrink-0">&#9888;</span>
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE CALCULATOR ── */}
        <section id="calculator" className="mb-12 scroll-mt-20">
          <h2 className="mb-4 text-xl font-bold">COMPENSATION CALCULATOR</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
              <h3 className="text-sm font-bold text-purple-glow">INPUTS</h3>

              <div>
                <label className="mb-1 block text-xs text-foreground/50">
                  Role Category
                </label>
                <select
                  value={calcRole}
                  onChange={(e) => setCalcRole(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-purple-primary"
                >
                  {ROLE_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-foreground/50">
                  Seniority
                </label>
                <div className="flex gap-2">
                  {SENIORITY_LEVELS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setCalcSeniority(s)}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                        calcSeniority === s
                          ? "text-white"
                          : "bg-surface-light text-foreground/50 hover:text-foreground"
                      }`}
                      style={
                        calcSeniority === s
                          ? { backgroundColor: SENIORITY_COLORS[s] }
                          : undefined
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-foreground/50">
                  Classification Level
                </label>
                <select
                  value={calcLevel}
                  onChange={(e) => setCalcLevel(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-purple-primary"
                >
                  {LEVEL_MULTIPLIERS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label} ({m.value}x) — {m.note}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-foreground/50">
                  Geographic Region
                </label>
                <select
                  value={calcGeo}
                  onChange={(e) => setCalcGeo(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-purple-primary"
                >
                  {GEO_MULTIPLIERS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label} ({m.value}x)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-foreground/50">
                  Company Stage
                </label>
                <select
                  value={calcStage}
                  onChange={(e) => setCalcStage(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-purple-primary"
                >
                  {STAGE_MULTIPLIERS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label} ({m.value}x)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-foreground/50">
                  Scarcity Premiums
                </label>
                <div className="space-y-1.5">
                  {SCARCITY_PREMIUMS.map((s) => (
                    <label
                      key={s.key}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs hover:bg-surface-light"
                    >
                      <input
                        type="checkbox"
                        checked={calcScarcity.includes(s.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCalcScarcity([...calcScarcity, s.key]);
                          } else {
                            setCalcScarcity(
                              calcScarcity.filter((k) => k !== s.key)
                            );
                          }
                        }}
                        className="accent-purple-primary"
                      />
                      <span>
                        {s.name}{" "}
                        <span className="text-foreground/30">
                          ({s.multiplier}x)
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-4">
              <div className="rounded-xl border border-purple-primary/40 bg-surface p-4 glow-purple">
                <h3 className="mb-3 text-sm font-bold text-purple-glow">
                  COMPUTED RESULT
                </h3>
                {calcResult && (
                  <div className="space-y-4">
                    {/* Multiplier breakdown */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-blue-900/30 px-2 py-1 text-blue-400">
                        Level: {calcResult.level}x
                      </span>
                      <span className="rounded bg-emerald-900/30 px-2 py-1 text-emerald-400">
                        Geo: {calcResult.geo}x
                      </span>
                      <span className="rounded bg-amber-900/30 px-2 py-1 text-amber-400">
                        Stage: {calcResult.stage}x
                      </span>
                      {calcResult.scarcity > 1 && (
                        <span className="rounded bg-red-900/30 px-2 py-1 text-red-400">
                          Scarcity: {calcResult.scarcity.toFixed(2)}x
                        </span>
                      )}
                    </div>

                    {/* Adjusted Cash */}
                    <div className="rounded-lg bg-surface-light p-3">
                      <div className="text-xs text-foreground/50">
                        Adjusted Cash Compensation
                      </div>
                      <div className="mt-1 flex items-baseline gap-3">
                        <span className="text-[10px] text-foreground/30">
                          MIN {formatUSD(Math.round(calcResult.adjustedMin))}
                        </span>
                        <span className="font-mono text-xl font-bold text-purple-glow">
                          {formatUSD(Math.round(calcResult.adjustedMid))}
                        </span>
                        <span className="text-[10px] text-foreground/30">
                          MAX {formatUSD(Math.round(calcResult.adjustedMax))}
                        </span>
                      </div>
                    </div>

                    {/* Token Comp */}
                    <div className="rounded-lg bg-surface-light p-3">
                      <div className="text-xs text-foreground/50">
                        Realistic Token Value (after 3-factor discount)
                      </div>
                      <div className="mt-1 font-mono text-lg font-bold text-amber-400">
                        {formatUSD(Math.round(calcResult.tokenMinReal))} -{" "}
                        {formatUSD(Math.round(calcResult.tokenMaxReal))}
                      </div>
                      <div className="text-[10px] text-foreground/30">
                        At {formatUSD(DEFAULT_FDV)} FDV
                      </div>
                    </div>

                    {/* Total */}
                    <div className="rounded-lg border border-green/30 bg-green/5 p-3">
                      <div className="text-xs font-semibold text-green">
                        ESTIMATED TOTAL COMPENSATION
                      </div>
                      <div className="mt-1 font-mono text-2xl font-bold text-green">
                        {formatUSD(Math.round(calcResult.totalMin))} -{" "}
                        {formatUSD(Math.round(calcResult.totalMax))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-primary font-mono text-xs font-bold text-white">
            UT
          </div>
          <span className="text-sm font-semibold tracking-wide">
            UP TOP SEARCH
          </span>
        </div>
        <p className="mt-2 text-xs text-foreground/30">
          The Realest Recruiter in Crypto &mdash; Protocol Rank Compensation
          Engine
        </p>
      </footer>
    </div>
  );
}
