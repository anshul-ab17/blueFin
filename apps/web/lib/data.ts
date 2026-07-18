import type { MatchEvent, Proof } from "@bluefin/types";

// country code → flag emoji; fallback to TeamBadge when a code is missing
export const FLAGS: Record<string, string> = {
  ARG: "🇦🇷", FRA: "🇫🇷", BRA: "🇧🇷", GER: "🇩🇪", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", POR: "🇵🇹",
  ESP: "🇪🇸", NED: "🇳🇱", USA: "🇺🇸", MEX: "🇲🇽", JPN: "🇯🇵", KOR: "🇰🇷",
  ITA: "🇮🇹", BEL: "🇧🇪", CRO: "🇭🇷", URU: "🇺🇾", CAN: "🇨🇦", MAR: "🇲🇦",
};

export const EVENTS: MatchEvent[] = [
  {
    id: "bra-ger",
    teamA: "Brazil",
    teamB: "Germany",
    codeA: "BRA",
    colorA: "#1c8a3c",
    codeB: "GER",
    colorB: "#2b2b2b",
    status: "upcoming",
    dateLabel: "Today · Third Place Play-off",
    categories: [
      {
        id: "result",
        label: "Match Result",
        question: "Full-time result: Brazil vs Germany",
        vol: "$412K",
        outcomes: [
          { label: "Brazil", pct: 48, yesOdds: 2.08, noOdds: 1.92 },
          { label: "Germany", pct: 33, yesOdds: 3.03, noOdds: 1.44 },
          { label: "Draw", pct: 19, yesOdds: 5.26, noOdds: 1.23 },
        ],
      },
      {
        id: "totalgoals",
        label: "Total Goals",
        question: "Total Goals: BRA vs GER over/under 2.5",
        vol: "$225K",
        outcomes: [
          { label: "Over 2.5", pct: 57, yesOdds: 1.75, noOdds: 2.15 },
          { label: "Under 2.5", pct: 43, yesOdds: 2.32, noOdds: 1.62 },
        ],
      },
      {
        id: "scorer",
        label: "First Scorer",
        question: "Who scores first?",
        vol: "$115K",
        outcomes: [
          { label: "Vinícius Jr.", pct: 19, yesOdds: 5.25, noOdds: 1.19 },
          { label: "Rodrygo", pct: 14, yesOdds: 7.1, noOdds: 1.12 },
          { label: "Other", pct: 67, yesOdds: 1.35, noOdds: 2.85 },
        ],
      },
    ],
  },
  {
    id: "arg-fra",
    teamA: "Argentina",
    teamB: "France",
    codeA: "ARG",
    colorA: "#3f7dbf",
    codeB: "FRA",
    colorB: "#1565c0",
    status: "live",
    dateLabel: "World Cup 2026 · Final",
    score: { a: 2, b: 1 },
    timeRemaining: "45:32 · 2nd Half",
    categories: [
      {
        id: "result",
        label: "Match Result",
        question: "Full-time result: Argentina vs France",
        vol: "$1.25M",
        outcomes: [
          { label: "Argentina", pct: 68, yesOdds: 1.48, noOdds: 2.65 },
          { label: "France", pct: 27, yesOdds: 3.2, noOdds: 1.35 },
          { label: "Draw", pct: 5, yesOdds: 8.5, noOdds: 1.08 },
        ],
      },
      {
        id: "totalgoals",
        label: "Total Goals",
        question: "Total Goals: ARG vs FRA over/under 2.5",
        vol: "$540K",
        outcomes: [
          { label: "Over 2.5", pct: 64, yesOdds: 1.55, noOdds: 2.4 },
          { label: "Under 2.5", pct: 36, yesOdds: 2.75, noOdds: 1.4 },
        ],
      },
      {
        id: "nextgoal",
        label: "Next Goal",
        question: "Who scores next?",
        vol: "$310K",
        outcomes: [
          { label: "Argentina", pct: 55, yesOdds: 1.75, noOdds: 2.05 },
          { label: "France", pct: 32, yesOdds: 2.95, noOdds: 1.35 },
          { label: "No More Goals", pct: 13, yesOdds: 6.8, noOdds: 1.08 },
        ],
      },
      {
        id: "scorer",
        label: "First Scorer",
        question: "Will Mbappé score anytime?",
        vol: "$620K",
        outcomes: [
          { label: "Mbappé", pct: 58, yesOdds: 1.62, noOdds: 2.25 },
          { label: "Other / None", pct: 42, yesOdds: 2.2, noOdds: 1.65 },
        ],
      },
    ],
  },
];

