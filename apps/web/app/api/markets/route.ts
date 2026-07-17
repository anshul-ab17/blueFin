import { NextResponse } from "next/server";
import { EVENTS } from "@/lib/data";

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function GET() {
  if (BACKEND) {
    try {
      const res = await fetch(`${BACKEND}/api/markets`, { next: { revalidate: 10 } });
      if (res.ok) return NextResponse.json(await res.json());
    } catch {}
  }
  return NextResponse.json(EVENTS);
}
