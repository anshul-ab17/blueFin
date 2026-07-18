import type { MatchEvent, Proof } from "@bluefin/types";

// kept for any legacy emoji fallback references; real flag rendering uses FlagIcon component
export const FLAGS: Record<string, string> = {};

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
    id: "esp-arg",
    teamA: "Spain",
    teamB: "Argentina",
    codeA: "ESP",
    colorA: "#c60b1e",
    codeB: "ARG",
    colorB: "#3f7dbf",
    status: "live",
    dateLabel: "World Cup 2026 · Final",
    score: { a: 1, b: 1 },
    timeRemaining: "67:14 · 2nd Half",
    categories: [
      {
        id: "result",
        label: "Match Result",
        question: "Full-time result: Spain vs Argentina",
        vol: "$1.42M",
        outcomes: [
          { label: "Argentina", pct: 52, yesOdds: 1.92, noOdds: 2.05 },
          { label: "Spain", pct: 38, yesOdds: 2.65, noOdds: 1.52 },
          { label: "Draw", pct: 10, yesOdds: 6.8, noOdds: 1.12 },
        ],
      },
      {
        id: "totalgoals",
        label: "Total Goals",
        question: "Total Goals: ESP vs ARG over/under 2.5",
        vol: "$610K",
        outcomes: [
          { label: "Over 2.5", pct: 61, yesOdds: 1.65, noOdds: 2.2 },
          { label: "Under 2.5", pct: 39, yesOdds: 2.55, noOdds: 1.45 },
        ],
      },
      {
        id: "nextgoal",
        label: "Next Goal",
        question: "Who scores next?",
        vol: "$340K",
        outcomes: [
          { label: "Argentina", pct: 48, yesOdds: 2.05, noOdds: 1.95 },
          { label: "Spain", pct: 38, yesOdds: 2.6, noOdds: 1.5 },
          { label: "No More Goals", pct: 14, yesOdds: 6.2, noOdds: 1.1 },
        ],
      },
      {
        id: "scorer",
        label: "First Scorer",
        question: "Will Lamine Yamal score anytime?",
        vol: "$580K",
        outcomes: [
          { label: "Lamine Yamal", pct: 44, yesOdds: 2.25, noOdds: 1.78 },
          { label: "Other / None", pct: 56, yesOdds: 1.78, noOdds: 2.15 },
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

export const RECENT_TRADES = [
  { side: "YES" as const, label: "Argentina · Match Result", amount: "$450", time: "8s ago" },
  { side: "NO" as const, label: "Spain · Match Result", amount: "$180", time: "34s ago" },
  { side: "YES" as const, label: "Over 2.5 · Total Goals", amount: "$800", time: "1m ago" },
  { side: "YES" as const, label: "Yamal · First Scorer", amount: "$95", time: "2m ago" },
  { side: "NO" as const, label: "Draw · Match Result", amount: "$210", time: "3m ago" },
];

export const LIVE_NOW = [
  { id: "esp-arg", title: "ESP vs ARG · FINAL", flagA: "🇪🇸", flagB: "🇦🇷", codeA: "ESP", colorA: "#c60b1e", codeB: "ARG", colorB: "#3f7dbf", score: "1 - 1", clock: "67:14 · 2nd Half" },
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
