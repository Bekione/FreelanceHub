export default function StatusPage() {
  return (
    <div className="container mx-auto py-32 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          System <span className="text-gradient-primary">Status</span>
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          All Systems Operational
        </div>
      </div>

      <div className="space-y-4">
        {[
          { name: "Web Application", uptime: "99.99%" },
          { name: "API endpoints", uptime: "99.99%" },
          { name: "Database (PostgreSQL)", uptime: "100%" },
          { name: "Authentication Services", uptime: "99.98%" },
        ].map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between p-4 rounded-xl border border-foreground/10 bg-background/50 backdrop-blur-sm"
          >
            <span className="font-medium text-foreground">{service.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {service.uptime} uptime
              </span>
              <span className="text-emerald-500">Operational</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
