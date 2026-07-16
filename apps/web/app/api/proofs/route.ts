import { NextResponse } from "next/server";
import { PROOFS } from "@/lib/data";

export function GET() {
  return NextResponse.json(PROOFS);
}
