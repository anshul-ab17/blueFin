"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const LINE_COLORS = ["#4d9fff", "#f2b84b", "#4ade80", "#e5484d", "#a78bfa"];

type Point = { ts: number; values: (number | null)[] };

interface ChartData {
  marketId: string;
  category: string;
  labels: string[];
  series: Point[];
}

const WINDOWS = ["1D", "1W", "1M", "ALL"] as const;
type Window = (typeof WINDOWS)[number];

function toWindowParam(w: Window): string {
  return w.toLowerCase().replace("all", "all");
}

function fmtDate(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtTime(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Deterministic PRNG (mulberry32) seeded from a string, so synthetic charts are stable. */
function seededRand(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a plausible odds-history that starts near an even split and converges to the
 * settled result — mirrors how a real market resolves (winner → ~100%). Purely for
 * finished matches when no backend history exists.
 */
function syntheticHistory(marketId: string, category: string, labels: string[], finalPcts: number[]): ChartData {
  const rand = seededRand(`${marketId}:${category}`);
  const N = 40;
  const nowSec = Math.floor(Date.now() / 1000);
  const spanSec = 3 * 3600; // ~kickoff to full-time window
  const start = labels.map(() => 100 / labels.length);
  const series: Point[] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const ease = t * t * (3 - 2 * t); // smoothstep
    const raw = labels.map((_, li) => {
      const base = start[li] + (finalPcts[li] - start[li]) * ease;
      const noise = i === N - 1 ? 0 : (rand() - 0.5) * 10 * (1 - ease);
      return Math.max(0.1, base + noise);
    });
    const sum = raw.reduce((s, v) => s + v, 0);
    const values = i === N - 1 ? finalPcts.slice() : raw.map((v) => (v / sum) * 100);
    series.push({ ts: nowSec - spanSec + Math.round(t * spanSec), values });
  }
  return { marketId, category, labels, series };
}

function SvgChart({ data, width, height }: { data: ChartData; width: number; height: number }) {
  const [hover, setHover] = useState<{ x: number; idx: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const PAD = { top: 16, right: 56, bottom: 32, left: 44 };
  const W = width - PAD.left - PAD.right;
  const H = height - PAD.top - PAD.bottom;

  const { series, labels } = data;
  if (!series.length) return null;

  const minTs = series[0].ts;
  const maxTs = series[series.length - 1].ts;
  const tsRange = maxTs - minTs || 1;

  const xOf = (ts: number) => PAD.left + ((ts - minTs) / tsRange) * W;
  const yOf = (pct: number) => PAD.top + H - (pct / 100) * H;

  // y-axis gridlines at every 10%
  const gridLines = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  // build SVG path per label
  const paths = labels.map((_, li) => {
    const pts = series
      .map((s) => ({ ts: s.ts, v: s.values[li] }))
      .filter((p) => p.v != null) as { ts: number; v: number }[];
    if (!pts.length) return "";
    return pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.ts).toFixed(1)} ${yOf(p.v).toFixed(1)}`)
      .join(" ");
  });

  // x-axis tick count
  const xTicks = Math.min(series.length, 5);
  const xTickIdxs = Array.from({ length: xTicks }, (_, i) =>
    Math.round((i / (xTicks - 1 || 1)) * (series.length - 1))
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = svgRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left - PAD.left;
      const frac = mx / W;
      const targetTs = minTs + frac * tsRange;
      let best = 0;
      let bestDist = Infinity;
      series.forEach((s, i) => {
        const d = Math.abs(s.ts - targetTs);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setHover({ x: xOf(series[best].ts), idx: best });
    },
    [series, minTs, tsRange, W, PAD.left, xOf]
  );

  const hoverPoint = hover ? series[hover.idx] : null;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setHover(null)}
      style={{ cursor: "crosshair", display: "block" }}
    >
      {/* grid */}
      {gridLines.map((pct) => (
        <g key={pct}>
          <line
            x1={PAD.left} x2={PAD.left + W}
            y1={yOf(pct)} y2={yOf(pct)}
            stroke="#1c3247" strokeWidth={1} strokeDasharray="4 4"
          />
          <text x={PAD.left - 6} y={yOf(pct) + 4} textAnchor="end" fill="#5c7188" fontSize={10}>
            {pct}%
          </text>
        </g>
      ))}

      {/* x-axis ticks */}
      {xTickIdxs.map((idx) => {
        const s = series[idx];
        const x = xOf(s.ts);
        return (
          <text key={idx} x={x} y={PAD.top + H + 18} textAnchor="middle" fill="#5c7188" fontSize={10}>
            {fmtDate(s.ts)}
          </text>
        );
      })}

      {/* lines */}
      {paths.map((d, li) =>
        d ? (
          <path
            key={li}
            d={d}
            fill="none"
            stroke={LINE_COLORS[li % LINE_COLORS.length]}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null
      )}

      {/* endpoint labels */}
      {labels.map((label, li) => {
        const last = [...series].reverse().find((s) => s.values[li] != null);
        if (!last) return null;
        const v = last.values[li] as number;
        return (
          <g key={li}>
            <circle cx={xOf(last.ts)} cy={yOf(v)} r={4} fill={LINE_COLORS[li % LINE_COLORS.length]} />
            <text
              x={xOf(last.ts) + 8}
              y={yOf(v) + 4}
              fill={LINE_COLORS[li % LINE_COLORS.length]}
              fontSize={11}
              fontWeight={700}
            >
              {v.toFixed(1)}%
            </text>
          </g>
        );
      })}

      {/* hover crosshair + tooltip */}
      {hover && hoverPoint && (
        <>
          <line
            x1={hover.x} x2={hover.x}
            y1={PAD.top} y2={PAD.top + H}
            stroke="#2f5fa8" strokeWidth={1} strokeDasharray="3 3"
          />
          {/* tooltip box */}
          {(() => {
            const boxW = 130;
            const boxH = 18 + labels.length * 18;
            const bx = hover.x + 12 > PAD.left + W - boxW ? hover.x - boxW - 8 : hover.x + 12;
            const by = PAD.top + 8;
            return (
              <g>
                <rect x={bx} y={by} width={boxW} height={boxH} rx={6} fill="#101f30" stroke="#1c3247" />
                <text x={bx + 8} y={by + 13} fill="#93a7bc" fontSize={10}>
                  {fmtDate(hoverPoint.ts)} {fmtTime(hoverPoint.ts)}
                </text>
                {labels.map((label, li) => {
                  const v = hoverPoint.values[li];
                  return (
                    <g key={li}>
                      <circle cx={bx + 12} cy={by + 22 + li * 18} r={3} fill={LINE_COLORS[li % LINE_COLORS.length]} />
                      <text x={bx + 20} y={by + 26 + li * 18} fill="#eaf1f8" fontSize={11}>
                        {label}: <tspan fontWeight={700}>{v != null ? `${(v as number).toFixed(1)}%` : "—"}</tspan>
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </>
      )}
    </svg>
  );
}

export default function OddsChart({
  marketId,
  category,
  labels: fallbackLabels,
  finished = false,
  finalPcts,
}: {
  marketId: string;
  category: string;
  labels: string[];
  finished?: boolean;
  finalPcts?: number[];
}) {
  const [window, setWindow] = useState<Window>("ALL");
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setLoading(true);
    // proxied through the Next API so the browser never hits the backend origin directly
    fetch(`/api/markets/${marketId}/history?category=${category}&window=${toWindowParam(window)}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [marketId, category, window]);

  // Finished match with no backend history → show a synthetic converge-to-result chart.
  const synthetic =
    finished && finalPcts && (!data || !data.series.length)
      ? syntheticHistory(marketId, category, fallbackLabels, finalPcts)
      : null;
  const chart = data && data.series.length ? data : synthetic;
  const isEmpty = !chart || !chart.series.length;

  return (
    <div ref={containerRef} className="bg-panel border border-line rounded-[14px] p-5 mb-5">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          {fallbackLabels.slice(0, 3).map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
              <span className="font-semibold text-xs" style={{ color: LINE_COLORS[i % LINE_COLORS.length] }}>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={`font-heading font-bold text-[11px] px-2.5 py-1 rounded cursor-pointer border transition-colors duration-150 ${
                window === w
                  ? "bg-btn border-btn-border text-accent-soft"
                  : "bg-transparent border-transparent text-dim hover:text-muted"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* chart area */}
      {loading ? (
        <div className="h-[220px] flex items-center justify-center">
          <span className="font-semibold text-xs text-dim animate-pulse">Loading…</span>
        </div>
      ) : isEmpty ? (
        <div className="h-[220px] flex flex-col items-center justify-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <polyline points="2,26 10,18 16,22 24,10 30,14" stroke="#2f5fa8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="10" cy="18" r="2" fill="#2f5fa8"/>
            <circle cx="16" cy="22" r="2" fill="#4d9fff"/>
            <circle cx="24" cy="10" r="2" fill="#4d9fff"/>
          </svg>
          <span className="font-semibold text-xs text-dim">No odds history yet</span>
          <span className="font-medium text-[11px] text-faint text-center max-w-[220px]">
            Odds history will appear as the market accumulates data
          </span>
        </div>
      ) : (
        <SvgChart data={chart!} width={width} height={240} />
      )}
    </div>
  );
}
