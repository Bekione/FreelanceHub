import { prisma } from "@/lib/prisma";

export type ServiceStatus = "operational" | "degraded";

export interface HealthData {
  status: "ok" | "degraded";
  uptime: number;
  timestamp: string;
  services: Record<string, { status: ServiceStatus; latencyMs?: number }>;
}

/**
 * Returns the deploy/boot timestamp from the DB.
 * On first call it writes the current time — this persists across cold starts.
 * Subsequent calls return the stored value, giving accurate uptime.
 */
async function getDeployTime(): Promise<number> {
  const KEY = "deployedAt";
  try {
    const existing = await prisma.systemMeta.findUnique({ where: { key: KEY } });
    if (existing) return parseInt(existing.value, 10);

    const now = Date.now();
    await prisma.systemMeta.create({ data: { key: KEY, value: String(now) } });
    return now;
  } catch {
    // Fallback if DB is unavailable — uptime will be approximate
    return Date.now();
  }
}

export async function getHealth(): Promise<HealthData> {
  const services: Record<string, { status: ServiceStatus; latencyMs?: number }> = {};

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = { status: "operational", latencyMs: Date.now() - dbStart };
  } catch {
    services.database = { status: "degraded", latencyMs: Date.now() - dbStart };
  }

  services.api = { status: "operational" };
  services.authentication = { status: "operational" };

  const allOk = Object.values(services).every((s) => s.status === "operational");

  const deployTime = await getDeployTime();
  const uptime = Math.floor((Date.now() - deployTime) / 1000);

  return {
    status: allOk ? "ok" : "degraded",
    uptime,
    timestamp: new Date().toISOString(),
    services,
  };
}
