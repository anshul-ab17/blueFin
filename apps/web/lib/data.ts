import type { BracketRound, MatchEvent, Outcome, Proof } from "@bluefin/types";

// kept for any legacy emoji fallback references; real flag rendering uses FlagIcon component
export const FLAGS: Record<string, string> = {};

const COLORS: Record<string, string> = {
  ESP: "#c60b1e", ARG: "#3f7dbf", BRA: "#1c8a3c", GER: "#2b2b2b",
  FRA: "#002395", ENG: "#c60b1e", POR: "#b5091c", NED: "#ff6600",
  MAR: "#006233", MEX: "#006847", BEL: "#111111", USA: "#1f2f6b",
  URU: "#5cb8e6", ITA: "#0064aa", JPN: "#bc002d", CRO: "#1c56a6",
};

type TeamTuple = [name: string, code: string];

/** odds from an implied probability (with a light margin) */
function oddsFrom(pct: number): { yesOdds: number; noOdds: number } {
  const p = Math.min(Math.max(pct, 1), 99) / 100;
  return {
    yesOdds: Math.round((1 / p) * 100) / 100,
    noOdds: Math.round((1 / (1 - p)) * 100) / 100,
  };
}

function outcome(label: string, pct: number, result?: "YES" | "NO"): Outcome {
  return { label, pct, ...oddsFrom(pct), ...(result ? { result } : {}) };
}

/** Build a settled knockout fixture with a resolved Match Result market. */
function finished(
  id: string,
  round: BracketRound,
  venue: string,
  dateLabel: string,
  a: TeamTuple,
  b: TeamTuple,
  scoreA: number,
  scoreB: number,
  vol: string
): MatchEvent {
  const winner: "A" | "B" | "draw" = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "draw";
  // settled market: winner near-certain, remainder split
  const pctA = winner === "A" ? 96 : winner === "B" ? 3 : 48;
  const pctB = winner === "B" ? 96 : winner === "A" ? 3 : 48;
  const pctD = winner === "draw" ? 96 : 1;
  return {
    id,
    round,
    venue,
    teamA: a[0], codeA: a[1], colorA: COLORS[a[1]] ?? "#2f6fa8",
    teamB: b[0], codeB: b[1], colorB: COLORS[b[1]] ?? "#2f6fa8",
    status: "finished",
    winner,
    score: { a: scoreA, b: scoreB },
    dateLabel,
    categories: [
      {
        id: "result",
        label: "Match Result",
        question: `Full-time result: ${a[0]} vs ${b[0]}`,
        vol,
        outcomes: [
          outcome(a[0], pctA, winner === "A" ? "YES" : "NO"),
          outcome(b[0], pctB, winner === "B" ? "YES" : "NO"),
          outcome("Draw", pctD, winner === "draw" ? "YES" : "NO"),
        ],
      },
    ],
  };
}

// ── World Cup 2026 knockout bracket ──────────────────────────────────────────
// Coherent path: Spain & Argentina reach the Final; France & England play for 3rd.
const R16: MatchEvent[] = [
  finished("esp-ned", "R16", "Los Angeles", "Round of 16 · Jul 5", ["Spain", "ESP"], ["Netherlands", "NED"], 3, 0, "$820K"),
  finished("ger-cro", "R16", "Dallas", "Round of 16 · Jul 5", ["Germany", "GER"], ["Croatia", "CRO"], 2, 1, "$540K"),
  finished("fra-bra", "R16", "New York/New Jersey", "Round of 16 · Jul 6", ["France", "FRA"], ["Brazil", "BRA"], 2, 1, "$1.1M"),
  finished("por-mar", "R16", "Miami", "Round of 16 · Jul 6", ["Portugal", "POR"], ["Morocco", "MAR"], 1, 0, "$470K"),
  finished("arg-mex", "R16", "Mexico City", "Round of 16 · Jul 7", ["Argentina", "ARG"], ["Mexico", "MEX"], 2, 0, "$960K"),
  finished("bel-usa", "R16", "Atlanta", "Round of 16 · Jul 7", ["Belgium", "BEL"], ["United States", "USA"], 4, 1, "$47.75M"),
  finished("eng-uru", "R16", "Houston", "Round of 16 · Jul 8", ["England", "ENG"], ["Uruguay", "URU"], 2, 1, "$610K"),
  finished("ita-jpn", "R16", "Seattle", "Round of 16 · Jul 8", ["Italy", "ITA"], ["Japan", "JPN"], 1, 0, "$430K"),
];

