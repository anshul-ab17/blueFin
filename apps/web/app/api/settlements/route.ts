import { NextResponse } from "next/server";
import { SETTLEMENTS } from "@/lib/data";

export function GET() {
  return NextResponse.json(SETTLEMENTS);
}
