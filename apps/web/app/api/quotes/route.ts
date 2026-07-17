import { NextResponse, type NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function POST(req: NextRequest) {
  if (!BACKEND) return NextResponse.json({ error: "no backend" }, { status: 503 });
  const body = await req.text();
  const res = await fetch(`${BACKEND}/api/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