const QF: MatchEvent[] = [
  finished("esp-ger", "QF", "Los Angeles", "Quarter-Final · Jul 11", ["Spain", "ESP"], ["Germany", "GER"], 2, 0, "$1.3M"),
  finished("fra-por", "QF", "Kansas City", "Quarter-Final · Jul 11", ["France", "FRA"], ["Portugal", "POR"], 2, 1, "$980K"),
  finished("arg-bel", "QF", "Miami", "Quarter-Final · Jul 12", ["Argentina", "ARG"], ["Belgium", "BEL"], 3, 1, "$1.5M"),
  finished("eng-ita", "QF", "Boston", "Quarter-Final · Jul 12", ["England", "ENG"], ["Italy", "ITA"], 2, 0, "$870K"),
];

const SF: MatchEvent[] = [
  finished("esp-fra", "SF", "Dallas", "Semi-Final · Jul 15", ["Spain", "ESP"], ["France", "FRA"], 2, 1, "$2.4M"),
  finished("arg-eng", "SF", "Atlanta", "Semi-Final · Jul 16", ["Argentina", "ARG"], ["England", "ENG"], 1, 0, "$2.1M"),
];

const THIRD: MatchEvent = {
  id: "fra-eng",
  round: "3rd",
  venue: "Miami",
  teamA: "France", codeA: "FRA", colorA: COLORS.FRA,
  teamB: "England", codeB: "ENG", colorB: COLORS.ENG,
  status: "upcoming",
  dateLabel: "World Cup 2026 · Third Place Play-off",
  categories: [
    {
      id: "result",
      label: "Match Result",
      question: "Full-time result: France vs England",
      vol: "$412K",
      outcomes: [outcome("France", 46), outcome("England", 34), outcome("Draw", 20)],
    },
    {
      id: "totalgoals",
      label: "Total Goals",
      question: "Total Goals: FRA vs ENG over/under 2.5",
      vol: "$180K",
      outcomes: [outcome("Over 2.5", 55), outcome("Under 2.5", 45)],
    },
  ],
};

const FINAL: MatchEvent = {
  id: "esp-arg",
  round: "Final",
  venue: "New York/New Jersey",
  teamA: "Spain", codeA: "ESP", colorA: COLORS.ESP,
  teamB: "Argentina", codeB: "ARG", colorB: COLORS.ARG,
  status: "upcoming",
  dateLabel: "World Cup 2026 · Final",
  categories: [
    {
      id: "result",
      label: "Match Result",
      question: "Full-time result: Spain vs Argentina",
      vol: "$1.42M",
      outcomes: [outcome("Argentina", 52), outcome("Spain", 38), outcome("Draw", 10)],
    },
    {
      id: "totalgoals",
      label: "Total Goals",
      question: "Total Goals: ESP vs ARG over/under 2.5",
      vol: "$610K",
      outcomes: [outcome("Over 2.5", 61), outcome("Under 2.5", 39)],
    },
    {
      id: "nextgoal",
      label: "Next Goal",
      question: "Who scores next?",
      vol: "$340K",
      outcomes: [outcome("Argentina", 48), outcome("Spain", 38), outcome("No More Goals", 14)],
    },
    {
      id: "scorer",
      label: "First Scorer",
      question: "Will Lamine Yamal score anytime?",
      vol: "$580K",
      outcomes: [outcome("Lamine Yamal", 44), outcome("Other / None", 56)],
    },
  ],
};

export const EVENTS: MatchEvent[] = [FINAL, THIRD, ...SF, ...QF, ...R16];

export const TOP_TRADERS = [
  { rank: 1, name: "DeepBlue", volume: "$1.25M", change: "+24.6%" },
  { rank: 2, name: "OceanMind", volume: "$910K", change: "+18.3%" },
  { rank: 3, name: "BlueWhale", volume: "$780K", change: "+15.2%" },
  { rank: 4, name: "TideRunner", volume: "$640K", change: "+11.8%" },
];

