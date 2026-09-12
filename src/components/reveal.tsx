"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Scroll fade-up (14px, 0.7s). Honours prefers-reduced-motion by rendering visible at once. */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Under prefers-reduced-motion the stylesheet forces .reveal visible, so no observer is needed.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return (
    <Tag ref={ref} className={`reveal ${on ? "is-in" : ""} ${className}`} style={style}>
      {children}
    </Tag>
  );
}

export function TitleRule() {
  return <span className="title-rule" aria-hidden="true" />;
}
