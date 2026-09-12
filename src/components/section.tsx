import type { ReactNode } from "react";
import { Reveal, TitleRule } from "@/components/reveal";

export function Section({ id, eyebrow, title, lede, children, aside }: {
  id: string;
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-b border-line" aria-labelledby={`${id}-title`}>
      <Reveal className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id={`${id}-title`} className="mt-4 max-w-[24ch] font-display text-3xl tracking-[-0.02em] sm:text-4xl">
              {title}
            </h2>
            <TitleRule />
            {lede ? <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted">{lede}</p> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
        <div className="mt-10">{children}</div>
      </Reveal>
    </section>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="border-l border-line pl-4">
      <p className="stat-label">{label}</p>
      <p className="stat-value num mt-1.5">{value}</p>
      {sub ? <p className="mt-1 text-xs text-subtle">{sub}</p> : null}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-[0.7rem] normal-case tracking-normal text-subtle">{hint}</span> : null}
    </label>
  );
}
