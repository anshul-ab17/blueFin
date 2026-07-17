import { NextResponse, type NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function GET(_req: NextRequest, { params }: { params: Promise<{ wallet: string }> }) {
  const { wallet } = await params;
  if (BACKEND) {
    try {
      const res = await fetch(`${BACKEND}/api/positions/${wallet}`);
      if (res.ok) return NextResponse.json(await res.json());
    } catch {}
  }
  return NextResponse.json([]);
}
