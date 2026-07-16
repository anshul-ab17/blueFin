"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Footer from "@/components/footer";
import LiveDot from "@/components/live-dot";
import PageBackdrop from "@/components/page-backdrop";
import TeamBadge from "@/components/team-badge";
import { CountUp, FillBar, Magnetic, Reveal } from "@/components/fx";
import { FAQS, LIVE_NOW, RECENT_TRADES } from "@/lib/data";

const HERO_STATS = [
  { value: 24.85, decimals: 2, prefix: "$", suffix: "M", label: "Total Volume" },
  { value: 12.8, decimals: 1, suffix: "K", label: "Traders" },
  { value: 156, label: "Active Markets" },
  { value: 98.7, decimals: 1, suffix: "%", label: "Settlement Accuracy" },
];

const FEATURES = [
  { icon: "📡", title: "Real-time Data Feeds", body: "Streams from verified sources worldwide via TxLINE SSE." },
  { icon: "⛓️", title: "On-chain Settlement", body: "Transparent. Trustless. Instant — on Solana." },
  { icon: "🌊", title: "Deep Liquidity", body: "Trade with confidence. Anytime." },
  { icon: "🌍", title: "Global Markets", body: "From local matches to international tournaments." },
];

const QUICK_STATS = [
  { value: 24, suffix: "/7", label: "Markets Open" },
  { value: 100, suffix: "+", label: "Countries" },
  { value: 50, suffix: "K+", label: "Predictions" },
  { value: 24.8, decimals: 1, prefix: "$", suffix: "M+", label: "Total Volume" },
];

const HIW_STEPS = [
  {
    num: "01",
    title: "Discover",
    body: "Browse markets and find an outcome you believe in. Every World Cup fixture, every angle — match results, goals, scorers.",
  },
  {
    num: "02",
    title: "Trade",
    body: "Buy YES or NO shares in outcomes at the best available prices. Odds shift live as the match unfolds.",
  },
  {
    num: "03",
    title: "Resolve",
    body: "When the event ends, results are verified by TxLINE data feeds — cryptographic Merkle proofs, anchored on Solana.",
  },
  {
    num: "04",
    title: "Settle",
    body: "Payouts are automatically settled on-chain, straight to your wallet. No middlemen. No claims process.",
  },
];

const SPLASH_MS = 2300;
const HERO_BASE_DELAY = 2; // seconds; hero animates in as the splash fades

