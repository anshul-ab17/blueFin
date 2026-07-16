"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { MatchEvent } from "@bluefin/types";
import TeamBadge from "@/components/team-badge";
import LiveDot from "@/components/live-dot";
import PageBackdrop from "@/components/page-backdrop";
import { FillBar, PageTitle, Reveal } from "@/components/fx";
import { EVENTS } from "@/lib/data";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "result", label: "Match Result" },
  { id: "totalgoals", label: "Total Goals" },
  { id: "nextgoal", label: "Next Goal" },
  { id: "scorer", label: "First Scorer" },
];

export default function MarketsPage() {
  const [filter, setFilter] = useState("all");

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

  const cards = events
    .flatMap((ev) =>
      ev.categories.map((cat) => {
        const top = cat.outcomes.reduce((a, b) => (b.pct > a.pct ? b : a), cat.outcomes[0]);
        return { ev, cat, top };
      })
    )
    .filter(
      ({ ev, cat }) => filter === "all" || (filter === "live" ? ev.status === "live" : cat.id === filter)
    );

  return (
    <div className="max-w-[1280px] mx-auto px-10 pt-12 pb-20">
      <PageBackdrop src="/assets/bg/water2.webp" />
      <PageTitle
        eyebrow="World Cup 2026"
        title="Active Markets"
        subtitle="Trustless prediction markets settled on-chain, powered by TxLINE real-time data."
        size={40}
      />
      <div className="rise-in flex gap-2.5 flex-wrap mb-[26px]" style={{ animationDelay: "0.4s" }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`font-bold text-[13px] px-[18px] py-[9px] rounded-full cursor-pointer border transition-all hover:border-btn-border ${
              filter === f.id ? "bg-btn border-btn-border text-fg" : "bg-panel border-line text-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5">
        {cards.map(({ ev, cat, top }, i) => (
          <Reveal key={`${ev.id}-${cat.id}`} delay={(i % 6) * 70}>
            <Link
              href={`/trade/${ev.id}?category=${cat.id}`}
              className="bg-panel border border-line rounded-[14px] p-[22px] cursor-pointer flex flex-col gap-4 no-underline transition-all duration-[250ms] hover:-translate-y-[5px] hover:border-btn-border hover:shadow-[0_14px_34px_rgba(47,111,237,0.18)]"
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
              <div className="flex items-center gap-2">
                <FillBar pct={top.pct} />
                <span className="font-heading font-bold text-xs text-muted min-w-8 text-right">{top.pct}%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 font-semibold text-[13px] text-muted">{top.label}</div>
                <div className="bg-btn border border-btn-border text-accent-soft font-heading font-bold text-xs px-2.5 py-1.5 rounded-md transition-shadow hover:shadow-[0_0_16px_rgba(77,159,255,0.35)]">
                  YES {top.yesOdds.toFixed(2)}x
                </div>
                <div className="bg-[#161f2c] border border-line-2 text-no font-heading font-bold text-xs px-2.5 py-1.5 rounded-md">
                  NO {top.noOdds.toFixed(2)}x
                </div>
              </div>
              <div className="border-t border-line pt-3 font-semibold text-xs text-dim">{cat.vol} Vol</div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
