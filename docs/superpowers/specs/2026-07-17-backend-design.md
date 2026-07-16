# Bluefin Backend — Design Spec

Date: 2026-07-17
Status: Approved (design), pending spec review

## Goal

Build the Bluefin backend end to end: Rust/Axum API, real TxLINE (TxODDS) data ingestion, house-odds YES/NO markets, and trustless settlement via an Anchor program on Solana devnet. Replace the frontend's mock API routes with real data.

## Decisions (user-confirmed)

| Axis | Choice |
|------|--------|
| Backend stack | Rust/Axum (`apps/api`) |
| On-chain | Real Anchor program on devnet, mock-USDT SPL mint |
| Data feed | Real TxODDS TxLINE devnet (`https://txline-dev.txodds.com`) |
| Market model | House odds derived from TxLINE StablePrice odds; stake locked at quoted multiplier |
| Database | SQLite via sqlx (Postgres migration path preserved) |

## Architecture

```
apps/api/            Rust/Axum backend (single binary)
contracts/bluefin/   Anchor program (devnet)
packages/sdk/        TS client: types + API wrapper for apps/web
```

### apps/api modules

- **txline** — auth lifecycle: guest JWT (`POST /auth/guest/start`) → devnet on-chain `subscribe` tx (free tier: World Cup + Intl Friendlies, needs devnet SOL) → sign activation preimage `${txSig}:${leagues}:${jwt}` → `POST /api/token/activate` → API token (`X-Api-Token` header + `Authorization: Bearer ${jwt}`). Auto-refresh on expiry. SSE consumers for `/api/scores/stream` and `/api/odds/stream`; snapshot endpoints on boot/resync; Merkle proof fetch via `/api/scores/stat-validation?statKeys=...` (validateStatV2 — statKeys order is part of the proof contract) and `/api/fixtures/validation`.
- **markets** — builds markets from TxLINE World Cup fixtures; quotes YES/NO odds from live StablePrice odds plus house margin; quotes signed by backend key and expire after 30s.
- **trades** — place trade (wallet-signed on-chain `place_bet`), positions, portfolio, leaderboard.
- **settlement** — on full-time score event: fetch Merkle proof from TxLINE, call Anchor `settle` with result + proof root; program verifies against TxODDS devnet validation PDA; winners claim from escrow.
- **http** — Axum routes matching existing frontend shapes: `GET /api/markets`, `GET /api/markets/:id`, `GET /api/leaderboard`, `GET /api/proofs`, `GET /api/settlements`; new: `POST /api/trades`, `GET /api/positions/:wallet`, `GET /api/stream` (SSE pushing live odds/scores to the web UI).

### Anchor program (contracts/bluefin)

Four instructions, mock-USDT SPL mint created on devnet:

1. `init_market(market_id, fixture_id, outcome_spec)` — market PDA + escrow token account.
2. `place_bet(side, stake, odds_bps)` — transfer stake to escrow, create position PDA. Odds quote signed by backend key; contract verifies signature so it can trust the multiplier.
3. `settle(result, merkle_root)` — oracle authority (backend) posts result + TxLINE Merkle root; optionally CPI-verifies against TxODDS devnet validation account.
4. `claim` — winner withdraws `stake × odds` from escrow.

House liquidity: backend wallet pre-funds each escrow to cover max exposure; `place_bet` rejects when exposure would exceed escrow.

### Data flow

```
TxLINE SSE (scores/odds) → ingest → SQLite + in-memory state
                                   ↘ /api/stream SSE → web UI
FT result → settlement worker → fetch proof → Anchor settle → positions marked → payouts claimable
User trade: web signs place_bet tx → backend confirms + records → position appears
```

## Error handling

- TxLINE SSE drop → exponential backoff reconnect, resync via snapshots.
- Devnet RPC flakiness → retry with confirmation polling; settlement idempotent (checked in DB and on-chain state).
- Proof fetch failure → market enters `pending_settlement`, retries; never settles without proof.
- Stale quote → `place_bet` rejects expired odds signature (30s TTL).

## Testing

- Rust unit tests: odds derivation, settlement logic.
- Rust integration: mocked TxLINE server (wiremock).
- Anchor: localnet tests — bet → settle → claim happy path; reject wrong oracle.
- E2E: devnet script placing a real bet against the real TxLINE feed.

## Build order (each phase gets its own implementation plan)

1. Anchor program + localnet tests
2. Axum skeleton + TxLINE auth/ingest
3. Markets + trades + HTTP API (frontend swaps mock → real)
4. Settlement worker + proofs
5. Web wiring: SDK, real wallet trades, live SSE

## Addendum: /docs page (frontend, independent)

Navbar (home variant) gains `[ Docs ]` linking to `/docs`. Page contains a detailed write-up: what Bluefin is, how the platform works (markets → trade → resolve → settle), and how it connects with TxLINE/TxODDS (auth flow, SSE feeds, Merkle proofs, Solana anchoring). Built with existing design system (panel cards, heading font, Reveal motion). Ships immediately; does not block backend phases.

## TxLINE reference

- Docs index: https://txline-docs.txodds.com/llms.txt
- OpenAPI: https://txline.txodds.com/docs/docs.yaml (snapshot in scratchpad during build; re-fetch when implementing)
- Devnet base: `https://txline-dev.txodds.com`; devnet TxL mint: `4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG`
- Free tier: no TxL purchase required; devnet SOL needed for subscribe tx fees/rent.
