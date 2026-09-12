import type { Band } from "@/lib/stats";
import { fmtUSD } from "@/lib/format";

/** p25–p75 bar with a p50 tick on a shared dollar scale. Quiet, 1px-ish, no gradients. */
export function RangeStrip({ band, scale, label }: { band: Band | null; scale: [number, number]; label: string }) {
  if (!band) return <span className="text-subtle">—</span>;
  const [lo, hi] = scale;
  const span = Math.max(1, hi - lo);
  const pct = (v: number) => `${Math.min(100, Math.max(0, ((v - lo) / span) * 100))}%`;
  return (
    <div className="flex items-center gap-3" aria-label={`${label}: 25th percentile ${fmtUSD(band.p25)}, median ${fmtUSD(band.p50)}, 75th percentile ${fmtUSD(band.p75)}`}>
      <div className="bar min-w-[7rem] flex-1">
        <i style={{ left: pct(band.p25), width: `calc(${pct(band.p75)} - ${pct(band.p25)})` }} />
        <b style={{ left: pct(band.p50) }} />
      </div>
    </div>
  );
}
