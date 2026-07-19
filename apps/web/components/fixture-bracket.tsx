"use client";

import Link from "next/link";
import type { BracketRound, MatchEvent } from "@bluefin/types";
import FlagIcon, { hasFlag } from "@/components/flag-icon";
import TeamBadge from "@/components/team-badge";
import { EVENTS } from "@/lib/data";

const CARD_H = 84;

const COLS: { round: BracketRound; title: string }[] = [
  { round: "R32", title: "Round of 32" },
  { round: "R16", title: "Round of 16" },
  { round: "QF", title: "Quarter-Finals" },
  { round: "SF", title: "Semi-Finals" },
  { round: "Final", title: "Final / 3rd Place" },
];

function byRound(round: BracketRound): MatchEvent[] {
  return EVENTS.filter((e) => e.round === round);
}

function TeamRow({ m, side }: { m: MatchEvent; side: "A" | "B" }) {
  const name = side === "A" ? m.teamA : m.teamB;
  const code = side === "A" ? m.codeA : m.codeB;
  const color = side === "A" ? m.colorA : m.colorB;
  const score = side === "A" ? m.score?.a : m.score?.b;
  const won = m.winner === side;
  const finished = m.status === "finished";
  const outcome = m.categories[0]?.outcomes.find((o) => o.label === name);
  const pct = outcome ? Math.round(outcome.pct) : undefined;

  return (
    <div className={`flex items-center gap-2 px-3 py-[7px] border-t border-white/[0.06] ${won ? "bg-white/[0.05]" : ""}`}>
      {hasFlag(code) ? <FlagIcon code={code} size="xs" /> : <TeamBadge code={code} color={color} size="xs" />}
      <span className={`flex-1 font-semibold text-[12px] truncate ${won || !finished ? "text-fg" : "text-muted"}`}>{name}</span>
      {finished ? (
        <span className={`font-heading font-bold text-[13px] min-w-[12px] text-right ${won ? "text-fg" : "text-dim"}`}>{score}</span>
      ) : (
        <span className={`font-heading font-bold text-[11px] ${pct !== undefined && pct >= 50 ? "text-accent-soft" : "text-muted"}`}>
          {pct !== undefined ? `${pct}%` : "—"}
        </span>
      )}
    </div>
  );
}

function MatchCard({ m }: { m: MatchEvent }) {
  const finished = m.status === "finished";
  return (
    <Link
      href={`/trade/${m.id}?category=result`}
      className="block hover:opacity-85 hover:-translate-y-px transition-all duration-150"
    >
      <div className={`bg-panel border rounded-[9px] overflow-hidden w-[212px] ${finished ? "border-line" : "border-btn-border"}`} style={{ minHeight: CARD_H }}>
        <div className="px-3 pt-[7px] flex items-center justify-between">
          <span className="font-heading font-bold text-[9px] tracking-[0.6px] uppercase text-dim leading-none truncate">
            {m.venue}
          </span>
          <span className={`font-heading font-bold text-[9px] tracking-[0.6px] uppercase leading-none ${finished ? "text-dim" : "text-accent-soft"}`}>
            {finished ? "FT" : "Open"}
          </span>
        </div>
        <TeamRow m={m} side="A" />
        <TeamRow m={m} side="B" />
      </div>
    </Link>
  );
}

/** Spacer-based bracket: each later round centers its cards against the previous pair. */
export default function FixtureBracket() {
  const r32 = byRound("R32");
  const r16 = byRound("R16");
  const qf = byRound("QF");
  const sf = byRound("SF");
  const final = byRound("Final");
  const third = byRound("3rd");

  // vertical rhythm: R16 cards evenly spaced; each round doubles the gap and offsets by half
  const UNIT = 104; // R16 slot height (card + gap)
  const colGap = 40;

  const column = (matches: MatchEvent[], slot: number, offset: number) => (
    <div className="shrink-0 flex flex-col" style={{ gap: `${slot - CARD_H}px`, paddingTop: offset }}>
      {matches.map((m) => (
        <MatchCard key={m.id} m={m} />
      ))}
    </div>
  );

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex flex-col min-w-max">
        {/* headers */}
        <div className="flex mb-4" style={{ gap: colGap }}>
          {COLS.map((c) => (
            <div key={c.round} className="w-[212px] shrink-0 text-[11px] font-heading font-bold text-dim uppercase tracking-[1px]">
              {c.title}
            </div>
          ))}
        </div>

        {/* bracket columns */}
        <div className="flex items-start" style={{ gap: colGap }}>
          {column(r32, UNIT, 0)}
          {column(r16, UNIT * 2, UNIT / 2)}
          {column(qf, UNIT * 4, UNIT * 1.5)}
          {column(sf, UNIT * 8, UNIT * 3.5)}
          {/* Final + 3rd place stacked */}
          <div className="shrink-0 flex flex-col gap-4" style={{ paddingTop: UNIT * 7.5 }}>
            {final.map((m) => (
              <div key={m.id}>
                <div className="font-heading font-bold text-[10px] text-accent-soft uppercase tracking-[1px] mb-1.5">🏆 Final</div>
                <MatchCard m={m} />
              </div>
            ))}
            {third.map((m) => (
              <div key={m.id}>
                <div className="font-heading font-bold text-[10px] text-dim uppercase tracking-[1px] mb-1.5">3rd Place</div>
                <MatchCard m={m} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
