import { NextResponse } from "next/server";
import { PROOFS } from "@/lib/data";

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function GET() {
  if (BACKEND) {
    try {
      const res = await fetch(`${BACKEND}/api/proofs`, { next: { revalidate: 30 } });
      if (res.ok) return NextResponse.json(await res.json());
    } catch {}
  }
  return NextResponse.json(PROOFS);
}
