"use client";

import Link from "next/link";
import type { BracketRound, MatchEvent } from "@bluefin/types";
import FlagIcon, { hasFlag } from "@/components/flag-icon";
import TeamBadge from "@/components/team-badge";
import LiveDot from "@/components/live-dot";
import { EVENTS } from "@/lib/data";

const CARD_W = 240;
const CARD_H = 98;
const UNIT = 124; // base slot height (card + gap) in the first round
const GAP = 44; // connector column width
const LINE = "#2a3a4d";

// round r (0 = R32): slot doubles each round, offset centers cards against the previous pair
const slot = (r: number) => UNIT * 2 ** r;
const offset = (r: number) => (UNIT * (2 ** r - 1)) / 2;
const center = (r: number, i: number) => offset(r) + i * slot(r) + CARD_H / 2;

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
    <div className={`flex items-center gap-2.5 px-3.5 py-[9px] border-t border-white/[0.06] ${won ? "bg-white/[0.05]" : ""}`}>
      {hasFlag(code) ? <FlagIcon code={code} size="xs" /> : <TeamBadge code={code} color={color} size="xs" />}
      <span className={`flex-1 font-semibold text-[13px] truncate ${won || !finished ? "text-fg" : "text-muted"}`}>{name}</span>
      {finished || (m.status === "live" && m.score) ? (
        <span className={`font-heading font-bold text-[14px] min-w-[14px] text-right ${won || !finished ? "text-fg" : "text-dim"}`}>{score}</span>
      ) : (
        <span className={`font-heading font-bold text-[12px] ${pct !== undefined && pct >= 50 ? "text-accent-soft" : "text-muted"}`}>
          {pct !== undefined ? `${pct}%` : "—"}
        </span>
      )}
    </div>
  );
}

function MatchCard({ m }: { m: MatchEvent }) {
  const finished = m.status === "finished";
  const live = m.status === "live";
  const date = m.dateLabel.split("·").pop()!.trim();
  return (
    <Link
      href={`/trade/${m.id}?category=result`}
      className="block hover:opacity-85 hover:-translate-y-px transition-all duration-150"
    >
      <div
        className={`bg-panel border rounded-[10px] overflow-hidden ${finished ? "border-line" : "border-btn-border"}`}
        style={{ width: CARD_W, minHeight: CARD_H }}
      >
        <div className="px-3.5 pt-2 pb-1.5 flex items-center justify-between">
          <span className="font-heading font-bold text-[10px] tracking-[0.6px] uppercase text-dim leading-none truncate">
            {date}
          </span>
          {live ? (
            <span className="inline-flex items-center gap-1 font-heading font-bold text-[10px] tracking-[0.6px] uppercase leading-none text-win">
              <LiveDot size={5} />
              LIVE
            </span>
          ) : (
            <span className={`font-heading font-bold text-[10px] tracking-[0.6px] uppercase leading-none ${finished ? "text-dim" : "text-accent-soft"}`}>
              {finished ? "FT" : "Open"}
            </span>
          )}
        </div>
        <TeamRow m={m} side="A" />
        <TeamRow m={m} side="B" />
      </div>
    </Link>
  );
}

/** Elbow connectors joining each pair in round r to its match in round r+1. */
function Connectors({ from, pairs }: { from: number; pairs: number }) {
  return (
    <div className="shrink-0 relative" style={{ width: GAP }}>
      {Array.from({ length: pairs }, (_, i) => {
        const y1 = center(from, 2 * i);
        const y2 = center(from, 2 * i + 1);
        return (
          <div key={i}>
            <div
              className="absolute rounded-r-[6px]"
              style={{ top: y1, height: y2 - y1, left: 0, width: GAP / 2, border: `1px solid ${LINE}`, borderLeft: "none" }}
            />
            <div
              className="absolute"
              style={{ top: (y1 + y2) / 2, left: GAP / 2, width: GAP / 2, borderTop: `1px solid ${LINE}` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function FixtureBracket() {
  const rounds = [byRound("R32"), byRound("R16"), byRound("QF"), byRound("SF")];
  const final = byRound("Final");
  const third = byRound("3rd");

  const column = (matches: MatchEvent[], r: number) => (
    <div className="shrink-0 flex flex-col" style={{ gap: `${slot(r) - CARD_H}px`, paddingTop: offset(r) }}>
      {matches.map((m) => (
        <MatchCard key={m.id} m={m} />
      ))}
    </div>
  );

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex flex-col min-w-max">
        {/* headers */}
        <div className="flex mb-4" style={{ gap: GAP }}>
          {COLS.map((c) => (
            <div key={c.round} className="shrink-0 text-[11px] font-heading font-bold text-dim uppercase tracking-[1px]" style={{ width: CARD_W }}>
              {c.title}
            </div>
          ))}
        </div>

        {/* bracket columns with connectors */}
        <div className="flex items-start">
          {rounds.map((matches, r) => (
            <div key={r} className="flex items-start">
              {column(matches, r)}
              <Connectors from={r} pairs={Math.ceil(matches.length / 2)} />
            </div>
          ))}
          {/* Final + 3rd place stacked; padding lines the Final card center up with the SF elbow */}
          <div className="shrink-0 flex flex-col gap-4" style={{ paddingTop: offset(4) - 20 }}>
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
