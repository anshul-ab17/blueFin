"use client";

import ConnectPrompt from "@/components/connect-prompt";
import StatBox from "@/components/stat-box";
import { useAppStore } from "@/lib/store";

export default function BetsPage() {
  const walletConnected = useAppStore((s) => s.walletConnected);
  const bets = useAppStore((s) => s.bets);

  const totalStaked = bets.reduce((a, b) => a + b.stake, 0);
  const totalPayout = bets.reduce((a, b) => a + b.payout, 0);

  return (
    <div className="max-w-[1000px] mx-auto px-10 pt-12 pb-20">
      <h1 className="font-heading font-bold text-[30px] m-0 mb-1.5 text-fg">My Bets</h1>
      <p className="font-medium text-[15px] text-muted m-0 mb-8">
        Positions are settled trustlessly on-chain once TxLINE confirms the match outcome.
      </p>

      {!walletConnected ? (
        <ConnectPrompt
          title="Connect your wallet to view your positions"
          subtitle="Your open bets, staked amounts, and settlement history will appear here."
          showIcon
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatBox label="Open Positions" value={bets.length} />
            <StatBox label="Total Staked" value={`$${totalStaked.toFixed(2)}`} />
            <StatBox label="Potential Payout" value={`$${totalPayout.toFixed(2)}`} valueClass="text-win" />
          </div>
          <div className="bg-panel border border-line rounded-[14px] overflow-hidden">
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
                className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr] px-5 py-4 border-b border-line items-center"
              >
                <div>
                  <div className="font-semibold text-[13px] text-fg">{bet.event}</div>
                  <div className="font-medium text-xs text-dim">{bet.category}</div>
                </div>
                <div className="font-semibold text-[13px] text-muted">{bet.outcome}</div>
                <div className="font-heading font-bold text-xs text-accent-soft">{bet.side}</div>
                <div className="font-semibold text-[13px] text-fg">${bet.stake.toFixed(2)}</div>
                <div className="font-semibold text-[13px] text-fg">{bet.odds.toFixed(2)}x</div>
                <div className="font-bold text-[13px] text-win">${bet.payout.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