export const SETTLEMENTS = [
  { event: "Argentina vs France", outcome: "Semi Final: Argentina", time: "2d ago" },
  { event: "Spain vs Brazil", outcome: "Semi Final: Spain", time: "2d ago" },
  { event: "Germany vs Portugal", outcome: "Quarter Final: Over 2.5", time: "5d ago" },
];

export const PROOFS: Proof[] = [
  {
    id: 1,
    event: "Argentina vs France",
    market: "Semi Final · Match Result",
    outcome: "Argentina",
    root: "0x7f3a9c2e1b4d8f60a3c5e7d9b1a2f480c891",
    sig: "5xK2pQmnWtRb3vLc8fJhYd7uNq9rT2sZ4mAoP",
    time: "Jul 17, 2026 · 21:47 UTC",
  },
  {
    id: 2,
    event: "Spain vs Brazil",
    market: "Semi Final · Match Result",
    outcome: "Spain",
    root: "0x2b88e1f4c9a03d67e4f1b8a2c5d9e0f3a0d3",
    sig: "8vY7nHqLoWzXt1bE5rCf9mKa2sVd4yQp3nM",
    time: "Jul 17, 2026 · 19:05 UTC",
  },
  {
    id: 3,
    event: "Germany vs Portugal",
    market: "Quarter Final · Total Goals",
    outcome: "Over 2.5",
    root: "0x94c1a7b053d8e2f6a1c4b9d7e0f3a8c6ff22",
    sig: "3mR5tUvXpQd8wLc1nJhF6yBa9zVe2sTo6cN",
    time: "Jul 14, 2026 · 22:47 UTC",
  },
];

// settled trades from the finished bracket (see R16/QF/SF above) — matches real results
export const RECENT_TRADES = [
  { side: "YES" as const, label: "Spain · Semi-Final vs FRA", amount: "$450", time: "Jul 15" },
  { side: "YES" as const, label: "Argentina · Semi-Final vs ENG", amount: "$620", time: "Jul 16" },
  { side: "NO" as const, label: "Portugal · Quarter-Final vs FRA", amount: "$180", time: "Jul 11" },
  { side: "YES" as const, label: "Over 2.5 · ARG vs BEL", amount: "$800", time: "Jul 12" },
  { side: "YES" as const, label: "Belgium · R16 vs USA", amount: "$95", time: "Jul 7" },
  { side: "NO" as const, label: "Draw · ESP vs GER", amount: "$210", time: "Jul 11" },
];

export const LIVE_NOW = [
  { id: "esp-arg", title: "ESP vs ARG · FINAL", flagA: "🇪🇸", flagB: "🇦🇷", codeA: "ESP", colorA: "#c60b1e", codeB: "ARG", colorB: "#3f7dbf" },
  { id: "fra-eng", title: "FRA vs ENG · 3RD PLACE", flagA: "🇫🇷", flagB: "🏴", codeA: "FRA", colorA: "#002395", codeB: "ENG", colorB: "#c60b1e" },
];

export const FAQS = [
  {
    id: 1,
    q: "What is Bluefin?",
    a: "Bluefin is a decentralized prediction market protocol for sports and real-world events. You buy YES or NO shares in outcomes, and winning positions are paid out automatically once the result is verified.",
  },
  {
    id: 2,
    q: "How are markets resolved?",
    a: "Match results stream in from TxLINE in real time, backed by cryptographic Merkle proofs anchored on Solana. When a proof is submitted on-chain, the market resolves — no human oracle involved.",
  },
  {
    id: 3,
    q: "Is Bluefin decentralized?",
    a: "Yes. Funds are held in smart contract escrow, settlement is triggered by verifiable on-chain proofs, and no single entity can alter an outcome or block a payout.",
  },
  {
    id: 4,
    q: "What can I trade on Bluefin?",
    a: "Every World Cup 2026 fixture — match results, total goals, next goal, and first scorer markets — with more competitions coming after the tournament.",
  },
  {
    id: 5,
    q: "How are payouts made?",
    a: "The moment a verified TxLINE proof lands on-chain, the settlement contract releases funds directly to winning wallets in USDC. No claims process, no waiting.",
  },
];

export const WALLET_BALANCE = "1,250 USDC";
