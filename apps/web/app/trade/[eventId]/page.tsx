import { notFound } from "next/navigation";
import TradeView from "./trade-view";
import { EVENTS } from "@/lib/data";

export function generateStaticParams() {
  return EVENTS.map((e) => ({ eventId: e.id }));
}

export const metadata = { title: "Trade — Bluefin" };

export default async function TradePage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { eventId } = await params;
  const { category } = await searchParams;
  const event = EVENTS.find((e) => e.id === eventId);
  if (!event) notFound();
  return <TradeView event={event} initialCategoryId={category} />;
}
