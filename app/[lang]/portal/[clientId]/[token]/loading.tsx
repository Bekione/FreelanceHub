import { Skeleton } from "@/components/ui/skeleton";

export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header Skeleton */}
      <header className="border-b border-border/40 bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Welcome Section Skeleton */}
        <section className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96" />

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-14" />
                  </div>
                  <Skeleton className="h-11 w-11 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects + Invoices Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Active Projects */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-card overflow-hidden"
                >
                  <div className="h-1 w-full bg-border/50" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-44" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Invoices */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-4">
              {/* Unpaid group */}
              <Skeleton className="h-4 w-32" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="border-t border-border/40 mt-16 py-8">
        <div className="container max-w-5xl mx-auto px-4 text-center space-y-2">
          <Skeleton className="h-4 w-56 mx-auto" />
          <Skeleton className="h-3 w-36 mx-auto" />
        </div>
      </footer>
    </div>
  );
}
