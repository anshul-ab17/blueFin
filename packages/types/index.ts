export type Side = "YES" | "NO";

export interface Outcome {
  label: string;
  pct: number;
  yesOdds: number;
  noOdds: number;
}

export interface MarketCategory {
  id: string;
  label: string;
  question: string;
  vol: string;
  outcomes: Outcome[];
}

export interface MatchEvent {
  id: string;
  teamA: string;
  teamB: string;
  codeA: string;
  colorA: string;
  codeB: string;
  colorB: string;
  status: "live" | "upcoming";
  dateLabel: string;
  score?: { a: number; b: number };
  timeRemaining?: string;
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
