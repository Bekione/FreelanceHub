import { NextResponse } from "next/server";
import { getHealth } from "@/lib/health";

export async function GET() {
  const data = await getHealth();

  return NextResponse.json(data, {
    status: data.status === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
