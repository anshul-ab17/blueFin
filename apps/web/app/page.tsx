"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/footer";
import LiveDot from "@/components/live-dot";
import TeamBadge from "@/components/team-badge";
import { FAQS, LIVE_NOW } from "@/lib/data";

const HERO_STATS = [
  { value: "$24.85M", label: "Total Volume" },
  { value: "12.8K", label: "Traders" },
  { value: "156", label: "Active Markets" },
  { value: "98.7%", label: "Settlement Accuracy" },
];

const FEATURES = [
  { icon: "📡", title: "Real-time Data Feeds", body: "Streams from verified sources worldwide via TxLINE SSE." },
  { icon: "⛓️", title: "On-chain Settlement", body: "Transparent. Trustless. Instant — on Solana." },
  { icon: "🌊", title: "Deep Liquidity", body: "Trade with confidence. Anytime." },
  { icon: "🌍", title: "Global Markets", body: "From local matches to international tournaments." },
];

const QUICK_STATS = [
  { value: "24/7", label: "Markets Open" },
  { value: "100+", label: "Countries" },
  { value: "50K+", label: "Predictions" },
  { value: "$24.8M+", label: "Total Volume" },
];

const STEPS = [
  { icon: "🔍", title: "1. Discover", body: "Browse markets and find an outcome you believe in." },
  { icon: "📈", title: "2. Trade", body: "Buy shares in outcomes at the best available prices." },
  { icon: "🛡️", title: "3. Resolve", body: "When the event ends, results are verified by TxLINE data feeds." },
  { icon: "✅", title: "4. Settle", body: "Payouts are automatically settled on-chain. No middlemen." },
];

