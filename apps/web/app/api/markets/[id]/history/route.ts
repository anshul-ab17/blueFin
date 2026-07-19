import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!BACKEND) return NextResponse.json({ error: "backend not configured" }, { status: 503 });
  const qs = new URL(req.url).search;
  try {
    const res = await fetch(`${BACKEND}/api/markets/${id}/history${qs}`, { cache: "no-store" });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: "backend unreachable" }, { status: 502 });
  }
}
