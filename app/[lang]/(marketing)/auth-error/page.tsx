"use client";

import { useSearchParams } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 pt-16 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <AppLogo className="mb-8 scale-110" />
      <h1 className="text-3xl font-bold mb-4 font-heading">
        Authentication Error
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        {error === "unable_to_create_user"
          ? "We couldn't create your account at this time. This usually happens if the email is already registered using a different sign-in method, or the database is out of sync."
          : "An unexpected error occurred during authentication. Please try again or return to the home page."}
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/register">Try Again</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
