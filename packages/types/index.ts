export type Side = "YES" | "NO";

export interface Outcome {
  label: string;
  pct: number;
  yesOdds: number;
  noOdds: number;
  result?: Side;
}

export interface MarketCategory {
  id: string;
  label: string;
  question: string;
  vol: string;
  outcomes: Outcome[];
}

export type BracketRound = "R32" | "R16" | "QF" | "SF" | "Final" | "3rd";

export interface MatchEvent {
  id: string;
  teamA: string;
  teamB: string;
  codeA: string;
  colorA: string;
  codeB: string;
  colorB: string;
  status: "live" | "upcoming" | "finished";
  dateLabel: string;
  score?: { a: number; b: number };
  timeRemaining?: string;
  /** knockout round, for the fixture bracket */
  round?: BracketRound;
  /** venue shown in bracket, e.g. "New York/New Jersey" */
  venue?: string;
  /** winner side for finished matches */
  winner?: "A" | "B" | "draw";
  categories: MarketCategory[];
}

export interface Bet {
  id: number;
  event: string;
  category: string;
  outcome: string;
  side: Side;
  stake: number;
  odds: number;
  payout: number;
}

export interface Proof {
  id: number;
  event: string;
  market: string;
  outcome: string;
  root: string;
  sig: string;
  time: string;
}
