// Typed fetch helpers for the Bluefin API backend.
// Set NEXT_PUBLIC_API_URL (e.g. http://localhost:3001) to enable live data.
// Falls back to undefined — callers should use static data.ts when no URL is set.

import type { MatchEvent, Proof } from "@bluefin/types";

const BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

async function apiFetch<T>(path: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function getMarkets(): Promise<MatchEvent[] | null> {
  return apiFetch<MatchEvent[]>("/api/markets");
}

export async function getMarket(id: string): Promise<MatchEvent | null> {
  return apiFetch<MatchEvent>(`/api/markets/${id}`);
}

export async function getLeaderboard(): Promise<
  { rank: number; name: string; volume: string; change: string }[] | null
> {
  return apiFetch("/api/leaderboard");
}

export async function getSettlements(): Promise<
  { event: string; outcome: string; time: string }[] | null
> {
  return apiFetch("/api/settlements");
}

export async function getProofs(): Promise<Proof[] | null> {
  return apiFetch<Proof[]>("/api/proofs");
}

export async function getPositions(
  wallet: string,
): Promise<
  {
    id: number;
    event: string;
    category: string;
    outcome: string;
    side: string;
    stake: number;
    odds: number;
    payout: number;
    status: string;
  }[]
> {
  if (!BASE) return [];
  try {
    const res = await fetch(`${BASE}/api/positions/${wallet}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Subscribe to live updates. Returns unsubscribe fn. */
export function subscribeToStream(
  onEvent: (data: { type: string; marketId?: string }) => void,
): () => void {
  if (!BASE || typeof EventSource === "undefined") return () => {};
  const es = new EventSource(`${BASE}/api/stream`);
  es.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data));
    } catch {}
  };
  return () => es.close();
}
