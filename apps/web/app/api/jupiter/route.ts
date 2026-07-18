import { NextResponse } from "next/server";

// Jupiter Prediction API — secondary, display-only source for live World Cup
// consensus prices. TxLINE stays the primary API and the source of truth for
// scores and settlement; nothing here feeds settlement.
const JUP_EVENTS = "https://api.jup.ag/prediction/v1/events?category=sports&limit=50";

interface JupMarket {
  title: string;
  status: string;
  pricing?: { buyYesPriceUsd: number; volume: number };
}
interface JupEvent {
  eventId: string;
  isLive: boolean;
  subcategory: string;
  metadata?: { title?: string };
  markets?: JupMarket[];
}

export async function GET() {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Jupiter not configured" }, { status: 503 });

  const res = await fetch(JUP_EVENTS, {
    headers: { "x-api-key": apiKey },
    next: { revalidate: 60 },
  });
  if (!res.ok) return NextResponse.json({ error: `Jupiter ${res.status}` }, { status: 502 });

  const { data } = (await res.json()) as { data: JupEvent[] };
  const events = (data ?? [])
    .filter((e) => e.subcategory === "fifwc")
    .map((e) => ({
      id: e.eventId,
      title: e.metadata?.title ?? "",
      live: e.isLive,
      outcomes: (e.markets ?? [])
        .filter((m) => m.status === "open" && m.pricing)
        .map((m) => ({
          label: m.title,
          // prices are micro-USD per $1 contract → percent implied probability
          pct: Math.round((m.pricing!.buyYesPriceUsd / 1_000_000) * 100),
          vol: m.pricing!.volume,
        }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 3),
    }))
    .filter((e) => e.outcomes.length > 0);

  return NextResponse.json(events);
}
