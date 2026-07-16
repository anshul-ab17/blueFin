"use client";

import Link from "next/link";
import Footer from "@/components/footer";
import PageBackdrop from "@/components/page-backdrop";
import { Reveal } from "@/components/fx";

const LIFECYCLE = [
  { num: "01", title: "Discover", body: "Every World Cup 2026 fixture becomes a set of markets — match result, total goals, scorers. Markets are created automatically from the TxLINE fixtures feed." },
  { num: "02", title: "Trade", body: "Buy YES or NO at a quoted multiplier. Odds are derived from TxLINE StablePrice data in real time; your stake and quote are locked into an on-chain escrow the moment you confirm." },
  { num: "03", title: "Resolve", body: "When the final whistle blows, the result arrives on the TxLINE scores stream. Bluefin fetches a Merkle proof for the result and verifies it against TxODDS' on-chain validation account." },
  { num: "04", title: "Settle", body: "The settlement instruction lands on Solana with the proof root attached. Winning positions become claimable directly from escrow — no middlemen, no claims process." },
];

const TXLINE_POINTS = [
  {
    title: "Authenticated data session",
    body: "Bluefin's backend opens a guest session with TxLINE, subscribes on-chain on Solana, signs an activation message with the same wallet, and receives an API token. Every data request Bluefin makes is tied to that verifiable on-chain subscription.",
  },
  {
    title: "Live streams, not polls",
    body: "Scores and odds arrive over Server-Sent Events streams — the same push channel Bluefin relays to your browser. When a goal is scored, the market moves within seconds, not minutes.",
  },
  {
    title: "Merkle-proven results",
    body: "TxODDS batches every score update into Merkle trees and anchors the roots on Solana. Bluefin never settles a market on an unproven result: it fetches the proof for the exact statistic, and the settlement transaction carries that root on-chain.",
  },
  {
    title: "Solana anchoring",
    body: "Because TxODDS publishes validation accounts on Solana, anyone — not just Bluefin — can re-verify the data behind any settlement. The proof viewer on the Stats & Proofs page shows exactly this.",
  },
];

const STACK = [
  { layer: "Frontend", tech: "Next.js · Tailwind · Solana wallet adapter", role: "Trading interface, live market views, proof viewer" },
  { layer: "Backend", tech: "Rust · Axum · SQLite", role: "TxLINE ingestion, market pricing, positions, settlement worker" },
  { layer: "Data", tech: "TxODDS TxLINE", role: "Fixtures, real-time scores and odds, Merkle validation proofs" },
  { layer: "Chain", tech: "Solana · Anchor · USDT", role: "Escrow, positions, proof-anchored settlement, payouts" },
];

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal>
      <div className="font-bold text-xs tracking-[2px] text-accent uppercase mb-2.5">{kicker}</div>
      <h2 className="font-heading font-bold text-[34px] m-0 mb-5 text-fg">{title}</h2>
    </Reveal>
  );
}

export default function DocsPage() {
  return (
    <div>
      <PageBackdrop src="/assets/bg/deep-water.png" opacity={1} />
      <div className="max-w-[860px] mx-auto px-10">
        {/* Intro */}
        <div className="pt-20 pb-14 border-b border-line">
          <Reveal>
            <div className="font-bold text-xs tracking-[2px] text-accent uppercase mb-3">Documentation</div>
            <h1 className="font-heading font-bold text-[48px] leading-[1.1] m-0 mb-5 text-fg">
              How Bluefin works, <span className="text-accent">end to end.</span>
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="font-medium text-base leading-[1.75] text-muted m-0">
              Bluefin is a decentralized prediction market for World Cup 2026. You buy YES or NO shares in real match
              outcomes; when a verified result lands on-chain, winning positions settle automatically. Under the hood,
              every price, result, and payout traces back to two things: real-time data from TxODDS' TxLINE network,
              and trustless settlement on Solana.
            </p>
          </Reveal>
        </div>

        {/* Lifecycle */}
        <div className="py-14 border-b border-line">
          <SectionHeading kicker="The lifecycle of a market" title="From fixture to payout" />
          <div className="flex flex-col gap-4">
            {LIFECYCLE.map((s, i) => (
              <Reveal key={s.num} delay={i * 70}>
                <div className="flex gap-5 bg-panel border border-line rounded-2xl p-6">
                  <div className="font-heading font-bold text-[28px] leading-none text-[rgba(77,159,255,0.35)] shrink-0 w-11">{s.num}</div>
                  <div>
                    <div className="font-heading font-bold text-[17px] text-fg mb-1.5">{s.title}</div>
                    <p className="font-medium text-sm leading-[1.7] text-muted m-0">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* TxLINE connection */}
        <div className="py-14 border-b border-line">
          <SectionHeading kicker="Powered by TxODDS" title="The TxLINE connection" />
          <Reveal delay={60}>
            <p className="font-medium text-[15px] leading-[1.75] text-muted m-0 mb-7">
              TxLINE is TxODDS' cryptographically verifiable sports data network. It is Bluefin's single source of
              truth: fixtures define the markets, StablePrice odds drive the quotes, and Merkle-proven score data
              decides every settlement. Bluefin is a launch integration built for the TxODDS Prediction Markets &amp;
              Settlement track.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {TXLINE_POINTS.map((p, i) => (
              <Reveal key={p.title} delay={100 + i * 70}>
                <div className="bg-panel border border-line rounded-2xl p-6 h-full box-border">
                  <div className="font-heading font-bold text-[15px] text-accent-soft mb-2">{p.title}</div>
                  <p className="font-medium text-[13px] leading-[1.7] text-muted m-0">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="py-14 border-b border-line">
          <SectionHeading kicker="Under the hood" title="The stack" />
          <Reveal delay={80}>
            <div className="bg-panel border border-line rounded-2xl overflow-hidden">
              {STACK.map((r, i) => (
                <div
                  key={r.layer}
                  className={`grid grid-cols-[110px_1fr_1.2fr] gap-4 px-6 py-4 items-baseline ${i > 0 ? "border-t border-line" : ""}`}
                >
                  <div className="font-heading font-bold text-[13px] tracking-[1px] uppercase text-accent">{r.layer}</div>
                  <div className="font-semibold text-[13px] text-fg">{r.tech}</div>
                  <div className="font-medium text-[13px] text-muted">{r.role}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* CTA */}
        <div className="py-16 text-center">
          <Reveal>
            <h2 className="font-heading font-bold text-[28px] m-0 mb-3 text-fg">See it live</h2>
            <p className="font-medium text-[15px] text-muted m-0 mb-7">
              Browse the markets, or inspect a settlement proof yourself.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/markets"
                className="inline-block bg-accent !text-white font-heading font-bold text-sm px-6 py-3 rounded-full no-underline hover:bg-accent-soft transition-colors"
              >
                Explore Markets
              </Link>
              <Link
                href="/proofs"
                className="inline-block border border-line-2 !text-soft-fg font-bold text-[13px] px-6 py-3 rounded-full no-underline hover:border-accent hover:!text-white transition-colors"
              >
                View Proofs
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
      <Footer />
    </div>
  );
}
