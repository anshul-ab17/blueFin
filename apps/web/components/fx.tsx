"use client";

// Shared motion primitives ported from the redesign mockups' fx.js:
// scroll reveals, count-ups, animated percentage bars, magnetic hover.
import { useEffect, useRef, useState, type ReactNode } from "react";

function useInView<T extends HTMLElement>(rootMargin = "0px 0px -8% 0px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return { ref, seen };
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, seen } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : "translateY(26px)",
        transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const { ref, seen } = useInView<HTMLSpanElement>("0px 0px -10% 0px");
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const t0 = performance.now();
    let raf: number;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 1500);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function FillBar({ pct, barClass = "bg-accent" }: { pct: number; barClass?: string }) {
  const { ref, seen } = useInView<HTMLDivElement>("0px 0px -15% 0px");
  return (
    <div ref={ref} className="flex-1 h-1.5 bg-[#16283b] rounded-[3px] overflow-hidden">
      <div
        className={`h-full rounded-[3px] ${barClass}`}
        style={{ width: seen ? `${pct}%` : 0, transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </div>
  );
}

export function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ transition: "transform 0.18s ease-out" }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${(x * 10).toFixed(1)}px, ${(y * 8).toFixed(1)}px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "translate(0, 0)";
      }}
    >
      {children}
    </div>
  );
}

// Standard app-page header: masked title slide-up + fading subtitle.
export function PageTitle({
  eyebrow,
  title,
  subtitle,
  size = 36,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  size?: number;
}) {
  return (
    <>
      {eyebrow && (
        <div className="rise-in font-semibold text-[13px] text-accent tracking-[1px] uppercase mb-2">{eyebrow}</div>
      )}
      <h1 className="font-heading font-bold m-0 mb-1.5 text-fg" style={{ fontSize: size }}>
        <span className="line-mask">
          <span className="line-up" style={{ animationDelay: "0.1s" }}>
            {title}
          </span>
        </span>
      </h1>
      <p className="rise-in font-medium text-[15px] text-muted m-0 mb-7" style={{ animationDelay: "0.3s" }}>
        {subtitle}
      </p>
    </>
  );
}
