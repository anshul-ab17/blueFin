"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { MatchEvent, Outcome, Side } from "@bluefin/types";
import TeamBadge from "@/components/team-badge";
import FlagIcon, { hasFlag } from "@/components/flag-icon";
import LiveDot from "@/components/live-dot";
import PageBackdrop from "@/components/page-backdrop";
import { FillBar, HoverCard, Magnetic, Reveal } from "@/components/fx";
import OddsChart from "@/components/odds-chart";
import { RECENT_TRADES, SETTLEMENTS } from "@/lib/data";
import { useAppStore } from "@/lib/store";

const QUICK_STAKES = [10, 25, 50, 100];

function totalVolume(event: MatchEvent) {
  const n = event.categories.reduce((sum, c) => {
    const v = parseFloat(c.vol.replace(/[$,]/g, ""));
    return sum + v * (c.vol.endsWith("M") ? 1e6 : c.vol.endsWith("K") ? 1e3 : 1);
  }, 0);
  return n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${Math.round(n / 1e3)}K`;
}

export default function TradeView({
  event: staticEvent,
  initialCategoryId,
}: {
  event: MatchEvent;
  initialCategoryId?: string;
}) {
  // live odds from the API overlay the static fixture (same merge as /markets)
  const { data: liveEvents } = useQuery<MatchEvent[]>({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await fetch("/api/markets");
      if (!res.ok) throw new Error("failed to load markets");
      return res.json();
    },
    refetchInterval: 10_000,
  });
  const liveMatch = liveEvents?.find((x) => x.id === staticEvent.id);
  const event = liveMatch
    ? {
        ...staticEvent,
        categories: staticEvent.categories.map(
          (c) => liveMatch.categories.find((lc) => lc.id === c.id) ?? c
        ),
      }
    : staticEvent;

  const initialCategory =
    event.categories.find((c) => c.id === initialCategoryId) ?? event.categories[0];
  const [slip, setSlip] = useState({
    category: initialCategory.label,
    outcome: initialCategory.outcomes[0].label,
    side: "YES" as Side,
    odds: initialCategory.outcomes[0].yesOdds,
  });
  const [stake, setStake] = useState(25);
  const [placed, setPlaced] = useState(false);

  const walletConnected = useAppStore((s) => s.walletConnected);
  const placeBet = useAppStore((s) => s.placeBet);
  const flashToast = useAppStore((s) => s.flashToast);

  const isLive = event.status === "live";
  const isFinished = event.status === "finished";
  const winnerName =
    event.winner === "A" ? event.teamA : event.winner === "B" ? event.teamB : event.winner === "draw" ? "Draw" : null;

  const pick = (category: string, row: Outcome, side: Side) => {
    setSlip({ category, outcome: row.label, side, odds: side === "YES" ? row.yesOdds : row.noOdds });
    setPlaced(false);
  };

  const placeOrder = () => {
    if (!walletConnected) {
      flashToast("Connect your wallet to trade");
      return;
    }
    placeBet({
      event: `${event.teamA} vs ${event.teamB}`,
      category: slip.category,
      outcome: slip.outcome,
      side: slip.side,
      stake,
      odds: slip.odds,
    });
    setPlaced(true);
    flashToast(`Order placed — ${slip.side} ${slip.outcome}`);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 pt-8 pb-20">
      <PageBackdrop src="/assets/bg/water5.webp" />

      {/* MATCH HEADER */}
      <Reveal>
        <div className="bg-panel border border-line rounded-2xl px-5 md:px-7 py-[22px] flex flex-wrap items-center justify-center md:justify-between gap-4 mb-[22px]">
          <div className="flex items-center gap-4">
            {hasFlag(event.codeA)
              ? <FlagIcon code={event.codeA} size="lg" />
              : <TeamBadge code={event.codeA} color={event.colorA} size="md" />}
            <div className="text-center">
              {(isLive || isFinished) && event.score ? (
                <>
                  <div className="font-heading font-bold text-[34px] leading-none text-white">
                    {event.score.a} — {event.score.b}
                  </div>
                  <div className={`font-semibold text-xs mt-1 ${isFinished ? "text-dim" : "text-muted"}`}>
                    {isFinished ? "FINAL" : event.timeRemaining}
                  </div>
                </>
              ) : (
                <div className="font-semibold text-sm text-muted">vs</div>
              )}
            </div>
            {hasFlag(event.codeB)
              ? <FlagIcon code={event.codeB} size="lg" />
              : <TeamBadge code={event.codeB} color={event.colorB} size="md" />}
          </div>
          <div className="text-center">
            <div className="font-heading font-bold text-base text-fg">
              {event.teamA} vs {event.teamB}
            </div>
            <div className="font-semibold text-xs text-dim">{event.dateLabel}</div>
          </div>
          <div className="flex items-center gap-3.5">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 font-heading font-bold text-[11px] tracking-[1px] bg-[rgba(34,197,94,0.15)] border border-live text-win px-3 py-[5px] rounded-xl">
                <LiveDot size={6} />
                LIVE
              </span>
            )}
            {isFinished && (
              <span className="inline-flex items-center gap-1.5 font-heading font-bold text-[11px] tracking-[1px] bg-panel-2 border border-line-2 text-muted px-3 py-[5px] rounded-xl">
                ✓ FINAL
              </span>
            )}
            <div className="text-right">
              <div className="font-semibold text-[11px] text-dim uppercase">Volume</div>
              <div className="font-heading font-bold text-[15px] text-fg">{totalVolume(event)}</div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-[22px] items-start">
        {/* MARKETS */}
        <div className="flex flex-col gap-3.5">
          {(() => {
            const activeCat = event.categories.find((c) => c.label === slip.category) ?? event.categories[0];
            return (
              <OddsChart
                marketId={event.id}
                category={activeCat.id}
                labels={activeCat.outcomes.map((o) => o.label)}
                finished={isFinished}
                finalPcts={activeCat.outcomes.map((o) => o.pct)}
              />
            );
          })()}
          {event.categories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 80}>
              <HoverCard className="bg-panel border border-line rounded-[14px] p-5 transition-all duration-[250ms] hover:-translate-y-1 hover:border-btn-border">
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <div className="font-bold text-xs text-accent uppercase tracking-[0.5px] mb-1 group-hover:text-accent-soft transition-colors duration-300">{cat.label}</div>
                    <div className="relative overflow-hidden font-bold text-[15px] text-fg h-[1.4em]">
                      <span className="block transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">{cat.question}</span>
                      <span className="block absolute inset-0 translate-y-full transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 text-accent-soft" aria-hidden>{cat.question}</span>
                    </div>
                  </div>
                  <div className="font-semibold text-xs text-dim group-hover:text-muted transition-colors duration-300">{cat.vol} Vol</div>
                </div>
                <div className="flex flex-col gap-2.5">
                  {cat.outcomes.map((row, j) => (
                    <div key={row.label} className="flex flex-wrap items-center gap-2 md:gap-3.5">
                      <div className="w-[110px] font-semibold text-[13px] text-soft-fg group-hover:text-fg transition-colors duration-300">{row.label}</div>
                      <FillBar pct={row.pct} barClass={row.result === "YES" ? "bg-win" : j === 0 ? "bg-accent" : "bg-faint"} />
                      <span className="font-heading font-bold text-xs text-muted w-9 text-right group-hover:text-accent-soft transition-colors duration-300">{row.pct}%</span>
                      {isFinished ? (
                        <span
                          className={`font-heading font-bold text-[11px] tracking-[0.5px] px-3 py-[7px] rounded-md ${
                            row.result === "YES"
                              ? "bg-[rgba(34,197,94,0.15)] border border-live text-win"
                              : "bg-[#161f2c] border border-line-2 text-dim"
                          }`}
                        >
                          {row.result === "YES" ? "WON" : "LOST"}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => pick(cat.label, row, "YES")}
                            className="bg-btn border border-btn-border text-accent-soft font-heading font-bold text-xs px-3 py-[7px] rounded-md cursor-pointer transition-all hover:bg-[#24498a] hover:shadow-[0_0_16px_rgba(77,159,255,0.3)]"
                          >
                            YES {row.yesOdds.toFixed(2)}x
                          </button>
                          <button
                            onClick={() => pick(cat.label, row, "NO")}
                            className="bg-[#161f2c] border border-line-2 text-no font-heading font-bold text-xs px-3 py-[7px] rounded-md cursor-pointer transition-all hover:bg-[#1f2a3a] hover:shadow-[0_0_16px_rgba(217,139,139,0.25)]"
                          >
                            NO {row.noOdds.toFixed(2)}x
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </HoverCard>
            </Reveal>
          ))}

          <Reveal delay={200}>
            <div className="flex items-center gap-2.5 px-5 py-4 bg-panel border border-line rounded-xl">
              <span className="text-base">🛡️</span>
              <div className="flex-1 font-semibold text-[13px] text-muted">
                Match data verified via TxLINE SSE stream, anchored on Solana.
              </div>
              <Link
                href="/proofs"
                className="bg-transparent border border-line-2 !text-accent-soft font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer no-underline"
              >
                View Proof
              </Link>
            </div>
          </Reveal>
        </div>

        {/* TRADE SLIP + SIDE PANELS */}
        <div className="lg:sticky lg:top-[86px] flex flex-col gap-3.5">
          {isFinished ? (
            <Reveal delay={100}>
              <div className="bg-panel border border-line rounded-2xl p-[22px] text-center">
                <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-[rgba(34,197,94,0.15)] border border-live flex items-center justify-center text-win text-xl">✓</div>
                <div className="font-heading font-bold text-lg text-accent-soft mb-1">Outcome: {winnerName}</div>
                <div className="font-semibold text-[13px] text-muted mb-3.5">Match Result · settled on-chain</div>
                <div className="bg-[#0a1a29] border border-line rounded-[10px] p-3.5 mb-3.5 text-left">
                  <div className="font-semibold text-[11px] text-dim uppercase mb-1.5">Final Score</div>
                  <div className="font-heading font-bold text-xl text-white">
                    {event.teamA} {event.score?.a} — {event.score?.b} {event.teamB}
                  </div>
                </div>
                <Link
                  href="/proofs"
                  className="block w-full bg-transparent border border-line-2 !text-accent-soft font-bold text-sm py-3 rounded-xl no-underline hover:border-btn-border transition-colors"
                >
                  View Settlement Proof
                </Link>
              </div>
            </Reveal>
          ) : (
          <Reveal delay={100}>
            <div className="bg-panel border border-btn-border rounded-2xl p-[22px] shadow-[0_16px_44px_rgba(47,111,237,0.14)]">
              <div className="font-heading font-bold text-base text-fg mb-3.5">Place a Trade</div>
              <div className="bg-[#0a1a29] border border-line rounded-[10px] p-3.5 mb-3.5">
                <div className="font-semibold text-[11px] text-dim uppercase mb-1.5">Selection</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-fg">{slip.outcome}</div>
                    <div className="font-medium text-xs text-dim">{slip.category}</div>
                  </div>
                  <span
                    className={`font-heading font-bold text-xs px-2.5 py-[5px] rounded-md ${
                      slip.side === "YES" ? "bg-btn text-accent-soft" : "bg-[#161f2c] text-no"
                    }`}
                  >
                    {slip.side} {slip.odds.toFixed(2)}x
                  </span>
                </div>
              </div>
              <div className="font-semibold text-[11px] text-dim uppercase mb-1.5">Stake (USDC)</div>
              <input
                type="number"
                min={1}
                value={stake}
                onChange={(e) => setStake(Number(e.target.value) || 0)}
                className="w-full box-border px-3.5 py-[13px] rounded-[10px] border border-line bg-[#0a1624] text-fg font-heading font-bold text-lg mb-2.5"
              />
              <div className="flex gap-2 mb-4">
                {QUICK_STAKES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setStake(q)}
                    className="flex-1 bg-[#0a1a29] border border-line text-muted font-bold text-xs py-2 rounded-lg cursor-pointer transition-colors hover:border-btn-border hover:text-fg"
                  >
                    ${q}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center bg-panel-2 border border-btn-border rounded-[10px] px-4 py-3.5 mb-4">
                <span className="font-semibold text-[13px] text-muted">Potential payout</span>
                <span className="font-heading font-bold text-lg text-win">${(stake * slip.odds).toFixed(2)}</span>
              </div>
              <Magnetic className="w-full">
                <button
                  onClick={placeOrder}
                  className="w-full bg-[linear-gradient(135deg,#2f6fed,#4d9fff)] border-none text-white font-heading font-bold text-sm tracking-[1px] py-[15px] rounded-xl cursor-pointer shadow-[0_8px_24px_rgba(47,111,237,0.35)] hover:shadow-[0_10px_32px_rgba(47,111,237,0.55)] transition-shadow"
                >
                  PLACE TRADE
                </button>
              </Magnetic>
              {placed && (
                <div className="rise-in mt-3 text-center font-bold text-[13px] text-win">
                  ✓ Trade placed — settling on-chain
                </div>
              )}
            </div>
          </Reveal>
          )}

          <Reveal delay={180}>
            <div className="bg-panel border border-line rounded-[14px] p-[18px]">
              <div className="font-heading font-bold text-[13px] text-fg mb-3">Recent Activity</div>
              <div className="flex flex-col gap-2.5">
                {RECENT_TRADES.slice(0, 4).map((tr, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-heading font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        tr.side === "YES" ? "bg-btn text-accent-soft" : "bg-[#161f2c] text-no"
                      }`}
                    >
                      {tr.side}
                    </span>
                    <span className="flex-1 font-semibold text-muted">{tr.label}</span>
                    <span className="font-semibold text-fg">{tr.amount}</span>
                    <span className="font-medium text-dim">{tr.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="bg-panel border border-line rounded-[14px] p-[18px]">
              <div className="font-heading font-bold text-[13px] text-fg mb-3">Volume by Market</div>
              <div className="flex flex-col gap-2.5">
                {event.categories.map((cat) => {
                  const top = cat.outcomes.reduce((a, b) => (b.pct > a.pct ? b : a), cat.outcomes[0]);
                  return (
                    <div key={cat.id} className="flex items-center justify-between">
                      <div className="font-semibold text-[13px] text-muted">{cat.label}</div>
                      <div className="text-right">
                        <div className="font-heading font-bold text-[13px] text-fg">{cat.vol}</div>
                        <div className="font-semibold text-[11px] text-accent-soft">{top.label} {top.pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="bg-panel border border-line rounded-[14px] p-[18px]">
              <div className="font-heading font-bold text-[13px] text-fg mb-3">Recent Settlements</div>
              <div className="flex flex-col gap-2.5">
                {SETTLEMENTS.map((s) => (
                  <div key={s.event}>
                    <div className="font-semibold text-[13px] text-fg">{s.event}</div>
                    <div className="flex justify-between">
                      <span className="font-medium text-xs text-muted">{s.outcome}</span>
                      <span className="font-medium text-xs text-dim">{s.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
