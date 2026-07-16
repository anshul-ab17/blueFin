import { NextResponse } from "next/server";
import { EVENTS } from "@/lib/data";

export function GET() {
  return NextResponse.json(EVENTS);
}
