# Bluefin

> **The Home of World Cup Predictions** — Powered by TxLINE

Bluefin is a decentralized football prediction exchange powered by real-time TxLINE data and trustless Solana settlement. See [`docs/Bluefin_SDD_MVP.md`](../docs/Bluefin_SDD_MVP.md) for the full software design document.

## Monorepo

Turborepo managed with [Bun](https://bun.sh).

```text
apps/
  web/        Next.js 16 frontend (App Router, Tailwind v4, Zustand)
packages/
  types/      Shared TypeScript types (@bluefin/types)
```

Planned (per SDD): `apps/api` (Rust/Axum), `contracts/bluefin` (Anchor), `packages/ui`, `packages/sdk`.

## Getting started

```bash
bun install
bun run dev     # turbo run dev → next dev on apps/web
bun run build   # production build
```

## apps/web pages

| Route | Description |
|-------|-------------|
| `/` | Landing — hero, live matches, about, how it works, FAQ |
| `/markets` | Active World Cup 2026 markets grid |
| `/trade/[eventId]` | Market detail — category tabs, YES/NO order slip, recent trades, top traders, settlements |
| `/bets` | Open positions (wallet-gated) |
| `/proofs` | Merkle proof viewer for settlements |
| `/portfolio` | Wallet overview (wallet-gated) |

## API (mock route handlers)

`GET /api/markets`, `GET /api/markets/:id`, `GET /api/leaderboard`, `GET /api/proofs`, `GET /api/settlements` — served from in-memory data, consumed via TanStack Query. Same shapes the Rust/Axum backend will serve later.

## Wallet

Phantom connects for real via `@solana/wallet-adapter` (devnet); other wallets and Gmail fall back to a demo session. Trades and balances are mocked client-side (Zustand) — on-chain settlement lands with the Anchor program in a later phase of the 5-day build plan.
