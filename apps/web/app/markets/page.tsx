"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { MatchEvent } from "@bluefin/types";
import TeamBadge from "@/components/team-badge";
import LiveDot from "@/components/live-dot";
import { EVENTS } from "@/lib/data";

export default function MarketsPage() {
  // ponytail: initialData keeps first paint instant; swap for pure fetch once a real backend exists
  const { data: events } = useQuery<MatchEvent[]>({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await fetch("/api/markets");
      if (!res.ok) throw new Error("failed to load markets");
      return res.json();
    },
    initialData: EVENTS,
  });

  const cards = events.flatMap((ev) =>
    ev.categories.map((cat) => {
      const top = cat.outcomes.reduce((a, b) => (b.pct > a.pct ? b : a), cat.outcomes[0]);
      return { ev, cat, top };
    })
  );

  return (
    <div className="max-w-[1280px] mx-auto px-10 pt-12 pb-20">
      <div className="font-semibold text-[13px] text-accent tracking-[1px] uppercase mb-2">World Cup 2026</div>
      <h1 className="font-heading font-bold text-[34px] m-0 mb-1.5 text-fg">Active Markets</h1>
      <p className="font-medium text-[15px] text-muted m-0 mb-8">
        Trustless prediction markets settled on-chain, powered by TxLINE real-time data.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5">
        {cards.map(({ ev, cat, top }) => (
          <Link
            key={`${ev.id}-${cat.id}`}
            href={`/trade/${ev.id}?category=${cat.id}`}
            className="bg-panel border border-line rounded-[14px] p-[22px] cursor-pointer flex flex-col gap-4 no-underline hover:border-line-2"
          >
            <div className="flex items-center gap-2 font-bold text-[15px] text-fg">
              <TeamBadge code={ev.codeA} color={ev.colorA} size="sm" />
              <span>{ev.teamA}</span>
              <span className="text-dim">vs</span>
              <span>{ev.teamB}</span>
              <TeamBadge code={ev.codeB} color={ev.colorB} size="sm" />
            </div>
            {ev.status === "live" ? (
              <div className="flex items-center gap-1.5">
                <LiveDot />
                <span className="font-heading font-bold text-[11px] text-live tracking-[1px]">LIVE</span>
              </div>
            ) : (
              <div className="font-semibold text-xs text-dim">{ev.dateLabel}</div>
            )}
            <div>
              <div className="font-bold text-xs text-accent uppercase tracking-[0.5px] mb-1.5">{cat.label}</div>
              <div className="font-semibold text-[15px] text-fg">{cat.question}</div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 font-semibold text-[13px] text-muted">
                {top.label} <span className="text-fg font-bold">{top.pct}%</span>
              </div>
              <div className="bg-btn border border-btn-border text-accent-soft font-heading font-bold text-xs px-2.5 py-1.5 rounded-md">
                YES {top.yesOdds.toFixed(2)}x
              </div>
              <div className="bg-[#161f2c] border border-line-2 text-no font-heading font-bold text-xs px-2.5 py-1.5 rounded-md">
                NO {top.noOdds.toFixed(2)}x
              </div>
            </div>
            <div className="border-t border-line pt-3 font-semibold text-xs text-dim">{cat.vol} Vol</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