function Splash() {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), SPLASH_MS);
    const t2 = setTimeout(() => setGone(true), SPLASH_MS + 750);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  if (gone) return null;
  return (
    <div
      className="fixed inset-0 z-[200] bg-deep overflow-hidden flex flex-col items-center justify-center"
      style={{ opacity: fading ? 0 : 1, transition: "opacity 0.7s ease", pointerEvents: fading ? "none" : "auto" }}
    >
      <div className="absolute top-[72%] left-1/2 w-[200vw] h-[200vw] -ml-[100vw] rounded-[43%] bg-[rgba(27,58,107,0.55)] animate-waverotate" />
      <div className="absolute top-[76%] left-1/2 w-[200vw] h-[200vw] -ml-[100vw] rounded-[41%] bg-[rgba(47,111,237,0.3)] animate-waverotate-rev" />
      <div className="relative flex flex-col items-center gap-[18px]">
        <img src="/assets/bluefin-orca.svg" alt="Bluefin" className="w-[110px] h-[110px] object-contain orca-tint animate-bobfloat" />
        <div className="flex gap-0.5 overflow-hidden">
          {"BLUEFIN".split("").map((c, i) => (
            <span
              key={i}
              className="line-up font-heading font-bold text-[26px] tracking-[8px] text-fg"
              style={{ animationDuration: "0.6s", animationDelay: `${(0.25 + i * 0.07).toFixed(2)}s` }}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="rise-in font-medium text-[13px] text-muted" style={{ animationDelay: "1s" }}>
          The Home of World Cup Predictions.
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  const items = [...RECENT_TRADES, ...RECENT_TRADES, ...RECENT_TRADES, ...RECENT_TRADES];
  return (
    <div className="border-y border-line bg-[#0c1826] overflow-hidden py-[13px]">
      <div className="inline-flex gap-11 whitespace-nowrap w-max animate-[marquee_28s_linear_infinite]">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2.5">
            <span
              className={`font-heading font-bold text-[11px] px-2 py-[3px] rounded-[5px] ${
                t.side === "YES" ? "bg-btn text-accent-soft" : "bg-[#161f2c] text-no"
              }`}
            >
              {t.side}
            </span>
            <span className="font-semibold text-[13px] text-fg">{t.label}</span>
            <span className="font-semibold text-[13px] text-muted">{t.amount}</span>
            <span className="font-medium text-xs text-dim">{t.time}</span>
            <span className="text-line-2">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Pinned scroll-driven "How Bluefin Works" storytelling section (420vh scroll range).
function HowItWorks() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const idx = Math.min(3, Math.floor(progress * 4));
  const step = HIW_STEPS[idx];

  useEffect(() => {
    let raf: number | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const el = outerRef.current;
        if (!el) return;
        const total = el.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        setProgress(Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const panels = [
    <div key="discover" className="w-[380px] bg-panel border border-line-2 rounded-2xl p-6 shadow-[0_24px_60px_rgba(4,10,18,0.6)]">
      <div className="flex items-center gap-2 mb-3.5">
        <TeamBadge code="ARG" color="#3f7dbf" size="xs" />
        <span className="font-bold text-sm text-fg">Argentina vs France</span>
        <TeamBadge code="FRA" color="#1565c0" size="xs" />
      </div>
      <div className="font-bold text-[11px] text-accent uppercase tracking-[0.5px] mb-1.5">Match Result</div>
      <div className="font-semibold text-[15px] text-fg mb-4">Full-time result: Argentina vs France</div>
      <div className="flex items-center gap-2 mb-1.5">
        <FillBar pct={68} />
        <span className="font-heading font-bold text-xs text-muted">68%</span>
      </div>
      <div className="font-semibold text-xs text-dim">Argentina leads · $1.25M Vol</div>
    </div>,
    <div key="trade" className="w-[380px] bg-panel border border-line-2 rounded-2xl p-6 shadow-[0_24px_60px_rgba(4,10,18,0.6)]">
      <div className="font-semibold text-[15px] text-fg mb-4">Argentina to win?</div>
      <div className="flex gap-2.5 mb-[18px]">
        <span className="flex-1 text-center bg-btn border border-btn-border text-accent-soft font-heading font-bold text-[13px] px-1 py-[11px] rounded-lg">
          YES 1.48x
        </span>
        <span className="flex-1 text-center bg-[#161f2c] border border-line-2 text-no font-heading font-bold text-[13px] px-1 py-[11px] rounded-lg">
          NO 2.65x
        </span>
      </div>
      <div className="flex justify-between items-center bg-panel-2 border border-btn-border rounded-[10px] px-4 py-3.5">
        <span className="font-semibold text-[13px] text-muted">Stake $25</span>
        <span className="text-dim">→</span>
        <span className="font-heading font-bold text-[15px] text-win">Payout $37.00</span>
      </div>
    </div>,
    <div key="resolve" className="w-[380px] bg-panel border border-line-2 rounded-2xl p-6 shadow-[0_24px_60px_rgba(4,10,18,0.6)]">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[rgba(34,197,94,0.15)] border border-live text-win text-[15px]">
          ✓
        </span>
        <div>
          <div className="font-bold text-sm text-fg">TxLINE Proof Verified</div>
          <div className="font-medium text-xs text-dim">Merkle root anchored on Solana</div>
        </div>
      </div>
      <div className="font-semibold text-[11px] text-dim mb-1">MERKLE ROOT</div>
      <div className="font-mono text-xs text-muted break-all mb-3">0x7f3a9c2e1b4d8f60a3c5e7d9b1a2f480c891</div>
      <div className="font-semibold text-[11px] text-dim mb-1">RESULT</div>
      <div className="font-bold text-sm text-fg">Argentina 3 — 2 France · Full Time</div>
    </div>,
    <div key="settle" className="w-[380px] bg-panel border border-live rounded-2xl p-6 shadow-[0_0_50px_rgba(34,197,94,0.12),0_24px_60px_rgba(4,10,18,0.6)]">
      <div className="font-semibold text-xs text-dim uppercase tracking-[0.5px] mb-2.5">Settlement Complete</div>
      <div className="font-heading font-bold text-[34px] text-win mb-2">+$37.00 USDC</div>
      <div className="font-semibold text-[13px] text-muted mb-4">Paid to 7xKq…9dFe · on-chain · 0.4s</div>
      <div className="flex items-center gap-2 font-semibold text-xs text-win">
        <LiveDot />
        No middlemen. No claims process.
      </div>
    </div>,
  ];

  return (
    <div id="how-it-works" ref={outerRef} className="relative h-[420vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/bg/deep-water.png')" }}
        />
        <div className="absolute inset-0 bg-[rgba(8,16,26,0.87)]" />
        <div className="relative max-w-[1280px] mx-auto w-full px-10 box-border">
          <div className="text-center mb-12">
            <div className="font-bold text-xs tracking-[2px] text-accent uppercase mb-2.5">
              Simple · Transparent · Trustless
            </div>
            <h2 className="font-heading font-bold text-[40px] m-0 text-fg">How Bluefin Works</h2>
          </div>
          <div className="grid grid-cols-[60px_1fr_1fr] gap-12 items-center min-h-[380px]">
            <div className="flex flex-col items-center h-[340px]">
              <div className="relative w-0.5 flex-1 bg-line rounded-sm overflow-hidden">
                <div
                  className="absolute top-0 left-0 w-full bg-[linear-gradient(180deg,#4d9fff,#7db4ff)]"
                  style={{ height: `${(progress * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
            <div key={idx}>
              <div className="rise-in font-heading font-bold text-[88px] leading-none text-[rgba(77,159,255,0.28)] mb-2.5">
                {step.num}
              </div>
              <div className="rise-in font-heading font-bold text-[32px] text-fg mb-3" style={{ animationDelay: "60ms" }}>
                {step.title}
              </div>
              <div
                className="rise-in font-medium text-base leading-[1.7] text-muted max-w-[420px]"
                style={{ animationDelay: "120ms" }}
              >
                {step.body}
              </div>
              <div className="flex gap-2.5 mt-7">
                {HIW_STEPS.map((s, i) => (
                  <span
                    key={s.num}
                    className={`w-[34px] h-1 rounded-sm transition-colors duration-[400ms] ${
                      i <= idx ? "bg-accent" : "bg-line"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="relative h-[340px]">
              {panels.map((panel, i) => (
                <div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    opacity: i === idx ? 1 : 0,
                    transform: i === idx ? "none" : "translateY(30px) scale(0.96)",
                    transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
                    pointerEvents: i === idx ? "auto" : "none",
                  }}
                >
                  {panel}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const d = HERO_BASE_DELAY;

  return (
    <div>
      <Splash />
      <PageBackdrop src="/assets/bg/deep-water.png" opacity={1} />

      {/* HERO */}
      <div className="relative min-h-[92vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover animate-[kenburns_20s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: "url('/assets/whale-hero-2.jpg')", backgroundPosition: "center 40%" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,31,0.35)_0%,rgba(10,20,31,0.55)_55%,#0a141f_100%)]" />
        <div className="relative min-h-[92vh] flex items-end box-border">
          <div className="max-w-[700px] pb-[84px] pl-16 text-left">
            <div
              className="rise-in inline-flex items-center gap-2 bg-[rgba(16,31,48,0.7)] border border-line-2 px-3.5 py-[7px] rounded-full mb-[26px] backdrop-blur-[6px]"
              style={{ animationDelay: `${d + 0.5}s` }}
            >
              <LiveDot />
              <span className="font-bold text-xs text-soft-fg tracking-[0.5px]">
                LIVE ON WORLD CUP 2026 · POWERED BY TXLINE
              </span>
            </div>
            <h1 className="font-heading font-bold text-[66px] leading-[1.06] m-0 mb-5 text-white">
              <span className="line-mask">
                <span className="line-up" style={{ animationDelay: `${d}s` }}>
                  The Home of
                </span>
              </span>
              <span className="line-mask">
                <span className="line-up" style={{ animationDelay: `${d + 0.15}s` }}>
                  World Cup
                </span>
              </span>
              <span className="line-mask pb-1.5">
                <span className="line-up text-accent" style={{ animationDelay: `${d + 0.3}s` }}>
                  Predictions.
                </span>
              </span>
            </h1>
            <p
              className="rise-in font-medium text-base leading-[1.65] text-[#dbe6f0] m-0 mb-8 max-w-[480px]"
              style={{ animationDelay: `${d + 0.6}s` }}
            >
              Bluefin is a decentralized prediction market protocol for sports and real-world events. Backed by
              real-time data. Settled on-chain.
            </p>
            <div className="rise-in flex items-center gap-4" style={{ animationDelay: `${d + 0.75}s` }}>
              <Magnetic>
                <Link
                  href="/markets"
                  className="inline-block bg-white !text-abyss font-extrabold text-xs tracking-[1.5px] uppercase px-[26px] py-[15px] rounded-full no-underline hover:!text-[#2f6fed]"
                >
                  Dive in the Ocean
                </Link>
              </Magnetic>
              <Magnetic>
                <a
                  href="#how-it-works"
                  className="inline-block bg-transparent border border-line-2 !text-soft-fg font-bold text-xs tracking-[1.5px] uppercase px-6 py-3.5 rounded-full no-underline hover:border-accent hover:!text-white"
                >
                  How it works ↓
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
        <div
          className="rise-in absolute bottom-[22px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ animationDelay: `${d + 1.2}s` }}
        >
          <span className="font-bold text-[10px] tracking-[2px] text-dim">SCROLL</span>
          <span className="block w-px h-[26px] bg-[linear-gradient(180deg,#4d9fff,transparent)] animate-[scrollhint_1.6s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* LIVE TRADES TICKER */}
      <Ticker />

      <div className="max-w-[1280px] mx-auto px-10">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 py-10 border-b border-line">
          {HERO_STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="bg-panel border border-line rounded-xl p-5 text-center hover:border-line-2 transition-colors">
                <CountUp
                  value={s.value}
                  decimals={s.decimals}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  className="font-heading font-bold text-[26px] text-white"
                />
                <div className="font-semibold text-xs text-dim uppercase tracking-[0.5px]">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* LIVE NOW */}
        <div className="py-14 border-b border-line">
          <Reveal>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <h2 className="font-heading font-bold text-[22px] text-fg m-0">Live Now</h2>
                <LiveDot size={8} />
              </div>
              <Link href="/markets" className="text-accent font-bold text-[13px] no-underline hover:text-accent-soft">
                View all markets →
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-3 gap-4">
            {LIVE_NOW.map((m, i) => (
              <Reveal key={i} delay={i * 100}>
                <Link
                  href={`/trade/${m.id}`}
                  className="bg-panel border border-line rounded-[14px] p-5 cursor-pointer flex flex-col gap-3.5 no-underline transition-all duration-[250ms] hover:-translate-y-[5px] hover:border-btn-border hover:shadow-[0_14px_34px_rgba(47,111,237,0.18)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-fg">{m.title}</div>
                    <span className="inline-flex items-center gap-1.5 font-heading font-bold text-[10px] tracking-[1px] bg-[rgba(34,197,94,0.15)] border border-live text-win px-2 py-[3px] rounded-[10px]">
                      <LiveDot size={5} />
                      LIVE
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-dim">World Cup 2026</div>
                  <div className="flex items-center gap-3">
                    <TeamBadge code={m.codeA} color={m.colorA} size="sm" />
                    <span className="font-heading font-bold text-2xl text-white">{m.score}</span>
                    <TeamBadge code={m.codeB} color={m.colorB} size="sm" />
                  </div>
                  <div className="font-semibold text-xs text-muted">{m.clock}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* PRODUCT MARKETING */}
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-14 items-center py-[88px] border-b border-line">
          <div>
            <Reveal>
              <h2 className="font-heading font-bold text-[40px] leading-[1.15] m-0 mb-[18px] text-fg">
                <span className="block">Built for Traders.</span>
                <span className="block text-accent">Backed by Truth.</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="font-medium text-base leading-relaxed text-muted m-0 mb-[30px]">
                Bluefin combines real-time data, deep liquidity, and on-chain settlement to bring you the most
                reliable prediction markets.
              </p>
            </Reveal>
            <div className="flex flex-col gap-[18px]">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={120 + i * 80}>
                  <div className="flex gap-3.5">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-btn border border-btn-border flex items-center justify-center text-base shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <div className="font-bold text-[15px] text-fg">{f.title}</div>
                      <div className="font-medium text-[13px] text-muted">{f.body}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {QUICK_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="bg-panel border border-line rounded-[14px] p-[26px] text-center hover:border-btn-border transition-colors">
                  <CountUp
                    value={s.value}
                    decimals={s.decimals}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    className="font-heading font-bold text-[28px] text-accent"
                  />
                  <div className="font-semibold text-xs text-dim uppercase">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <div id="about-section" className="py-[88px] border-b border-line grid grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <Reveal>
              <h2 className="font-heading font-bold text-[40px] m-0 mb-[18px] text-fg">About Bluefin</h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="font-medium text-base leading-[1.7] text-muted m-0 mb-9">
                Bluefin is a decentralized prediction market protocol designed to bring transparency, liquidity, and
                fairness to every prediction. We believe the future is uncertain, but markets can make it clearer.
              </p>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 mb-9">
              {[
                ["Decentralized", "No single entity controls the market."],
                ["Transparent", "All data and transactions are on-chain."],
                ["Secure", "Audited smart contracts and verifiable data."],
                ["Community Driven", "Built by traders, for traders."],
              ].map(([t, b], i) => (
                <Reveal key={t} delay={120 + i * 60}>
                  <div className="font-bold text-[15px] text-fg mb-1.5">{t}</div>
                  <div className="font-medium text-[13px] text-muted">{b}</div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={200}>
              <div className="flex gap-10 flex-wrap">
                {[
                  ["Backed by", "The Community"],
                  ["Built on", "Solana"],
                  ["Data by", "TxODDS · TxLINE"],
                ].map(([t, b]) => (
                  <div key={t}>
                    <div className="font-semibold text-xs text-dim uppercase mb-1">{t}</div>
                    <div className="font-heading font-bold text-base text-fg">{b}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src="/assets/orca-solo.jpg" alt="Orca" className="w-full h-full object-cover block" />
            </div>
          </Reveal>
        </div>

        {/* APP PREVIEW */}
        <div className="py-[88px] border-b border-line">
          <div className="text-center max-w-[600px] mx-auto mb-10">
            <Reveal>
              <h2 className="font-heading font-bold text-[40px] m-0 mb-3.5 text-fg">Inside the App</h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="font-medium text-base leading-relaxed text-muted m-0">
                Live match trading, shifting odds, top traders, and verified settlements — all in one screen.
              </p>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <div className="bg-panel border border-line rounded-[18px] p-2.5 max-w-[1000px] mx-auto mb-7 shadow-[0_30px_80px_rgba(4,10,18,0.6)]">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line mb-2.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="flex-1 text-center font-semibold text-xs text-dim">bluefin.trade — /trade</span>
                <span className="w-[52px]" />
              </div>
              <img src="/assets/trade-preview.png" alt="Bluefin trade UI" className="w-full rounded-[10px] block" />
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex justify-center">
              <Magnetic>
                <Link
                  href="/trade/arg-fra"
                  className="inline-block bg-accent !text-white font-heading font-bold text-sm px-[26px] py-3.5 rounded-full no-underline shadow-[0_8px_24px_rgba(47,111,237,0.35)] hover:bg-accent-soft transition-colors"
                >
                  Open Trade
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </div>

      {/* HOW IT WORKS — pinned scroll story */}
      <HowItWorks />

      <div className="max-w-[1280px] mx-auto px-10">
        {/* WHY BLUEFIN */}
        <Reveal>
          <div className="bg-panel border border-line rounded-2xl p-7 max-w-[820px] mx-auto mt-[72px]">
            <div className="font-heading font-bold text-base text-accent mb-4">Why Bluefin?</div>
            <div className="grid grid-cols-2 gap-3">
              {["Built for speed and scale", "Non-custodial", "Verifiable data you can trust", "Open and permissionless"].map(
                (t) => (
                  <div key={t} className="flex items-center gap-2.5 font-semibold text-sm text-soft-fg">
                    <span className="text-win">✓</span>
                    {t}
                  </div>
                )
              )}
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <div id="faq-section" className="pt-[88px] pb-24">
          <Reveal>
            <h2 className="font-heading font-bold text-[40px] m-0 mb-9 text-fg text-center">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <div className="max-w-[720px] mx-auto flex flex-col gap-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.id} delay={i * 60}>
                <div className="bg-panel border border-line rounded-xl overflow-hidden hover:border-line-2 transition-colors">
                  <button
                    onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                    className="w-full flex items-center justify-between px-[22px] py-[18px] cursor-pointer bg-transparent border-none text-left"
                  >
                    <span className="font-bold text-[15px] text-fg">{f.q}</span>
                    <span className="font-heading font-bold text-base text-dim">{openFaq === f.id ? "−" : "+"}</span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ gridTemplateRows: openFaq === f.id ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-[22px] pb-[18px] font-medium text-sm leading-relaxed text-muted">{f.a}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
