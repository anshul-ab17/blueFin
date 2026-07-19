"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { MatchEvent } from "@bluefin/types";
import TeamBadge from "@/components/team-badge";
import FlagIcon, { hasFlag } from "@/components/flag-icon";
import LiveDot from "@/components/live-dot";
import PageBackdrop from "@/components/page-backdrop";
import { FillBar, HoverCard, PageTitle, Reveal } from "@/components/fx";
import FixtureBracket from "@/components/fixture-bracket";
import { EVENTS } from "@/lib/data";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "fixture", label: "Fixture" },
  { id: "live", label: "Live" },
  { id: "result", label: "Match Result" },
  { id: "totalgoals", label: "Total Goals" },
  { id: "nextgoal", label: "Next Goal" },
  { id: "scorer", label: "First Scorer" },
];

interface JupEventRow {
  id: string;
  title: string;
  live: boolean;
  outcomes: { label: string; pct: number; vol: number }[];
}

function JupiterConsensus() {
  const { data } = useQuery<JupEventRow[]>({
    queryKey: ["jupiter-wc"],
    queryFn: async () => {
      const res = await fetch("/api/jupiter");
      if (!res.ok) throw new Error("jupiter unavailable");
      return res.json();
    },
    staleTime: 60_000,
    retry: 1,
  });

  if (!data?.length) return null;

  return (
    <div className="mt-5">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
        {data.slice(0, 3).map((ev, i) => (
          <Reveal key={ev.id} delay={i * 60}>
            <HoverCard className="bg-panel border border-line rounded-[14px] p-5 transition-all duration-[250ms] hover:-translate-y-[5px] hover:border-btn-border hover:shadow-[0_14px_34px_rgba(47,111,237,0.18)] flex flex-col" style={{ minHeight: "148px" }}>
              <div className="flex items-center justify-between mb-3.5">
                <div className="font-bold text-[14px] text-fg group-hover:text-accent-soft transition-colors duration-300 leading-tight">{ev.title}</div>
                {ev.live && (
                  <span className="flex items-center gap-1.5 shrink-0 ml-2">
                    <LiveDot />
                    <span className="font-heading font-bold text-[10px] text-live tracking-[1px]">LIVE</span>
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                {ev.outcomes.map((o) => (
                  <div key={o.label} className="flex items-center gap-2.5">
                    <span className="font-semibold text-[12px] text-muted w-[88px] shrink-0 truncate">{o.label}</span>
                    <FillBar pct={o.pct} />
                    <span className="font-heading font-bold text-xs text-accent-soft min-w-9 text-right">{o.pct}%</span>
                  </div>
                ))}
              </div>
            </HoverCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default function MarketsPage() {
  const [filter, setFilter] = useState("all");

  const { data: jupEvents } = useQuery<JupEventRow[]>({
    queryKey: ["jupiter-wc"],
    queryFn: async () => {
      const res = await fetch("/api/jupiter");
      if (!res.ok) throw new Error("jupiter unavailable");
      return res.json();
    },
    staleTime: 60_000,
    retry: 1,
  });

  // ponytail: initialData keeps first paint instant; swap for pure fetch once a real backend exists
  const { data: events } = useQuery<MatchEvent[]>({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await fetch("/api/markets");
      if (!res.ok) throw new Error("failed to load markets");
      return res.json();
    },
    initialData: EVENTS,
    // API serves only live-odds events; overlay its odds on the full static fixture
    // list, keeping static-only categories (props) and status intact
    select: (live) =>
      EVENTS.map((e) => {
        const l = live.find((x) => x.id === e.id);
        if (!l) return e;
        return {
          ...e,
          categories: e.categories.map((c) => l.categories.find((lc) => lc.id === c.id) ?? c),
        };
      }),
  });

  const baseCards = (events ?? []).flatMap((ev) =>
    ev.categories.map((cat) => {
      const top = cat.outcomes.reduce((a, b) => (b.pct > a.pct ? b : a), cat.outcomes[0]);
      return { ev, cat, top };
    })
  );

  const espArgEvent = (events ?? []).find((e) => e.id === "esp-arg");
  const jupCards = (jupEvents && espArgEvent)
    ? jupEvents.map((je) => {
        const cat = {
          id: je.id,
          label: je.title.replace("World Cup: ", "").replace("World Cup Finals: ", "").replace("FIFA World Cup: ", ""),
          question: je.title,
          vol: je.outcomes.reduce((acc, o) => acc + o.vol, 0) >= 1000 
            ? `$${Math.round(je.outcomes.reduce((acc, o) => acc + o.vol, 0) / 1000)}K` 
            : `$${je.outcomes.reduce((acc, o) => acc + o.vol, 0)}`,
          outcomes: je.outcomes.map((o) => {
            const p = Math.min(Math.max(o.pct, 1), 99) / 100;
            const yesOdds = Math.round((1 / p) * 100) / 100;
            const noOdds = Math.round((1 / (1 - p)) * 100) / 100;
            const result = je.live === false && espArgEvent.status === "finished"
              ? (o.pct >= 95 ? ("YES" as const) : o.pct <= 5 ? ("NO" as const) : undefined)
              : undefined;

            return {
              label: o.label,
              pct: o.pct,
              yesOdds,
              noOdds,
              ...(result ? { result } : {})
            };
          })
        };
        const top = cat.outcomes.reduce((a, b) => (b.pct > a.pct ? b : a), cat.outcomes[0]);
        return { ev: espArgEvent, cat, top };
      })
    : [];

  const cards = [...baseCards, ...jupCards].filter(({ ev, cat }) => {
    if (filter === "all") return true;
    if (filter === "live") return ev.status === "live";
    if (cat.id === filter) return true;

    // Classification mapping for Jupiter events
    const idLower = cat.question.toLowerCase();
    if (filter === "scorer" && (idLower.includes("goals") || idLower.includes("scorer") || idLower.includes("assist") || idLower.includes("contribution"))) {
      return true;
    }
    if (filter === "nextgoal" && idLower.includes("penalty")) {
      return true;
    }
    if (filter === "result" && idLower.includes("method of victory")) {
      return true;
    }
    return false;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 pt-12 pb-20">
      <PageBackdrop src="/assets/bg/water2.webp" />
      <PageTitle
        eyebrow="Football"
        title="World Cup 2026"
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
      {filter === "fixture" ? (
        <FixtureBracket />
      ) : (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-5">
        {cards.map(({ ev, cat, top }, i) => (
          <Reveal key={`${ev.id}-${cat.id}`} delay={(i % 6) * 70}>
            <HoverCard className="bg-panel border border-line rounded-[14px] p-[22px] transition-all duration-[250ms] hover:-translate-y-[5px] hover:border-btn-border hover:shadow-[0_14px_34px_rgba(47,111,237,0.18)]">
              <Link href={`/trade/${ev.id}?category=${cat.id}`} className="absolute inset-0 z-[2] rounded-[14px]" aria-label={cat.question} />
              <div className="flex items-center gap-2 font-bold text-[15px] text-fg group-hover:text-white transition-colors duration-300">
                {hasFlag(ev.codeA) ? <FlagIcon code={ev.codeA} size="sm" /> : <TeamBadge code={ev.codeA} color={ev.colorA} size="sm" />}
                <span>{ev.teamA}</span>
                <span className="text-dim group-hover:text-muted transition-colors duration-300">vs</span>
                <span>{ev.teamB}</span>
                {hasFlag(ev.codeB) ? <FlagIcon code={ev.codeB} size="sm" /> : <TeamBadge code={ev.codeB} color={ev.colorB} size="sm" />}
              </div>
              {ev.status === "live" ? (
                <div className="flex items-center gap-1.5">
                  <LiveDot />
                  <span className="font-heading font-bold text-[11px] text-live tracking-[1px]">LIVE</span>
                </div>
              ) : (
                <div className="font-semibold text-xs text-dim group-hover:text-muted transition-colors duration-300">{ev.dateLabel}</div>
              )}
              <div>
                <div className="font-bold text-xs text-accent uppercase tracking-[0.5px] mb-1.5 group-hover:text-accent-soft transition-colors duration-300">{cat.label}</div>
                <div className="relative overflow-hidden font-semibold text-[15px] text-fg h-[1.4em]">
                  <span className="block transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                    {cat.question}
                  </span>
                  <span className="block absolute inset-0 translate-y-full transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 text-accent-soft" aria-hidden>
                    {cat.question}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FillBar pct={top.pct} />
                <span className="font-heading font-bold text-xs text-muted min-w-8 text-right group-hover:text-accent-soft transition-colors duration-300">{top.pct}%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 font-semibold text-[13px] text-muted group-hover:text-soft-fg transition-colors duration-300">{top.label}</div>
                <div className="bg-btn border border-btn-border text-accent-soft font-heading font-bold text-xs px-2.5 py-1.5 rounded-md">
                  YES {top.yesOdds.toFixed(2)}x
                </div>
                <div className="bg-[#161f2c] border border-line-2 text-no font-heading font-bold text-xs px-2.5 py-1.5 rounded-md">
                  NO {top.noOdds.toFixed(2)}x
                </div>
              </div>
              <div className="border-t border-line pt-3 font-semibold text-xs text-dim group-hover:text-muted transition-colors duration-300">{cat.vol} Vol</div>
            </HoverCard>
          </Reveal>
        ))}
      </div>
      )}
      <JupiterConsensus />
    </div>
  );
}
