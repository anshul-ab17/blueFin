"use client";

import { useState } from "react";
import Link from "next/link";
import type { MatchEvent, Outcome, Side } from "@bluefin/types";
import TeamBadge from "@/components/team-badge";
import LiveDot from "@/components/live-dot";
import { useAppStore } from "@/lib/store";
import { EVENTS, RECENT_TRADES, SETTLEMENTS, TOP_TRADERS } from "@/lib/data";

export default function TradeView({
  event,
  initialCategoryId,
}: {
  event: MatchEvent;
  initialCategoryId?: string;
}) {
  const category =
    event.categories.find((c) => c.id === initialCategoryId) ?? event.categories[0];
  const [activeCategoryId, setActiveCategoryId] = useState(category.id);
  const activeCategory =
    event.categories.find((c) => c.id === activeCategoryId) ?? event.categories[0];

  const [slip, setSlip] = useState<{ label: string; side: Side; odds: number } | null>(null);
  const [stake, setStake] = useState(25);

  const walletConnected = useAppStore((s) => s.walletConnected);
  const placeBet = useAppStore((s) => s.placeBet);
  const flashToast = useAppStore((s) => s.flashToast);

  const otherEvent = EVENTS.find((e) => e.id !== event.id);
  const isLive = event.status === "live";

  const openSlip = (row: Outcome, side: Side) => {
    if (!walletConnected) {
      flashToast("Connect your wallet to trade");
      return;
    }
    setSlip({ label: row.label, side, odds: side === "YES" ? row.yesOdds : row.noOdds });
    setStake(25);
  };

  const placeOrder = () => {
    if (!slip) return;
    placeBet({
      event: `${event.teamA} vs ${event.teamB}`,
      category: activeCategory.label,
      outcome: slip.label,
      side: slip.side,
      stake,
      odds: slip.odds,
    });
    setSlip(null);
    flashToast(`Order placed — ${slip.side} ${slip.label}`);
  };

  return (
    <div>
      {/* HERO */}
      <div className="relative min-h-[340px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: "url('/assets/whale.jpg')", backgroundPosition: "center 35%" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,31,0.55)_0%,rgba(10,20,31,0.75)_60%,rgba(10,20,31,0.97)_100%)]" />
        <div className="relative min-h-[340px] flex flex-col justify-between px-10 pt-[26px] pb-[34px] box-border">
          <div className="font-semibold text-[13px] text-[#a9c3e0] tracking-[0.5px]">
            TxODDS Powered — Ride the Waves of Chance.
          </div>
          <div>
            {otherEvent && (
              <div className="flex items-center gap-3 mb-3.5">
                <Link
                  href={`/trade/${otherEvent.id}`}
                  className="flex items-center gap-2 bg-[rgba(16,31,48,0.7)] border border-line-2 !text-muted font-semibold text-[13px] px-4 py-2 rounded-[20px] cursor-pointer no-underline"
                >
                  <TeamBadge code={otherEvent.codeA} color={otherEvent.colorA} size="xs" />
                  {otherEvent.teamA} vs {otherEvent.teamB}
                  <TeamBadge code={otherEvent.codeB} color={otherEvent.colorB} size="xs" />
                </Link>
              </div>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="flex items-center gap-3 font-heading font-bold text-[30px] m-0 text-white">
                <TeamBadge code={event.codeA} color={event.colorA} size="md" />
                {event.teamA} vs {event.teamB}
                <TeamBadge code={event.codeB} color={event.colorB} size="md" />
              </h1>
              {isLive ? (
                <div className="flex items-center gap-2 bg-[rgba(34,197,94,0.15)] border border-live px-3.5 py-1.5 rounded-[20px]">
                  <LiveDot />
                  <span className="font-heading font-bold text-xs text-win">LIVE · {event.timeRemaining}</span>
                </div>
              ) : (
                <div className="font-semibold text-[13px] text-[#a9c3e0]">{event.dateLabel}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-10 pt-8 pb-20 grid grid-cols-[1.7fr_1fr] gap-6 items-stretch">
        {/* LEFT COLUMN */}
        <div className="flex flex-col">
          <div className="flex gap-2.5 mb-5 flex-wrap">
            {event.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  setSlip(null);
                }}
                className={`font-bold text-[13px] px-[18px] py-[9px] rounded-lg cursor-pointer border ${
                  cat.id === activeCategory.id
                    ? "bg-btn border-btn-border text-fg"
                    : "bg-panel border-line text-muted font-semibold"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="bg-panel border border-line rounded-[14px] overflow-hidden">
            <div className="px-5 pt-5 pb-1 font-heading font-bold text-lg text-fg">{activeCategory.question}</div>
            {activeCategory.outcomes.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.3fr_1.1fr_96px_96px] items-center gap-3.5 px-5 py-4 border-t border-line"
              >
                <div className="font-semibold text-[15px] text-fg">{row.label}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#16283b] rounded-[3px] overflow-hidden">
                    <div className="h-full bg-accent rounded-[3px]" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="font-heading font-bold text-xs text-muted min-w-8">{row.pct}%</span>
                </div>
                <button
                  onClick={() => openSlip(row, "YES")}
                  className="bg-btn border border-btn-border text-accent-soft font-heading font-bold text-[13px] px-1 py-2.5 rounded-lg cursor-pointer"
                >
                  YES {row.yesOdds.toFixed(2)}x
                </button>
                <button
                  onClick={() => openSlip(row, "NO")}
                  className="bg-[#161f2c] border border-line-2 text-no font-heading font-bold text-[13px] px-1 py-2.5 rounded-lg cursor-pointer"
                >
                  NO {row.noOdds.toFixed(2)}x
                </button>
              </div>
            ))}
          </div>

          {slip && (
            <div className="mt-5 p-6 bg-panel-2 border border-btn-border rounded-[14px]">
              <div className="flex justify-between items-center mb-[18px]">
                <div>
                  <div className="font-semibold text-xs text-muted">Placing order</div>
                  <div className="font-heading font-bold text-lg text-fg">
                    {slip.side} · {slip.label}
                  </div>
                </div>
                <button
                  onClick={() => setSlip(null)}
                  className="bg-transparent border-none text-dim text-[22px] cursor-pointer leading-none"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-[18px] items-end flex-wrap">
                <div className="flex-1 min-w-[150px]">
                  <label className="block font-semibold text-xs text-muted mb-1.5">Stake (USDC)</label>
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(Number(e.target.value) || 0)}
                    className="w-full box-border px-3.5 py-3 rounded-lg border border-line-2 bg-abyss text-fg font-heading font-bold text-base"
                  />
                </div>
                <div>
                  <div className="font-semibold text-xs text-muted mb-1.5">Odds</div>
                  <div className="font-heading font-bold text-lg text-fg">{slip.odds.toFixed(2)}x</div>
                </div>
                <div>
                  <div className="font-semibold text-xs text-muted mb-1.5">Potential payout</div>
                  <div className="font-heading font-bold text-lg text-win">${(stake * slip.odds).toFixed(2)}</div>
                </div>
                <button
                  onClick={placeOrder}
                  className="bg-accent border-none text-white font-heading font-bold text-sm px-[26px] py-3.5 rounded-[10px] cursor-pointer"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 mt-5 px-5 py-4 bg-panel border border-line rounded-xl">
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

          <div className="mt-5 bg-panel border border-line rounded-[14px] p-5 flex-1 box-border">
            <div className="font-bold text-xs text-dim tracking-[0.5px] uppercase mb-3.5">Recent Trades</div>
            <div className="flex flex-col gap-3">
              {RECENT_TRADES.map((tr, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-heading font-bold text-[11px] px-2 py-[3px] rounded-[5px] ${
                        tr.side === "YES" ? "bg-btn text-accent-soft" : "bg-[#161f2c] text-no"
                      }`}
                    >
                      {tr.side}
                    </span>
                    <span className="font-semibold text-[13px] text-fg">{tr.label}</span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <span className="font-semibold text-[13px] text-muted">{tr.amount}</span>
                    <span className="font-medium text-xs text-dim">{tr.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-[18px]">
          <div className="bg-panel border border-line rounded-[14px] p-5">
            <div className="font-bold text-xs text-dim tracking-[0.5px] uppercase mb-3">Match Status</div>
            {isLive && event.score ? (
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="mb-1">
                    <TeamBadge code={event.codeA} color={event.colorA} size="sm" />
                  </div>
                  <div className="font-semibold text-xs text-muted">{event.teamA}</div>
                </div>
                <div className="font-heading font-bold text-[26px] text-fg">
                  {event.score.a} - {event.score.b}
                </div>
                <div className="text-center">
                  <div className="mb-1">
                    <TeamBadge code={event.codeB} color={event.colorB} size="sm" />
                  </div>
                  <div className="font-semibold text-xs text-muted">{event.teamB}</div>
                </div>
              </div>
            ) : (
              <div className="font-semibold text-sm text-fg">Kickoff: {event.dateLabel}</div>
            )}
          </div>

          <div className="bg-panel border border-line rounded-[14px] p-5">
            <div className="font-bold text-xs text-dim tracking-[0.5px] uppercase mb-3.5">Top Traders (World Cup)</div>
            <div className="flex flex-col gap-3">
              {TOP_TRADERS.map((t) => (
                <div key={t.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-semibold text-[13px] text-fg">
                    <span className="text-dim">{t.rank}</span>
                    {t.name}
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-bold text-[13px] text-fg">{t.volume}</div>
                    <div className="font-semibold text-[11px] text-win">{t.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-panel border border-line rounded-[14px] p-5">
            <div className="font-bold text-xs text-dim tracking-[0.5px] uppercase mb-3.5">Recent Settlements</div>
            <div className="flex flex-col gap-3">
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

          <div className="bg-[#0f2c22] border border-[#1e4a37] rounded-[14px] p-5">
            <div className="font-bold text-xs text-dim tracking-[0.5px] uppercase mb-2.5">TxLINE Integration Status</div>
            <div className="flex items-center gap-2">
              <LiveDot size={8} />
              <span className="font-heading font-bold text-sm text-win">Live Data Stream: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
