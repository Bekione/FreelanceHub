"use client";

import { useEffect } from "react";
import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

export default function CheckoutSuccessPage() {
  const router = useRouter();

  // Premium Two-Stage Confetti Effect
  useEffect(() => {
    const colors = ["#eab308", "#1a0b20", "#b364f1", "#a78bfa"];
    const defaults = {
      zIndex: 100,
      colors,
      shapes: ["square"] as any,
      scalar: 0.65, // Delicate, smaller rectangles
    };

    // Top burst popping downwards
    confetti(
      Object.assign({}, defaults, {
        particleCount: 100, // Thinner, elegant burst
        angle: 270, // Straight down
        spread: 140, // Wider cone to cover the screen
        startVelocity: 25, // Gentle push so it drifts
        origin: { x: 0.5, y: -0.1 },
        gravity: 0.6, // Slower fall rate
      }),
    );

    // Bottom burst popping upwards after 600ms
    const timeout = setTimeout(() => {
      confetti(
        Object.assign({}, defaults, {
          particleCount: 120, // Less clustered
          angle: 90, // Straight up
          spread: 120, // Wide cone
          startVelocity: 65, // Shoot up past the card
          origin: { x: 0.5, y: 1.1 },
          gravity: 0.7, // Slower fall back down
        }),
      );
    }, 600);

    return () => clearTimeout(timeout);
  }, []);

  // Force the session to refetch so the Pro badge appears immediately.
  // We poll a couple of times because the webhook may still be processing.
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;

    const tryRefresh = async () => {
      attempts++;
      // Refetch the session from the server
      const { data } = await authClient.getSession({
        fetchOptions: { cache: "no-store" },
      });

      // If plan is now "pro" — we're done
      if ((data?.user as { plan?: string })?.plan === "pro") {
        router.refresh();
        return;
      }

      // Otherwise keep polling (webhook may still be in-flight)
      if (attempts < maxAttempts) {
        setTimeout(tryRefresh, 2000);
      } else {
        // Last resort: hard refresh so next navigation picks up DB state
        router.refresh();
      }
    };

    // Give Stripe 1 second head start before first check
    setTimeout(tryRefresh, 1000);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 glass p-10 rounded-2xl text-center relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-8 w-40 h-20 bg-primary/30 blur-3xl rounded-full" />

        <AppLogo className="mx-auto" />

        {/* Success Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading">
              You&apos;re Pro! 🎉
            </h1>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Your subscription is active. A confirmation email is on its way.
              Pro features are unlocked across your dashboard.
            </p>
          </div>
        </div>

        {/* Plan summary */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold">FreelanceHub Pro</p>
            <p className="text-xs text-muted-foreground">
              $5/month · Renews automatically
            </p>
          </div>
          <span className="ml-auto text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
            Active
          </span>
        </div>

        <div className="space-y-3">
          <Button className="w-full" size="lg" asChild>
            <Link href="/dashboard">Go to Dashboard →</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            asChild
          >
            <Link href="/profile">Manage Subscription</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
