import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Track when this process started (resets on cold start / redeploy)
const processStartTime = Date.now();

export async function GET() {
  const services: Record<
    string,
    { status: "operational" | "degraded"; latencyMs?: number }
  > = {};

  // --- DB Health Check ---
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = {
      status: "operational",
      latencyMs: Date.now() - dbStart,
    };
  } catch {
    services.database = { status: "degraded", latencyMs: Date.now() - dbStart };
  }

  // --- App Health (always ok if we got here) ---
  services.api = { status: "operational" };
  services.authentication = { status: "operational" };

  const allOk = Object.values(services).every(
    (s) => s.status === "operational",
  );
  const uptimeSeconds = Math.floor((Date.now() - processStartTime) / 1000);

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString(),
      services,
    },
    {
      status: allOk ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