function Splash() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-deep overflow-hidden flex flex-col items-center justify-center gap-[18px]">
      <div className="absolute top-[72%] left-1/2 w-[200vw] h-[200vw] -ml-[100vw] rounded-[43%] bg-[rgba(27,58,107,0.55)] animate-waverotate" />
      <div className="absolute top-[76%] left-1/2 w-[200vw] h-[200vw] -ml-[100vw] rounded-[41%] bg-[rgba(47,111,237,0.3)] animate-waverotate-rev" />
      <div className="relative flex flex-col items-center gap-[18px]">
        <img src="/assets/bluefin-orca.svg" alt="Bluefin" className="w-[110px] h-[110px] object-contain orca-tint animate-bobfloat" />
        <div className="font-heading font-bold text-[22px] tracking-[8px] text-fg">BLUEFIN</div>
        <div className="font-medium text-[13px] text-muted">Loading the markets…</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      <Splash />

      {/* HERO */}
      <div className="relative min-h-[680px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: "url('/assets/whale-hero-2.jpg')", backgroundPosition: "center 40%" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,31,0.35)_0%,rgba(10,20,31,0.55)_55%,#0a141f_100%)]" />
        <div className="relative min-h-[680px] flex items-end box-border">
          <div className="max-w-[620px] pb-[74px] pl-16 text-left">
            <div className="inline-flex items-center gap-2 bg-[rgba(16,31,48,0.7)] border border-line-2 px-3.5 py-[7px] rounded-full mb-[26px]">
              <LiveDot />
              <span className="font-bold text-xs text-soft-fg tracking-[0.5px]">
                LIVE ON WORLD CUP 2026 · POWERED BY TXLINE
              </span>
            </div>
            <h1 className="font-heading font-bold text-[54px] leading-[1.12] m-0 mb-[18px] text-white">
              <span className="block">Predict the Future.</span>
              <span className="block text-accent">Trade with Confidence.</span>
            </h1>
            <p className="font-medium text-base leading-relaxed text-[#dbe6f0] m-0 mb-[30px] max-w-[480px]">
              Bluefin is a decentralized prediction market protocol for sports and real-world events. Backed by
              real-time data. Settled on-chain.
            </p>
            <Link
              href="/markets"
              className="inline-block bg-white border-none !text-abyss font-extrabold text-xs tracking-[1.5px] uppercase px-[22px] py-[13px] rounded-[10px] cursor-pointer no-underline hover:!text-accent"
            >
              Dive in the Ocean
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-10">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 pt-2 pb-10 border-b border-line">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="bg-panel border border-line rounded-xl p-5 text-center">
              <div className="font-heading font-bold text-[26px] text-white">{s.value}</div>
              <div className="font-semibold text-xs text-dim uppercase tracking-[0.5px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* LIVE NOW */}
        <div className="py-14 border-b border-line">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading font-bold text-[22px] text-fg m-0">Live Now</h2>
              <LiveDot size={8} />
            </div>
            <Link href="/markets" className="text-accent font-bold text-[13px] no-underline hover:text-accent-soft">
              View all markets →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {LIVE_NOW.map((m, i) => (
              <Link
                key={i}
                href={`/trade/${m.id}`}
                className="bg-panel border border-line rounded-[14px] p-5 cursor-pointer flex flex-col gap-3.5 no-underline hover:border-line-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-fg">{m.title}</div>
                  <span className="font-heading font-bold text-[10px] tracking-[1px] bg-[rgba(34,197,94,0.15)] border border-live text-win px-2 py-[3px] rounded-[10px]">
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
            ))}
          </div>
        </div>

        {/* PRODUCT MARKETING */}
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-14 items-center py-[88px] border-b border-line">
          <div>
            <h2 className="font-heading font-bold text-[40px] leading-[1.15] m-0 mb-[18px] text-fg">
              <span className="block">Built for Traders.</span>
              <span className="block">Backed by Truth.</span>
            </h2>
            <p className="font-medium text-base leading-relaxed text-muted m-0 mb-[30px]">
              Bluefin combines real-time data, deep liquidity, and on-chain settlement to bring you the most reliable
              prediction markets.
            </p>
            <div className="flex flex-col gap-[18px]">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-3.5">
                  <div className="w-[38px] h-[38px] rounded-[10px] bg-btn border border-btn-border flex items-center justify-center text-base shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-fg">{f.title}</div>
                    <div className="font-medium text-[13px] text-muted">{f.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {QUICK_STATS.map((s) => (
              <div key={s.label} className="bg-panel border border-line rounded-[14px] p-[26px] text-center">
                <div className="font-heading font-bold text-[28px] text-accent">{s.value}</div>
                <div className="font-semibold text-xs text-dim uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <div id="about-section" className="py-[88px] border-b border-line grid grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <h2 className="font-heading font-bold text-[40px] m-0 mb-[18px] text-fg">About Bluefin</h2>
            <p className="font-medium text-base leading-[1.7] text-muted m-0 mb-9">
              Bluefin is a decentralized prediction market protocol designed to bring transparency, liquidity, and
              fairness to every prediction. We believe the future is uncertain, but markets can make it clearer.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-9">
              {[
                ["Decentralized", "No single entity controls the market."],
                ["Transparent", "All data and transactions are on-chain."],
                ["Secure", "Audited smart contracts and verifiable data."],
                ["Community Driven", "Built by traders, for traders."],
              ].map(([t, b]) => (
                <div key={t}>
                  <div className="font-bold text-[15px] text-fg mb-1.5">{t}</div>
                  <div className="font-medium text-[13px] text-muted">{b}</div>
                </div>
              ))}
            </div>
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
          </div>
          <div className="rounded-2xl overflow-hidden aspect-square">
            <img src="/assets/orca-solo.jpg" alt="Orca" className="w-full h-full object-cover block" />
          </div>
        </div>

        {/* APP PREVIEW */}
        <div className="py-[88px] border-b border-line">
          <div className="text-center max-w-[600px] mx-auto mb-10">
            <h2 className="font-heading font-bold text-[40px] m-0 mb-3.5 text-fg">Inside the App</h2>
            <p className="font-medium text-base leading-relaxed text-muted m-0">
              Live match trading, shifting odds, top traders, and verified settlements — all in one screen.
            </p>
          </div>
          <div className="bg-panel border border-line rounded-[18px] p-2.5 max-w-[1000px] mx-auto mb-7">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line mb-2.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="flex-1 text-center font-semibold text-xs text-dim">bluefin.trade — /trade</span>
              <span className="w-[52px]" />
            </div>
            <img src="/assets/trade-preview.png" alt="Bluefin trade UI" className="w-full rounded-[10px] block" />
          </div>
          <div className="flex justify-center">
            <Link
              href="/trade/arg-fra"
              className="bg-accent border-none !text-white font-heading font-bold text-sm px-[26px] py-3.5 rounded-[10px] cursor-pointer no-underline"
            >
              Open Trade
            </Link>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div id="how-it-works" className="py-[88px] border-b border-line">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-[40px] m-0 mb-2.5 text-fg">How Bluefin Works</h2>
            <p className="font-medium text-base text-muted m-0">Simple. Transparent. Trustless.</p>
          </div>
          <div className="grid grid-cols-4 gap-6 mb-11">
            {STEPS.map((s) => (
              <div key={s.title} className="text-center">
                <div className="w-[74px] h-[74px] rounded-full border border-btn-border bg-panel flex items-center justify-center mx-auto mb-4 text-[26px]">
                  {s.icon}
                </div>
                <div className="font-heading font-bold text-base text-fg mb-1.5">{s.title}</div>
                <div className="font-medium text-[13px] leading-normal text-muted">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="bg-panel border border-line rounded-2xl p-7 max-w-[820px] mx-auto">
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
        </div>

        {/* FAQ */}
        <div id="faq-section" className="pt-[88px] pb-24">
          <h2 className="font-heading font-bold text-[40px] m-0 mb-9 text-fg text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-[720px] mx-auto flex flex-col gap-3">
            {FAQS.map((f) => (
              <div key={f.id} className="bg-panel border border-line rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                  className="w-full flex items-center justify-between px-[22px] py-[18px] cursor-pointer bg-transparent border-none text-left"
                >
                  <span className="font-bold text-[15px] text-fg">{f.q}</span>
                  <span className="font-heading font-bold text-base text-dim">{openFaq === f.id ? "−" : "+"}</span>
                </button>
                {openFaq === f.id && (
                  <div className="px-[22px] pb-[18px] font-medium text-sm leading-relaxed text-muted">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
