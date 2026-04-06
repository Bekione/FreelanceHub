import { getHealth } from "@/lib/health";

const SERVICE_LABELS: Record<string, string> = {
  api: "Web Application & API",
  database: "Database (PostgreSQL)",
  authentication: "Authentication Services",
};

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default async function StatusPage() {
  const health = await getHealth();

  const allOk = health.status === "ok";
  const checkedAt = new Date(health.timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const services = Object.entries(health.services).map(([key, data]) => ({
    name: SERVICE_LABELS[key] ?? key,
    status: data.status,
    latency: data.latencyMs,
  }));

  return (
    <div className="container mx-auto py-32 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          System <span className="text-gradient-primary">Status</span>
        </h1>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
            allOk
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              allOk ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          {allOk ? "All Systems Operational" : "Partial System Outage"}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Last checked: {checkedAt} · Uptime: {formatUptime(health.uptime)}
        </p>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between p-4 rounded-xl border border-foreground/10 bg-background/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  service.status === "operational"
                    ? "bg-emerald-500"
                    : "bg-red-500 animate-pulse"
                }`}
              />
              <span className="font-medium text-foreground">{service.name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {service.latency !== undefined && (
                <span className="text-muted-foreground hidden sm:block">
                  {service.latency}ms
                </span>
              )}
              <span
                className={
                  service.status === "operational"
                    ? "text-emerald-500"
                    : "text-red-500"
                }
              >
                {service.status === "operational" ? "Operational" : "Degraded"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
