"use client";

import Link from "next/link";
import ConnectPrompt from "@/components/connect-prompt";
import PageBackdrop from "@/components/page-backdrop";
import StatBox from "@/components/stat-box";
import { CountUp, Magnetic, PageTitle, Reveal } from "@/components/fx";
import { useAppStore } from "@/lib/store";

export default function BetsPage() {
  const walletConnected = useAppStore((s) => s.walletConnected);
  const bets = useAppStore((s) => s.bets);

  const totalStaked = bets.reduce((a, b) => a + b.stake, 0);
  const totalPayout = bets.reduce((a, b) => a + b.payout, 0);

  return (
    <div className="max-w-[1000px] mx-auto px-5 md:px-10 pt-12 pb-20">
      <PageBackdrop src="/assets/bg/water4.webp" />
      <PageTitle
        title="My Bets"
        subtitle="Positions are settled trustlessly on-chain once TxLINE confirms the match outcome."
      />

      {!walletConnected ? (
        <ConnectPrompt
          title="Connect your wallet to view your positions"
          subtitle="Your open bets, staked amounts, and settlement history will appear here."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Reveal>
              <StatBox label="Open Positions" value={<CountUp value={bets.length} />} />
            </Reveal>
            <Reveal delay={80}>
              <StatBox label="Total Staked" value={<CountUp value={totalStaked} decimals={2} prefix="$" />} />
            </Reveal>
            <Reveal delay={160}>
              <StatBox
                label="Potential Payout"
                value={<CountUp value={totalPayout} decimals={2} prefix="$" />}
                valueClass="text-win"
              />
            </Reveal>
          </div>
          <Reveal delay={220}>
            <div className="bg-panel border border-line rounded-[14px] overflow-x-auto">
              <div className="min-w-[640px]">
              <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr] px-5 py-3.5 font-bold text-[11px] text-dim uppercase tracking-[0.5px] border-b border-line">
                <div>Market</div>
                <div>Outcome</div>
                <div>Side</div>
                <div>Stake</div>
                <div>Odds</div>
                <div>Payout</div>
              </div>
              {bets.map((bet) => (
                <div
                  key={bet.id}
                  className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr] px-5 py-4 border-b border-line items-center transition-colors hover:bg-panel-2"
                >
                  <div>
                    <div className="font-semibold text-[13px] text-fg">{bet.event}</div>
                    <div className="font-medium text-xs text-dim">{bet.category}</div>
                  </div>
                  <div className="font-semibold text-[13px] text-muted">{bet.outcome}</div>
                  <div>
                    <span
                      className={`font-heading font-bold text-[11px] px-2 py-[3px] rounded-[5px] ${
                        bet.side === "YES" ? "bg-btn text-accent-soft" : "bg-[#161f2c] text-no"
                      }`}
                    >
                      {bet.side}
                    </span>
                  </div>
                  <div className="font-semibold text-[13px] text-fg">${bet.stake.toFixed(2)}</div>
                  <div className="font-semibold text-[13px] text-fg">{bet.odds.toFixed(2)}x</div>
                  <div className="font-bold text-[13px] text-win">${bet.payout.toFixed(2)}</div>
                </div>
              ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex justify-center mt-7">
              <Magnetic>
                <Link
                  href="/markets"
                  className="inline-block bg-btn border border-btn-border !text-fg font-heading font-bold text-[13px] px-6 py-3 rounded-full no-underline hover:bg-[#24498a] transition-colors"
                >
                  Find More Markets
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
