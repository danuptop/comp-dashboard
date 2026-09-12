"use client";

import { useEffect, useState } from "react";
import { Mark } from "@/components/mark";

export const NAV = [
  { href: "#benchmarks", label: "Benchmarks" },
  { href: "#companies", label: "Companies" },
  { href: "#packages", label: "Packages" },
  { href: "#calculator", label: "Calculator" },
  { href: "#method", label: "Method" },
] as const;

/** Sticky product header: mark + Up Top Search / PAY UP lockup, compacts by 4px after 24px of scroll. */
export function SiteHeader() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 transition-[height] duration-200 ease-out sm:px-8 ${
          compact ? "h-[3.75rem] sm:h-16" : "h-16 sm:h-[4.25rem]"
        }`}
      >
        <a href="#top" className="flex min-w-0 items-center gap-3 text-fg" aria-label="Pay Up by Up Top Search — top of page">
          <Mark size={34} className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9" />
          <span className="flex min-w-0 items-baseline gap-3">
            <span className="hidden font-display text-[1.2rem] tracking-[0.04em] sm:inline sm:text-[1.3rem]">Up Top Search</span>
            <span className="hidden h-4 w-px bg-line-strong sm:inline-block" aria-hidden="true" />
            <span className="wordmark text-accent-text">Pay Up</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline">
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="https://uptopsearch.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg transition-all duration-150 hover:-translate-y-px hover:bg-accent-light"
        >
          Start Hiring
        </a>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-line px-5 py-2.5 md:hidden" aria-label="Sections (mobile)">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="shrink-0 text-sm text-muted hover:text-fg">
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