export const TOP_TRADERS = [
  { rank: 1, name: "DeepBlue", volume: "$1.25M", change: "+24.6%" },
  { rank: 2, name: "OceanMind", volume: "$910K", change: "+18.3%" },
  { rank: 3, name: "BlueWhale", volume: "$780K", change: "+15.2%" },
  { rank: 4, name: "TideRunner", volume: "$640K", change: "+11.8%" },
];

export const SETTLEMENTS = [
  { event: "Argentina vs England", outcome: "Semi Final: Argentina", time: "3d ago" },
  { event: "France vs Spain", outcome: "Semi Final: France", time: "4d ago" },
  { event: "Brazil vs Portugal", outcome: "Quarter Final: Over 2.5", time: "6d ago" },
];

export const PROOFS: Proof[] = [
  {
    id: 1,
    event: "Argentina vs England",
    market: "Semi Final · Match Result",
    outcome: "Argentina",
    root: "0x7f3a9c2e1b4d8f60a3c5e7d9b1a2f480c891",
    sig: "5xK2pQmnWtRb3vLc8fJhYd7uNq9rT2sZ4mAoP",
    time: "Jul 16, 2026 · 21:47 UTC",
  },
  {
    id: 2,
    event: "France vs Spain",
    market: "Semi Final · Match Result",
    outcome: "France",
    root: "0x2b88e1f4c9a03d67e4f1b8a2c5d9e0f3a0d3",
    sig: "8vY7nHqLoWzXt1bE5rCf9mKa2sVd4yQp3nM",
    time: "Jul 15, 2026 · 21:12 UTC",
  },
  {
    id: 3,
    event: "Brazil vs Portugal",
    market: "Quarter Final · Total Goals",
    outcome: "Over 2.5",
    root: "0x94c1a7b053d8e2f6a1c4b9d7e0f3a8c6ff22",
    sig: "3mR5tUvXpQd8wLc1nJhF6yBa9zVe2sTo6cN",
    time: "Jul 13, 2026 · 22:47 UTC",
  },
];

export const RECENT_TRADES = [
  { side: "YES" as const, label: "Argentina · Match Result", amount: "$450", time: "12s ago" },
  { side: "NO" as const, label: "France · Match Result", amount: "$120", time: "48s ago" },
  { side: "YES" as const, label: "Over 2.5 · Total Goals", amount: "$800", time: "1m ago" },
  { side: "YES" as const, label: "Mbappé · First Scorer", amount: "$60", time: "2m ago" },
  { side: "NO" as const, label: "Draw · Match Result", amount: "$210", time: "3m ago" },
];

export const LIVE_NOW = [
  { id: "arg-fra", title: "ARG vs FRA · FINAL", flagA: "🇦🇷", flagB: "🇫🇷", codeA: "ARG", colorA: "#3f7dbf", codeB: "FRA", colorB: "#1565c0", score: "2 - 1", clock: "45:32 · 2nd Half" },
  { id: "bra-ger", title: "BRA vs GER · 3RD PLACE", flagA: "🇧🇷", flagB: "🇩🇪", codeA: "BRA", colorA: "#1c8a3c", codeB: "GER", colorB: "#2b2b2b", score: "1 - 0", clock: "32:11 · 1st Half" },
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
