import { Skeleton } from "@/components/ui/skeleton";

export default function StatusLoading() {
  return (
    <div className="container mx-auto py-32 max-w-3xl">
      <div className="text-center mb-16 space-y-4">
        <Skeleton className="h-12 w-72 mx-auto" />
        <Skeleton className="h-8 w-44 mx-auto rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-xl border border-foreground/10 bg-background/50"
          >
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
