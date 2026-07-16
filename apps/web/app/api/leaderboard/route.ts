import { NextResponse } from "next/server";
import { TOP_TRADERS } from "@/lib/data";

export function GET() {
  return NextResponse.json(TOP_TRADERS);
}
