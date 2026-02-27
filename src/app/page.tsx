export default function Home() {
  return (
    <div className="max-w-[1400px] mx-auto px-5 py-10">
      {/* HEADER */}
      <h1
        className="text-[2.4rem] font-black tracking-tight mb-2"
        style={{
          background: "linear-gradient(135deg, #7C5CFC, #B388FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ⚡ PROTOCOL RANK — COMPENSATION ENGINE
      </h1>
      <p className="text-[var(--text-dim)] text-base mb-10">
        Complete visual breakdown of all role categories, seniority levels,
        salary bands, multipliers, and premiums
      </p>

      {/* FORMULA BANNER */}
      <div
        className="rounded-2xl p-7 mb-12 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(85,52,167,0.3), rgba(124,92,252,0.15))",
          border: "1px solid var(--purple)",
        }}
      >
        <h2 className="text-sm uppercase tracking-[2px] text-[var(--accent)] font-bold mb-4">
          🔧 Master Formula
        </h2>
        <div className="flex items-center justify-center flex-wrap gap-2 text-[1.05rem] font-medium">
          <span
            className="px-3 py-1 rounded-lg font-bold"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "var(--green)",
            }}
          >
            Adjusted Base
          </span>
          <span className="text-[var(--text-dim)]">=</span>
          {["📊 Base Band", "🏆 Level Mult", "🌍 Geo Mult", "🚀 Stage Mult", "💎 Scarcity Mult"].map(
            (v, i) => (
              <span key={v} className="contents">
                {i > 0 && <span className="text-[var(--text-dim)]">×</span>}
                <span
                  className="px-3 py-1 rounded-lg font-semibold text-[0.9rem] whitespace-nowrap"
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
        <p className="text-[var(--text-dim)] text-[0.8rem] mt-3">
          Total Comp = Adjusted Base + Realistic Token Value (FDV × allocation %
          × discount stack)
        </p>
      </div>

      {/* SECTION 1: LEVEL CLASSIFICATION */}
      <Section emoji="🏆" title="Level Classification" badge="5 TIERS">
        {/* Visual bar */}
        <div
          className="flex h-[60px] rounded-xl overflow-hidden mb-4"
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
              className="flex flex-col items-center justify-center gap-0.5 text-[0.75rem] font-bold"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MultiCard title="Level → Compensation Multiplier">
            {[
              { label: "HARD PASS", sub: "(0–49)", w: "50%", bg: "var(--red)", cls: "val-low", val: "0.60×" },
              { label: "MID", sub: "(50–65)", w: "62.5%", bg: "var(--amber)", cls: "val-mid", val: "0.75×" },
              { label: "SOLID", sub: "(66–80)", w: "75%", bg: "var(--green)", cls: "val-high", val: "0.90×" },
              { label: "STRONG", sub: "(81–89)", w: "83.3%", bg: "var(--accent)", cls: "val-premium", val: "1.00×" },
              { label: "TOP SHELF", sub: "(90–100)", w: "100%", bg: "linear-gradient(90deg,var(--accent),#B388FF)", cls: "val-premium", val: "1.20×" },
            ].map((r) => (
              <MultiRow key={r.label} label={r.label} sub={r.sub} barWidth={r.w} barBg={r.bg} valClass={r.cls} value={r.val} />
            ))}
          </MultiCard>
        </div>
        <Note>
          ⚡ <strong>Note:</strong> Engine uses continuous interpolation within
          bands — not flat steps. Score 57 ≠ score 63 even though both are MID.
        </Note>
      </Section>

      {/* SECTION 2: SALARY MATRIX */}
      <Section emoji="📊" title="Salary Matrix — Base Bands" badge="12 CATEGORIES × 5 LEVELS = 60 BANDS">
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
              {SALARY_DATA.map((row) => (
                <tr key={row.name} className={row.cat}>
                  <td>{row.icon} {row.name}</td>
                  {row.bands.map((b, i) => (
                    <td key={i}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`font-bold text-[0.9rem] ${b.heat}`}>{b.mid}</span>
                        <span className="text-[0.68rem] text-[var(--text-dim)]">{b.range}</span>
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
          | Values show <strong>midpoint</strong> (range below). Pre-multiplier
          base salary in USD.
        </Note>
      </Section>

      {/* SECTION 3: MULTIPLIERS */}
      <Section emoji="⚙️" title="Multiplier Layers" badge="3 DIMENSIONS">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GEO */}
          <MultiCard title="🌍 Geographic Multipliers">
            {[
              { label: "North America", sub: "(US/Canada)", w: "100%", bg: "var(--green)", cls: "val-high", val: "1.00×" },
              { label: "Remote US", w: "90%", bg: "var(--green)", cls: "val-high", val: "0.90×" },
              { label: "Western Europe", sub: "(UK, DE, FR)", w: "80%", bg: "var(--amber)", cls: "val-mid", val: "0.80×" },
              { label: "Dubai / UAE", sub: "(0% tax offset)", w: "75%", bg: "var(--amber)", cls: "val-mid", val: "0.75×" },
              { label: "Singapore", w: "72%", bg: "var(--amber)", cls: "val-mid", val: "0.72×" },
              { label: "Eastern Europe", sub: "(PL, UA, RS)", w: "52%", bg: "var(--red)", cls: "val-low", val: "0.52×" },
              { label: "Remote Global", w: "52%", bg: "var(--red)", cls: "val-low", val: "0.52×" },
              { label: "Latin America", sub: "(AR, BR, MX)", w: "47%", bg: "var(--red)", cls: "val-low", val: "0.47×" },
              { label: "South / SE Asia", w: "42%", bg: "var(--red)", cls: "val-low", val: "0.42×" },
            ].map((r) => (
              <MultiRow key={r.label} label={r.label} sub={r.sub} barWidth={r.w} barBg={r.bg} valClass={r.cls} value={r.val} />
            ))}
          </MultiCard>

          {/* STAGE */}
          <MultiCard title="🚀 Company Stage Multipliers">
            {[
              { label: "Pre-Seed", sub: "Lower base; 1.0–2.0% tokens for key hires", w: "68%", bg: "var(--red)", cls: "val-low", val: "0.75×" },
              { label: "Seed", sub: "Lower base; 0.5–1.5% tokens for key hires", w: "74%", bg: "var(--amber)", cls: "val-mid", val: "0.82×" },
              { label: "Series A", sub: "Balanced; 0.25–0.75% token grants typical", w: "84.5%", bg: "var(--amber)", cls: "val-mid", val: "0.93×" },
              { label: "Series B+", sub: "Market-rate base; smaller but liquid tokens", w: "91%", bg: "var(--green)", cls: "val-high", val: "1.00×" },
              { label: "Post-TGE / Public", sub: "Premium for stability; tokens may be liquid", w: "100%", bg: "var(--accent)", cls: "val-premium", val: "1.10×" },
            ].map((r) => (
              <MultiRow key={r.label} label={r.label} sub={r.sub} barWidth={r.w} barBg={r.bg} valClass={r.cls} value={r.val} multiline />
            ))}
          </MultiCard>
        </div>
      </Section>

      {/* SECTION 4: SCARCITY PREMIUMS */}
      <Section emoji="💎" title="Scarcity Premiums" badge="9 FACTORS">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCARCITY_DATA.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-4 rounded-xl p-5 transition-colors"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div
                className={`text-[1.8rem] font-black min-w-[70px] text-center ${s.valCls}`}
              >
                {s.mult}
              </div>
              <div>
                <span
                  className="text-[0.65rem] font-bold uppercase tracking-[1px] px-2 py-0.5 rounded inline-block mb-1"
                  style={{
                    background: s.cat === "TECH" ? "rgba(124,92,252,0.2)" : "rgba(245,158,11,0.2)",
                    color: s.cat === "TECH" ? "var(--accent)" : "var(--amber)",
                  }}
                >
                  {s.cat}
                </span>
                <h4 className="text-[0.95rem] font-bold mb-1">{s.icon} {s.name}</h4>
                <p className="text-[0.78rem] text-[var(--text-dim)]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 5: TOKEN MODEL */}
      <Section emoji="🪙" title="Token Compensation Model" badge="FDV-BASED">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allocation */}
          <TokenCard title="📈 Token Allocation by Seniority (% of Supply)">
            {[
              { level: "Junior", range: "0.01% – 0.05%", color: "var(--text-dim)" },
              { level: "Mid", range: "0.05% – 0.10%", color: "var(--text-dim)" },
              { level: "Senior", range: "0.10% – 0.25%", color: "var(--amber)" },
              { level: "Lead", range: "0.20% – 0.40%", color: "var(--accent)" },
              { level: "Executive", range: "0.50% – 1.00%", color: "var(--green)" },
            ].map((t) => (
              <div
                key={t.level}
                className="flex justify-between items-center py-2"
                style={{ borderBottom: "1px solid rgba(42,36,64,0.3)" }}
              >
                <span>{t.level}</span>
                <span className="font-bold" style={{ color: t.color }}>
                  {t.range}
                </span>
              </div>
            ))}
          </TokenCard>

          {/* Discount Stack */}
          <TokenCard title="📉 Token Discount Stack">
            {[
              { name: "Pre-TGE Discount", range: "Range: 60%–80%", val: "70%", color: "var(--red)" },
              { name: "Vesting Discount", range: "Range: 30%–40%", val: "35%", color: "var(--amber)" },
              { name: "Liquidity Discount", range: "Range: 20%–30%", val: "25%", color: "var(--amber)" },
            ].map((d) => (
              <div
                key={d.name}
                className="flex justify-between items-center py-2"
                style={{ borderBottom: "1px solid rgba(42,36,64,0.3)" }}
              >
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-[0.75rem] text-[var(--text-dim)]">{d.range}</div>
                </div>
                <span className="font-extrabold text-[1.2rem]" style={{ color: d.color }}>
                  {d.val}
                </span>
              </div>
            ))}
            <div
              className="pt-3 mt-2"
              style={{ borderTop: "2px solid var(--card-border)" }}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold">Realized Value Factor</span>
                <span className="font-black text-[1.3rem] text-[var(--accent)]">
                  ~15.9%
                </span>
              </div>
              <div className="text-[0.72rem] text-[var(--text-dim)] mt-1">
                0.70 × 0.35 × 0.25 × FDV × allocation% → realistic token value
              </div>
            </div>
          </TokenCard>
        </div>
        <Note>
          <strong>Formula:</strong> Realistic Token Value = FDV × allocation% ×
          preTGE_discount × vesting_discount × liquidity_discount &nbsp;|&nbsp;
          Total Comp = Adjusted Base Salary + Realistic Token Value
        </Note>
      </Section>

      {/* SECTION 6: RESOLVER DEFAULTS */}
      <Section emoji="🔧" title="Resolver Defaults" badge="FALLBACKS">
        <div
          className="flex flex-wrap gap-4 rounded-xl p-5"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
          }}
        >
          {[
            { label: "Missing Seniority →", value: "MID" },
            { label: "Missing Years →", value: "3" },
            { label: "Missing Geo →", value: "REMOTE_US (0.9×)" },
            { label: "Missing Stage →", value: "SERIES_A (0.93×)" },
          ].map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background: "rgba(124,92,252,0.1)",
                border: "1px solid rgba(124,92,252,0.25)",
              }}
            >
              <span className="text-[0.75rem] text-[var(--text-dim)] uppercase tracking-[0.5px]">
                {d.label}
              </span>
              <span className="font-bold text-[var(--accent)] text-[0.9rem]">
                {d.value}
              </span>
            </div>
          ))}
        </div>
        <Note>
          When the AI evaluation can&apos;t determine a context field, these
          conservative defaults kick in. Designed to slightly undershoot rather
          than overshoot.
        </Note>
      </Section>

      {/* SECTION 7: WORKED EXAMPLE */}
      <Section emoji="🧮" title="Worked Example" badge="FULL CALC">
        <div
          className="rounded-2xl p-7 text-left"
          style={{
            background:
              "linear-gradient(135deg, rgba(85,52,167,0.3), rgba(124,92,252,0.15))",
            border: "1px solid var(--purple)",
          }}
        >
          <h2 className="text-sm uppercase tracking-[2px] text-[var(--accent)] font-bold mb-5 text-left">
            Senior Solana Protocol Engineer — Series A — Singapore — Score: 85
            (STRONG)
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 mb-5">
            {[
              { label: "Base Band (PROTOCOL_INFRA × SENIOR)", val: "$210,000", note: "midpoint", color: undefined },
              { label: "Level Multiplier (STRONG)", val: "1.00×", color: "var(--accent)" },
              { label: "Geo Multiplier (Singapore)", val: "0.72×", color: "var(--amber)" },
              { label: "Stage Multiplier (Series A)", val: "0.93×", color: "var(--amber)" },
              { label: "Scarcity (Rust+Solana)", val: "1.15×", color: "var(--accent)" },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-[var(--text-dim)] text-[0.75rem] uppercase tracking-[1px]">
                  {f.label}
                </div>
                <div
                  className="text-[1.4rem] font-extrabold"
                  style={f.color ? { color: f.color } : undefined}
                >
                  {f.val}
                  {f.note && (
                    <span className="text-[0.8rem] font-normal text-[var(--text-dim)] ml-2">
                      {f.note}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div
            className="pt-4"
            style={{ borderTop: "1px solid var(--purple)" }}
          >
            <div className="text-[0.85rem] text-[var(--text-dim)] mb-2">
              $210,000 × 1.00 × 0.72 × 0.93 × 1.15 =
            </div>
            <div className="text-[2rem] font-black text-[var(--green)]">
              $161,762{" "}
              <span className="text-base font-medium text-[var(--text-dim)]">
                adjusted base salary
              </span>
            </div>
            <div className="text-[0.8rem] text-[var(--text-dim)] mt-2">
              + token grant value calculated separately via FDV × 0.10–0.25% ×
              discount stack
            </div>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="text-center mt-16 pb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
            style={{ background: "var(--purple)" }}
          >
            UT
          </div>
          <span className="text-[var(--text-dim)] text-sm font-semibold tracking-wide uppercase">
            Up Top Search
          </span>
        </div>
        <p className="text-[var(--text-dim)] text-xs">
          The Realest Recruiter in Crypto &nbsp;·&nbsp; Protocol Rank
          Compensation Engine
        </p>
      </footer>
    </div>
  );
}

/* ── Reusable Components ────────────────────────────────────── */

function Section({
  emoji,
  title,
  badge,
  children,
}: {
  emoji: string;
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-14">
      <div
        className="flex items-center gap-3 mb-5 pb-3"
        style={{ borderBottom: "1px solid var(--card-border)" }}
      >
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-[1.4rem] font-extrabold uppercase tracking-[1px]">
          {title}
        </h2>
        <span
          className="text-[0.75rem] font-semibold px-2.5 py-0.5 rounded-full"
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
        className="px-5 py-4 flex items-center gap-2.5"
        style={{
          background: "rgba(31,19,63,0.6)",
          borderBottom: "1px solid var(--card-border)",
        }}
      >
        <h3 className="text-base font-bold uppercase tracking-[0.5px]">
          {title}
        </h3>
      </div>
      <div>{children}</div>
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
      className="flex items-center px-5 py-3 gap-3"
      style={{ borderBottom: "1px solid rgba(42,36,64,0.4)" }}
    >
      <div className="flex-1 font-medium text-[0.88rem]">
        {multiline ? (
          <>
            {label}
            <br />
            <span className="text-[var(--text-dim)] text-[0.75rem] font-normal">
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
        className="w-[120px] h-2 rounded overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="multi-bar h-full rounded"
          style={{ width: barWidth, background: barBg }}
        />
      </div>
      <div className={`font-extrabold text-[1.1rem] min-w-[55px] text-right ${valClass}`}>
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
        className="px-5 py-4"
        style={{
          background: "rgba(31,19,63,0.6)",
          borderBottom: "1px solid var(--card-border)",
        }}
      >
        <h3 className="text-base font-bold uppercase tracking-[0.5px]">
          {title}
        </h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--text-dim)] text-[0.78rem] mt-3">{children}</p>
  );
}

/* ── Static Data ────────────────────────────────────────────── */

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
    name: "AI × CRYPTO",
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
  { mult: "1.40×", icon: "🔐", name: "ZK / Cryptography PhD", desc: "Advanced cryptography research background", cat: "TECH", valCls: "val-premium" },
  { mult: "1.20×", icon: "🛡️", name: "Security Audit Background", desc: "Formal security auditing experience", cat: "TECH", valCls: "val-premium" },
  { mult: "1.20×", icon: "✅", name: "Formal Verification Skills", desc: "Formal verification and mathematical proofs", cat: "TECH", valCls: "val-premium" },
  { mult: "1.17×", icon: "🔗", name: "Prior L1/L2 Core Team", desc: "Core team experience at major blockchain", cat: "TECH", valCls: "val-premium" },
  { mult: "1.15×", icon: "🦀", name: "Rust + Solana Expertise", desc: "Specialized Solana/Rust development skills", cat: "TECH", valCls: "val-premium" },
  { mult: "1.15×", icon: "⚖️", name: "Regulatory Navigation", desc: "Proven compliance and regulatory experience", cat: "BD", valCls: "val-mid" },
  { mult: "1.15×", icon: "🌐", name: "Category-Defining Network", desc: "Exceptional industry network and relationships", cat: "BD", valCls: "val-mid" },
  { mult: "1.12×", icon: "🏦", name: "RWA / TradFi Bridge", desc: "Real-world asset tokenization experience", cat: "BD", valCls: "val-mid" },
  { mult: "1.12×", icon: "🏛️", name: "Institutional Sales", desc: "Top-tier institutional sales experience", cat: "BD", valCls: "val-mid" },
];
