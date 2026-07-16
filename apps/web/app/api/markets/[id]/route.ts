import { NextResponse } from "next/server";
import { EVENTS } from "@/lib/data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === id);
  if (!event) return NextResponse.json({ error: "market not found" }, { status: 404 });
  return NextResponse.json(event);
}
