"use client";

import { useEffect } from "react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <AppLogo className="mb-6 scale-110" />
      <h2 className="text-3xl font-bold tracking-tight mb-4">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error while processing your request. Please
        try again or return to the homepage.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
