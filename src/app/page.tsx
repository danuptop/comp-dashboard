"use client";

import { useState, useMemo } from "react";

/* ══════════════════════════════════════════════════════════════════
   PROTOCOL RANK — COMPENSATION ENGINE
   Interactive dashboard with live calculator, clickable salary matrix,
   section navigation, and hover effects.
   ══════════════════════════════════════════════════════════════════ */

export default function Home() {
  // Calculator state
  const [calcCategory, setCalcCategory] = useState(1); // index into SALARY_DATA
  const [calcSeniority, setCalcSeniority] = useState(2); // 0=Junior..4=Exec
  const [calcGeo, setCalcGeo] = useState(0); // index into GEO_DATA
  const [calcStage, setCalcStage] = useState(3); // index into STAGE_DATA
  const [calcScarcity, setCalcScarcity] = useState<number[]>([]); // indices into SCARCITY_DATA
  const [calcScore, setCalcScore] = useState(85);

  // Salary matrix highlight
  const [highlightRow, setHighlightRow] = useState<number | null>(1);

  // Compute level multiplier from score
  const levelMult = useMemo(() => {
    if (calcScore >= 90) return { label: "TOP SHELF", mult: 1.2 };
    if (calcScore >= 81) return { label: "STRONG", mult: 1.0 };
    if (calcScore >= 66) return { label: "SOLID", mult: 0.9 };
    if (calcScore >= 50) return { label: "MID", mult: 0.75 };
    return { label: "HARD PASS", mult: 0.6 };
  }, [calcScore]);

  // Compute final result
  const calcResult = useMemo(() => {
    const row = SALARY_DATA[calcCategory];
    const band = row.bands[calcSeniority];
    const baseMid = parseSalary(band.mid);
    const geo = GEO_DATA[calcGeo].mult;
    const stage = STAGE_DATA[calcStage].mult;
    const scarcity = calcScarcity.reduce(
      (acc, i) => acc * SCARCITY_DATA[i].multNum,
      1
    );
    const result = baseMid * levelMult.mult * geo * stage * scarcity;
    return {
      baseMid,
      geo,
      stage,
      scarcity,
      levelLabel: levelMult.label,
      levelNum: levelMult.mult,
      result,
      category: row.name,
      seniority: SENIORITY_LABELS[calcSeniority],
      geoLabel: GEO_DATA[calcGeo].label,
      stageLabel: STAGE_DATA[calcStage].label,
    };
  }, [calcCategory, calcSeniority, calcGeo, calcStage, calcScarcity, levelMult]);

  // Click salary row → populate calculator
  const handleRowClick = (rowIndex: number) => {
    setHighlightRow(rowIndex);
    setCalcCategory(rowIndex);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-28">
      {/* ── HEADER ────────────────────────────────────────────── */}
      <h1
        className="text-[2.8rem] font-black tracking-tight mb-5"
        style={{
          background: "linear-gradient(135deg, #7C5CFC, #B388FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        PROTOCOL RANK — COMPENSATION ENGINE
      </h1>
      <p className="text-[var(--text-dim)] text-[1.08rem] mb-12 max-w-[700px] leading-relaxed">
        Complete visual breakdown of all role categories, seniority levels,
        salary bands, multipliers, and premiums.
      </p>

      {/* ── STICKY NAV ────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex gap-4 overflow-x-auto py-5 px-3 mb-20 -mx-3"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--card-border)" }}
      >
        {[
          { href: "#calculator", label: "Calculator" },
          { href: "#levels", label: "Levels" },
          { href: "#matrix", label: "Salary Matrix" },
          { href: "#multipliers", label: "Multipliers" },
          { href: "#scarcity", label: "Scarcity" },
          { href: "#tokens", label: "Token Model" },
          { href: "#example", label: "Example" },
        ].map((n) => (
          <a key={n.href} href={n.href} className="nav-pill">
            {n.label}
          </a>
        ))}
      </nav>

      {/* ── FORMULA BANNER ────────────────────────────────────── */}
      <div
        className="rounded-2xl p-14 mb-28 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(85,52,167,0.3), rgba(124,92,252,0.15))",
          border: "1px solid var(--purple)",
        }}
      >
        <h2 className="text-sm uppercase tracking-[2px] text-[var(--accent)] font-bold mb-6">
          Master Formula
        </h2>
        <div className="flex items-center justify-center flex-wrap gap-4 text-[1.05rem] font-medium">
          <span
            className="px-4 py-1.5 rounded-lg font-bold"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "var(--green)",
            }}
          >
            Adjusted Base
          </span>
          <span className="text-[var(--text-dim)]">=</span>
          {["Base Band", "Level Mult", "Geo Mult", "Stage Mult", "Scarcity Mult"].map(
            (v, i) => (
              <span key={v} className="contents">
                {i > 0 && (
                  <span className="text-[var(--text-dim)] text-lg font-light">
                    x
                  </span>
                )}
                <span
                  className="px-4 py-1.5 rounded-lg font-semibold text-[0.88rem] whitespace-nowrap"
                  style={{
                    background: "rgba(124,92,252,0.15)",
                    border: "1px solid rgba(124,92,252,0.3)",
                  }}
                >
                  {v}
                </span>
              </span>
            )
          )}
        </div>
        <p className="text-[var(--text-dim)] text-[0.82rem] mt-7 leading-relaxed">
          Total Comp = Adjusted Base + Realistic Token Value (FDV x allocation %
          x discount stack)
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════
          SECTION: INTERACTIVE CALCULATOR
          ════════════════════════════════════════════════════════ */}
      <Section id="calculator" emoji="🧮" title="Compensation Calculator" badge="INTERACTIVE">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(85,52,167,0.2), rgba(124,92,252,0.08))",
            border: "1px solid var(--purple)",
          }}
        >
          {/* Inputs */}
          <div className="p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Category */}
            <div>
              <label className="block text-[0.72rem] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)] mb-3">
                Role Category
              </label>
              <select
                className="calc-select"
                value={calcCategory}
                onChange={(e) => {
                  setCalcCategory(Number(e.target.value));
                  setHighlightRow(Number(e.target.value));
                }}
              >
                {SALARY_DATA.map((r, i) => (
                  <option key={r.name} value={i}>
                    {r.icon} {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seniority */}
            <div>
              <label className="block text-[0.72rem] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)] mb-3">
                Seniority Level
              </label>
              <select
                className="calc-select"
                value={calcSeniority}
                onChange={(e) => setCalcSeniority(Number(e.target.value))}
              >
                {SENIORITY_LABELS.map((l, i) => (
                  <option key={l} value={i}>{l}</option>
                ))}
              </select>
            </div>

            {/* Score */}
            <div>
              <label className="block text-[0.72rem] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)] mb-3">
                Protocol Rank Score — {calcScore} ({levelMult.label})
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={calcScore}
                onChange={(e) => setCalcScore(Number(e.target.value))}
                className="w-full accent-[var(--accent)] h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[0.65rem] text-[var(--text-dim)] mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Geo */}
            <div>
              <label className="block text-[0.72rem] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)] mb-3">
                Geography
              </label>
              <select
                className="calc-select"
                value={calcGeo}
                onChange={(e) => setCalcGeo(Number(e.target.value))}
              >
                {GEO_DATA.map((g, i) => (
                  <option key={g.label} value={i}>
                    {g.label} ({g.mult}x)
                  </option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-[0.72rem] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)] mb-3">
                Company Stage
              </label>
              <select
                className="calc-select"
                value={calcStage}
                onChange={(e) => setCalcStage(Number(e.target.value))}
              >
                {STAGE_DATA.map((s, i) => (
                  <option key={s.label} value={i}>
                    {s.label} ({s.mult}x)
                  </option>
                ))}
              </select>
            </div>

            {/* Scarcity Chips */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-[0.72rem] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)] mb-3">
                Scarcity Premiums
              </label>
              <div className="flex flex-wrap gap-2">
                {SCARCITY_DATA.map((s, i) => (
                  <button
                    key={s.name}
                    className={`calc-chip ${calcScarcity.includes(i) ? "active" : ""}`}
                    onClick={() =>
                      setCalcScarcity((prev) =>
                        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                      )
                    }
                  >
                    {s.icon} {s.mult}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div
            className="px-12 py-12"
            style={{
              background: "rgba(13,11,20,0.5)",
              borderTop: "1px solid var(--purple)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <div className="text-[0.75rem] text-[var(--text-dim)] uppercase tracking-[1px] mb-1">
                  {calcResult.category} — {calcResult.seniority}
                </div>
                <div className="text-[0.85rem] text-[var(--text-dim)] mb-4">
                  ${calcResult.baseMid.toLocaleString()} x {calcResult.levelNum.toFixed(2)} x{" "}
                  {calcResult.geo.toFixed(2)} x {calcResult.stage.toFixed(2)}
                  {calcResult.scarcity !== 1 && ` x ${calcResult.scarcity.toFixed(2)}`}
                </div>
                <div className="text-[3rem] font-black text-[var(--green)] leading-none result-glow">
                  ${Math.round(calcResult.result).toLocaleString()}
                </div>
                <div className="text-[var(--text-dim)] text-sm mt-2">
                  adjusted base salary
                </div>
              </div>

              {/* Breakdown pills */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Base", val: `$${calcResult.baseMid.toLocaleString()}` },
                  { label: calcResult.levelLabel, val: `${calcResult.levelNum.toFixed(2)}x` },
                  { label: calcResult.geoLabel, val: `${calcResult.geo.toFixed(2)}x` },
                  { label: calcResult.stageLabel, val: `${calcResult.stage.toFixed(2)}x` },
                  ...(calcResult.scarcity !== 1
                    ? [{ label: "Scarcity", val: `${calcResult.scarcity.toFixed(2)}x` }]
                    : []),
                ].map((p) => (
                  <div
                    key={p.label}
                    className="px-4 py-2 rounded-xl text-center"
                    style={{
                      background: "rgba(124,92,252,0.12)",
                      border: "1px solid rgba(124,92,252,0.25)",
                    }}
                  >
                    <div className="text-[0.62rem] text-[var(--text-dim)] uppercase tracking-[1px]">
                      {p.label}
                    </div>
                    <div className="text-[1rem] font-bold text-[var(--accent)]">{p.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Note>
          Click any row in the Salary Matrix below to auto-populate the calculator.
          Toggle scarcity premiums to stack multipliers.
        </Note>
      </Section>

      {/* ════════════════════════════════════════════════════════
          SECTION 1: LEVEL CLASSIFICATION
          ════════════════════════════════════════════════════════ */}
      <Section id="levels" emoji="🏆" title="Level Classification" badge="5 TIERS">
        {/* Visual bar */}
        <div
          className="flex h-[68px] rounded-xl overflow-hidden mb-8"
          style={{ border: "1px solid var(--card-border)" }}
        >
          {[
            { cls: "HARD PASS", range: "0–49", bg: "rgba(239,68,68,0.25)", color: "#FCA5A5", w: "50%" },
            { cls: "MID", range: "50–65", bg: "rgba(245,158,11,0.25)", color: "#FDE68A", w: "16%" },
            { cls: "SOLID", range: "66–80", bg: "rgba(16,185,129,0.2)", color: "#6EE7B7", w: "15%" },
            { cls: "STRONG", range: "81–89", bg: "rgba(124,92,252,0.25)", color: "#B388FF", w: "9%" },
            { cls: "TOP SHELF", range: "90–100", bg: "rgba(124,92,252,0.5)", color: "#fff", w: "10%" },
          ].map((s) => (
            <div
              key={s.cls}
              className="flex flex-col items-center justify-center gap-1 text-[0.78rem] font-bold"
              style={{ background: s.bg, color: s.color, width: s.w }}
            >
              {s.cls}
              <span className="text-[0.65rem] font-normal opacity-80">
                {s.range}
              </span>
            </div>
          ))}
        </div>

        {/* Multiplier table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <MultiCard title="Level → Compensation Multiplier">
            {[
              { label: "HARD PASS", sub: "(0–49)", w: "50%", bg: "var(--red)", cls: "val-low", val: "0.60x" },
              { label: "MID", sub: "(50–65)", w: "62.5%", bg: "var(--amber)", cls: "val-mid", val: "0.75x" },
              { label: "SOLID", sub: "(66–80)", w: "75%", bg: "var(--green)", cls: "val-high", val: "0.90x" },
              { label: "STRONG", sub: "(81–89)", w: "83.3%", bg: "var(--accent)", cls: "val-premium", val: "1.00x" },
              { label: "TOP SHELF", sub: "(90–100)", w: "100%", bg: "linear-gradient(90deg,var(--accent),#B388FF)", cls: "val-premium", val: "1.20x" },
            ].map((r) => (
              <MultiRow key={r.label} label={r.label} sub={r.sub} barWidth={r.w} barBg={r.bg} valClass={r.cls} value={r.val} />
            ))}
          </MultiCard>
        </div>
        <Note>
          Engine uses continuous interpolation within bands — not flat steps.
          Score 57 does not equal score 63 even though both are MID.
        </Note>
      </Section>

      {/* ════════════════════════════════════════════════════════
          SECTION 2: SALARY MATRIX
          ════════════════════════════════════════════════════════ */}
      <Section id="matrix" emoji="📊" title="Salary Matrix — Base Bands" badge="12 CATEGORIES x 5 LEVELS">
        <div className="salary-grid">
          <table>
            <thead>
              <tr>
                <th>Role Category</th>
                <th>Junior</th>
                <th>Mid</th>
                <th>Senior</th>
                <th>Lead</th>
                <th>Executive</th>
              </tr>
            </thead>
            <tbody>
              {SALARY_DATA.map((row, rowIdx) => (
                <tr
                  key={row.name}
                  className={`${row.cat} ${highlightRow === rowIdx ? "row-selected" : ""}`}
                  onClick={() => handleRowClick(rowIdx)}
                >
                  <td>{row.icon} {row.name}</td>
                  {row.bands.map((b, i) => (
                    <td key={i}>
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-bold text-[0.92rem] ${b.heat}`}>
                          {b.mid}
                        </span>
                        <span className="text-[0.68rem] text-[var(--text-dim)]">
                          {b.range}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>
          <span style={{ color: "#7C5CFC" }}>█</span> TECH &nbsp;&nbsp;
          <span style={{ color: "#F59E0B" }}>█</span> BD / MARKETING &nbsp;&nbsp;
          <span style={{ color: "#10B981" }}>█</span> PRODUCT / DESIGN &nbsp;&nbsp;
          <span style={{ color: "#EF4444" }}>█</span> EXECUTIVE &nbsp;&nbsp;
          | Click any row to populate the calculator. Values show <strong>midpoint</strong>{" "}
          (range below). Pre-multiplier base salary in USD.
        </Note>
      </Section>

      {/* ════════════════════════════════════════════════════════
          SECTION 3: MULTIPLIER LAYERS
          ════════════════════════════════════════════════════════ */}
      <Section id="multipliers" emoji="⚙️" title="Multiplier Layers" badge="3 DIMENSIONS">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* GEO */}
          <MultiCard title="🌍 Geographic Multipliers">
            {GEO_DATA.map((g) => (
              <MultiRow
                key={g.label}
                label={g.label}
                sub={g.sub}
                barWidth={`${g.mult * 100}%`}
                barBg={g.mult >= 0.8 ? "var(--green)" : g.mult >= 0.6 ? "var(--amber)" : "var(--red)"}
                valClass={g.mult >= 0.8 ? "val-high" : g.mult >= 0.6 ? "val-mid" : "val-low"}
                value={`${g.mult.toFixed(2)}x`}
              />
            ))}
          </MultiCard>

          {/* STAGE */}
          <MultiCard title="🚀 Company Stage Multipliers">
            {STAGE_DATA.map((s) => (
              <MultiRow
                key={s.label}
                label={s.label}
                sub={s.desc}
                barWidth={`${(s.mult / 1.1) * 100}%`}
                barBg={s.mult >= 1.0 ? "var(--accent)" : s.mult >= 0.9 ? "var(--green)" : s.mult >= 0.8 ? "var(--amber)" : "var(--red)"}
                valClass={s.mult >= 1.0 ? "val-premium" : s.mult >= 0.9 ? "val-high" : "val-mid"}
                value={`${s.mult.toFixed(2)}x`}
                multiline
              />
            ))}
          </MultiCard>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════
          SECTION 4: SCARCITY PREMIUMS
          ════════════════════════════════════════════════════════ */}
      <Section id="scarcity" emoji="💎" title="Scarcity Premiums" badge="9 FACTORS">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SCARCITY_DATA.map((s, i) => (
            <button
              key={s.name}
              className="card-hover flex items-center gap-5 rounded-xl p-8 text-left"
              style={{
                background: calcScarcity.includes(i)
                  ? "rgba(124,92,252,0.12)"
                  : "var(--card)",
                border: calcScarcity.includes(i)
                  ? "1px solid var(--accent)"
                  : "1px solid var(--card-border)",
              }}
              onClick={() =>
                setCalcScarcity((prev) =>
                  prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                )
              }
            >
              <div
                className={`text-[1.9rem] font-black min-w-[72px] text-center ${s.valCls}`}
              >
                {s.mult}
              </div>
              <div>
                <span
                  className="text-[0.65rem] font-bold uppercase tracking-[1px] px-2 py-0.5 rounded inline-block mb-1.5"
                  style={{
                    background:
                      s.cat === "TECH"
                        ? "rgba(124,92,252,0.2)"
                        : "rgba(245,158,11,0.2)",
                    color: s.cat === "TECH" ? "var(--accent)" : "var(--amber)",
                  }}
                >
                  {s.cat}
                </span>
                <h4 className="text-[0.95rem] font-bold mb-1">
                  {s.icon} {s.name}
                </h4>
                <p className="text-[0.78rem] text-[var(--text-dim)] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
        <Note>
          Click cards to toggle scarcity premiums in the calculator. Selected
          premiums multiply together.
        </Note>
      </Section>

      {/* ════════════════════════════════════════════════════════
          SECTION 5: TOKEN MODEL
          ════════════════════════════════════════════════════════ */}
      <Section id="tokens" emoji="🪙" title="Token Compensation Model" badge="FDV-BASED">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Allocation */}
          <TokenCard title="Token Allocation by Seniority (% of Supply)">
            {[
              { level: "Junior", range: "0.01% – 0.05%", color: "var(--text-dim)" },
              { level: "Mid", range: "0.05% – 0.10%", color: "var(--text-dim)" },
              { level: "Senior", range: "0.10% – 0.25%", color: "var(--amber)" },
              { level: "Lead", range: "0.20% – 0.40%", color: "var(--accent)" },
              { level: "Executive", range: "0.50% – 1.00%", color: "var(--green)" },
            ].map((t) => (
              <div
                key={t.level}
                className="flex justify-between items-center py-4"
                style={{ borderBottom: "1px solid rgba(42,36,64,0.3)" }}
              >
                <span className="font-medium">{t.level}</span>
                <span className="font-bold" style={{ color: t.color }}>
                  {t.range}
                </span>
              </div>
            ))}
          </TokenCard>

          {/* Discount Stack */}
          <TokenCard title="Token Discount Stack">
            {[
              { name: "Pre-TGE Discount", range: "Range: 60%–80%", val: "70%", color: "var(--red)" },
              { name: "Vesting Discount", range: "Range: 30%–40%", val: "35%", color: "var(--amber)" },
              { name: "Liquidity Discount", range: "Range: 20%–30%", val: "25%", color: "var(--amber)" },
            ].map((d) => (
              <div
                key={d.name}
                className="flex justify-between items-center py-4"
                style={{ borderBottom: "1px solid rgba(42,36,64,0.3)" }}
              >
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-[0.75rem] text-[var(--text-dim)]">
                    {d.range}
                  </div>
                </div>
                <span
                  className="font-extrabold text-[1.2rem]"
                  style={{ color: d.color }}
                >
                  {d.val}
                </span>
              </div>
            ))}
            <div
              className="pt-4 mt-3"
              style={{ borderTop: "2px solid var(--card-border)" }}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold">Realized Value Factor</span>
                <span className="font-black text-[1.3rem] text-[var(--accent)]">
                  ~15.9%
                </span>
              </div>
              <div className="text-[0.72rem] text-[var(--text-dim)] mt-1.5">
                0.70 x 0.35 x 0.25 x FDV x allocation% = realistic token value
              </div>
            </div>
          </TokenCard>
        </div>
        <Note>
          <strong>Formula:</strong> Realistic Token Value = FDV x allocation% x
          preTGE_discount x vesting_discount x liquidity_discount &nbsp;|&nbsp;
          Total Comp = Adjusted Base Salary + Realistic Token Value
        </Note>
      </Section>

      {/* ════════════════════════════════════════════════════════
          SECTION 6: RESOLVER DEFAULTS
          ════════════════════════════════════════════════════════ */}
      <Section id="defaults" emoji="🔧" title="Resolver Defaults" badge="FALLBACKS">
        <div
          className="flex flex-wrap gap-8 rounded-xl p-10"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
          }}
        >
          {[
            { label: "Missing Seniority →", value: "MID" },
            { label: "Missing Years →", value: "3" },
            { label: "Missing Geo →", value: "REMOTE_US (0.9x)" },
            { label: "Missing Stage →", value: "SERIES_A (0.93x)" },
          ].map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-3 px-5 py-3 rounded-lg"
              style={{
                background: "rgba(124,92,252,0.1)",
                border: "1px solid rgba(124,92,252,0.25)",
              }}
            >
              <span className="text-[0.78rem] text-[var(--text-dim)] uppercase tracking-[0.5px]">
                {d.label}
              </span>
              <span className="font-bold text-[var(--accent)] text-[0.92rem]">
                {d.value}
              </span>
            </div>
          ))}
        </div>
        <Note>
          When the AI evaluation cannot determine a context field, these
          conservative defaults kick in. Designed to slightly undershoot rather
          than overshoot.
        </Note>
      </Section>

      {/* ════════════════════════════════════════════════════════
          SECTION 7: WORKED EXAMPLE
          ════════════════════════════════════════════════════════ */}
      <Section id="example" emoji="📐" title="Worked Example" badge="FULL CALC">
        <div
          className="rounded-2xl p-12"
          style={{
            background:
              "linear-gradient(135deg, rgba(85,52,167,0.3), rgba(124,92,252,0.15))",
            border: "1px solid var(--purple)",
          }}
        >
          <h2 className="text-sm uppercase tracking-[2px] text-[var(--accent)] font-bold mb-10">
            Senior Solana Protocol Engineer — Series A — Singapore — Score: 85
            (STRONG)
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8 mb-10">
            {[
              { label: "Base Band (PROTOCOL_INFRA x SENIOR)", val: "$210,000", note: "midpoint", color: undefined },
              { label: "Level Multiplier (STRONG)", val: "1.00x", color: "var(--accent)" },
              { label: "Geo Multiplier (Singapore)", val: "0.72x", color: "var(--amber)" },
              { label: "Stage Multiplier (Series A)", val: "0.93x", color: "var(--amber)" },
              { label: "Scarcity (Rust+Solana)", val: "1.15x", color: "var(--accent)" },
            ].map((f) => (
              <div key={f.label} className="py-2">
                <div className="text-[var(--text-dim)] text-[0.75rem] uppercase tracking-[1px] mb-1">
                  {f.label}
                </div>
                <div
                  className="text-[1.5rem] font-extrabold"
                  style={f.color ? { color: f.color } : undefined}
                >
                  {f.val}
                  {f.note && (
                    <span className="text-[0.82rem] font-normal text-[var(--text-dim)] ml-2">
                      {f.note}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6" style={{ borderTop: "1px solid var(--purple)" }}>
            <div className="text-[0.88rem] text-[var(--text-dim)] mb-4">
              $210,000 x 1.00 x 0.72 x 0.93 x 1.15 =
            </div>
            <div className="text-[2.2rem] font-black text-[var(--green)]">
              $161,762{" "}
              <span className="text-base font-medium text-[var(--text-dim)]">
                adjusted base salary
              </span>
            </div>
            <div className="text-[0.82rem] text-[var(--text-dim)] mt-2">
              + token grant value calculated separately via FDV x 0.10–0.25% x
              discount stack
            </div>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="text-center mt-36 pb-20">
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Up Top Search" className="w-10 h-10 rounded-lg" />
          <span className="text-[var(--text-dim)] text-sm font-semibold tracking-wide uppercase">
            Up Top Search
          </span>
        </div>
        <p className="text-[var(--text-dim)] text-xs">
          Protocol Rank Compensation Engine
        </p>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ══════════════════════════════════════════════════════════════════ */

function Section({
  id,
  emoji,
  title,
  badge,
  children,
}: {
  id?: string;
  emoji: string;
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="mb-36 scroll-mt-20">
      <div
        className="flex items-center gap-4 mb-10 pb-6"
        style={{ borderBottom: "1px solid var(--card-border)" }}
      >
        <span className="text-[1.6rem]">{emoji}</span>
        <h2 className="text-[1.5rem] font-extrabold uppercase tracking-[1px]">
          {title}
        </h2>
        <span
          className="text-[0.72rem] font-semibold px-3 py-1 rounded-full"
          style={{
            background: "rgba(124,92,252,0.2)",
            color: "var(--accent)",
          }}
        >
          {badge}
        </span>
      </div>
      {children}
    </div>
  );
}

function MultiCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
      }}
    >
      <div
        className="px-6 py-5 flex items-center gap-2.5"
        style={{
          background: "rgba(31,19,63,0.6)",
          borderBottom: "1px solid var(--card-border)",
        }}
      >
        <h3 className="text-[0.95rem] font-bold uppercase tracking-[0.5px]">
          {title}
        </h3>
      </div>
      <div className="py-3">{children}</div>
    </div>
  );
}

function MultiRow({
  label,
  sub,
  barWidth,
  barBg,
  valClass,
  value,
  multiline,
}: {
  label: string;
  sub?: string;
  barWidth: string;
  barBg: string;
  valClass: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div
      className="flex items-center px-7 py-6 gap-5"
      style={{ borderBottom: "1px solid rgba(42,36,64,0.4)" }}
    >
      <div className="flex-1 font-medium text-[0.88rem]">
        {multiline ? (
          <>
            {label}
            <br />
            <span className="text-[var(--text-dim)] text-[0.75rem] font-normal leading-relaxed">
              {sub}
            </span>
          </>
        ) : (
          <>
            {label}{" "}
            {sub && (
              <span className="text-[var(--text-dim)] text-[0.75rem] font-normal">
                {sub}
              </span>
            )}
          </>
        )}
      </div>
      <div
        className="w-[130px] h-2.5 rounded overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="multi-bar h-full rounded"
          style={{ width: barWidth, background: barBg }}
        />
      </div>
      <div
        className={`font-extrabold text-[1.1rem] min-w-[60px] text-right ${valClass}`}
      >
        {value}
      </div>
    </div>
  );
}

function TokenCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
      }}
    >
      <div
        className="px-6 py-5"
        style={{
          background: "rgba(31,19,63,0.6)",
          borderBottom: "1px solid var(--card-border)",
        }}
      >
        <h3 className="text-[0.95rem] font-bold uppercase tracking-[0.5px]">
          {title}
        </h3>
      </div>
      <div className="px-8 py-8">{children}</div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--text-dim)] text-[0.8rem] mt-10 leading-relaxed">
      {children}
    </p>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════ */

function parseSalary(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) * 1000;
}

const SENIORITY_LABELS = ["Junior", "Mid", "Senior", "Lead", "Executive"];

/* ══════════════════════════════════════════════════════════════════
   STATIC DATA
   ══════════════════════════════════════════════════════════════════ */

const GEO_DATA = [
  { label: "North America", sub: "(US/Canada)", mult: 1.0 },
  { label: "Remote US", mult: 0.9 },
  { label: "Western Europe", sub: "(UK, DE, FR)", mult: 0.8 },
  { label: "Dubai / UAE", sub: "(0% tax offset)", mult: 0.75 },
  { label: "Singapore", mult: 0.72 },
  { label: "Eastern Europe", sub: "(PL, UA, RS)", mult: 0.52 },
  { label: "Remote Global", mult: 0.52 },
  { label: "Latin America", sub: "(AR, BR, MX)", mult: 0.47 },
  { label: "South / SE Asia", mult: 0.42 },
];

const STAGE_DATA = [
  { label: "Pre-Seed", desc: "Lower base; 1.0–2.0% tokens for key hires", mult: 0.75 },
  { label: "Seed", desc: "Lower base; 0.5–1.5% tokens for key hires", mult: 0.82 },
  { label: "Series A", desc: "Balanced; 0.25–0.75% token grants typical", mult: 0.93 },
  { label: "Series B+", desc: "Market-rate base; smaller but liquid tokens", mult: 1.0 },
  { label: "Post-TGE / Public", desc: "Premium for stability; tokens may be liquid", mult: 1.1 },
];

const SALARY_DATA = [
  {
    name: "ENGINEERING GENERAL",
    icon: "⚙️",
    cat: "cat-tech",
    bands: [
      { mid: "$75K", range: "$60K – $90K", heat: "heat-1" },
      { mid: "$125K", range: "$100K – $150K", heat: "heat-2" },
      { mid: "$185K", range: "$150K – $220K", heat: "heat-3" },
      { mid: "$220K", range: "$180K – $260K", heat: "heat-4" },
      { mid: "$240K", range: "$200K – $280K", heat: "heat-4" },
    ],
  },
  {
    name: "PROTOCOL / INFRA",
    icon: "🔗",
    cat: "cat-tech",
    bands: [
      { mid: "$85K", range: "$70K – $100K", heat: "heat-1" },
      { mid: "$145K", range: "$120K – $170K", heat: "heat-2" },
      { mid: "$210K", range: "$170K – $250K", heat: "heat-3" },
      { mid: "$250K", range: "$200K – $300K", heat: "heat-4" },
      { mid: "$270K", range: "$220K – $320K", heat: "heat-5" },
    ],
  },
  {
    name: "ZK / CRYPTOGRAPHY",
    icon: "🔐",
    cat: "cat-tech",
    bands: [
      { mid: "$105K", range: "$90K – $120K", heat: "heat-2" },
      { mid: "$170K", range: "$140K – $200K", heat: "heat-3" },
      { mid: "$250K", range: "$200K – $300K", heat: "heat-4" },
      { mid: "$320K", range: "$260K – $380K", heat: "heat-5" },
      { mid: "$340K", range: "$280K – $400K", heat: "heat-5" },
    ],
  },
  {
    name: "SECURITY / AUDIT",
    icon: "🛡️",
    cat: "cat-tech",
    bands: [
      { mid: "$85K", range: "$70K – $100K", heat: "heat-1" },
      { mid: "$145K", range: "$120K – $170K", heat: "heat-2" },
      { mid: "$210K", range: "$170K – $250K", heat: "heat-3" },
      { mid: "$270K", range: "$220K – $320K", heat: "heat-5" },
      { mid: "$305K", range: "$250K – $360K", heat: "heat-5" },
    ],
  },
  {
    name: "AI x CRYPTO",
    icon: "🤖",
    cat: "cat-tech",
    bands: [
      { mid: "$95K", range: "$80K – $110K", heat: "heat-1" },
      { mid: "$155K", range: "$130K – $180K", heat: "heat-2" },
      { mid: "$220K", range: "$180K – $260K", heat: "heat-3" },
      { mid: "$280K", range: "$230K – $330K", heat: "heat-4" },
      { mid: "$310K", range: "$260K – $360K", heat: "heat-5" },
    ],
  },
  {
    name: "BD / SALES / PARTNERSHIPS",
    icon: "🤝",
    cat: "cat-bd",
    bands: [
      { mid: "$65K", range: "$50K – $80K", heat: "heat-1" },
      { mid: "$115K", range: "$90K – $140K", heat: "heat-2" },
      { mid: "$170K", range: "$140K – $200K", heat: "heat-3" },
      { mid: "$200K", range: "$160K – $240K", heat: "heat-3" },
      { mid: "$230K", range: "$180K – $280K", heat: "heat-4" },
    ],
  },
  {
    name: "MARKETING / COMMUNITY",
    icon: "📢",
    cat: "cat-bd",
    bands: [
      { mid: "$55K", range: "$40K – $70K", heat: "heat-1" },
      { mid: "$95K", range: "$70K – $120K", heat: "heat-1" },
      { mid: "$145K", range: "$120K – $170K", heat: "heat-2" },
      { mid: "$170K", range: "$140K – $200K", heat: "heat-3" },
      { mid: "$185K", range: "$150K – $220K", heat: "heat-3" },
    ],
  },
  {
    name: "MARKETING EXECUTIVE",
    icon: "📣",
    cat: "cat-bd",
    bands: [
      { mid: "$145K", range: "$120K – $170K", heat: "heat-2" },
      { mid: "$185K", range: "$150K – $220K", heat: "heat-3" },
      { mid: "$220K", range: "$180K – $260K", heat: "heat-3" },
      { mid: "$235K", range: "$190K – $280K", heat: "heat-4" },
      { mid: "$250K", range: "$200K – $300K", heat: "heat-4" },
    ],
  },
  {
    name: "PRODUCT",
    icon: "📦",
    cat: "cat-creative",
    bands: [
      { mid: "$85K", range: "$70K – $100K", heat: "heat-1" },
      { mid: "$135K", range: "$110K – $160K", heat: "heat-2" },
      { mid: "$195K", range: "$160K – $230K", heat: "heat-3" },
      { mid: "$235K", range: "$190K – $280K", heat: "heat-4" },
      { mid: "$250K", range: "$200K – $300K", heat: "heat-4" },
    ],
  },
  {
    name: "DESIGN",
    icon: "🎨",
    cat: "cat-creative",
    bands: [
      { mid: "$70K", range: "$55K – $85K", heat: "heat-1" },
      { mid: "$115K", range: "$90K – $140K", heat: "heat-2" },
      { mid: "$170K", range: "$140K – $200K", heat: "heat-3" },
      { mid: "$210K", range: "$170K – $250K", heat: "heat-3" },
      { mid: "$235K", range: "$190K – $280K", heat: "heat-4" },
    ],
  },
  {
    name: "EXECUTIVE — TECH",
    icon: "👑",
    cat: "cat-exec",
    bands: [
      { mid: "$175K", range: "$150K – $200K", heat: "heat-3" },
      { mid: "$215K", range: "$180K – $250K", heat: "heat-3" },
      { mid: "$260K", range: "$220K – $300K", heat: "heat-4" },
      { mid: "$305K", range: "$260K – $350K", heat: "heat-5" },
      { mid: "$340K", range: "$280K – $400K", heat: "heat-5" },
    ],
  },
  {
    name: "EXECUTIVE — BUSINESS",
    icon: "👑",
    cat: "cat-exec",
    bands: [
      { mid: "$145K", range: "$120K – $170K", heat: "heat-2" },
      { mid: "$185K", range: "$150K – $220K", heat: "heat-3" },
      { mid: "$240K", range: "$200K – $280K", heat: "heat-4" },
      { mid: "$275K", range: "$230K – $320K", heat: "heat-4" },
      { mid: "$300K", range: "$250K – $350K", heat: "heat-5" },
    ],
  },
];

const SCARCITY_DATA = [
  { mult: "1.40x", multNum: 1.4, icon: "🔐", name: "ZK / Cryptography PhD", desc: "Advanced cryptography research background", cat: "TECH", valCls: "val-premium" },
  { mult: "1.20x", multNum: 1.2, icon: "🛡️", name: "Security Audit Background", desc: "Formal security auditing experience", cat: "TECH", valCls: "val-premium" },
  { mult: "1.20x", multNum: 1.2, icon: "✅", name: "Formal Verification Skills", desc: "Formal verification and mathematical proofs", cat: "TECH", valCls: "val-premium" },
  { mult: "1.17x", multNum: 1.17, icon: "🔗", name: "Prior L1/L2 Core Team", desc: "Core team experience at major blockchain", cat: "TECH", valCls: "val-premium" },
  { mult: "1.15x", multNum: 1.15, icon: "🦀", name: "Rust + Solana Expertise", desc: "Specialized Solana/Rust development skills", cat: "TECH", valCls: "val-premium" },
  { mult: "1.15x", multNum: 1.15, icon: "⚖️", name: "Regulatory Navigation", desc: "Proven compliance and regulatory experience", cat: "BD", valCls: "val-mid" },
  { mult: "1.15x", multNum: 1.15, icon: "🌐", name: "Category-Defining Network", desc: "Exceptional industry network and relationships", cat: "BD", valCls: "val-mid" },
  { mult: "1.12x", multNum: 1.12, icon: "🏦", name: "RWA / TradFi Bridge", desc: "Real-world asset tokenization experience", cat: "BD", valCls: "val-mid" },
  { mult: "1.12x", multNum: 1.12, icon: "🏛️", name: "Institutional Sales", desc: "Top-tier institutional sales experience", cat: "BD", valCls: "val-mid" },
];
