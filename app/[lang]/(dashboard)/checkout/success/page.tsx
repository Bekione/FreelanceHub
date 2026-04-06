"use client";

import { useEffect } from "react";
import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/translation-context";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const t = useTranslation();
  const locale = usePathname().split("/")[1] || "en";

  // Premium Two-Stage Confetti Effect
  useEffect(() => {
    const colors = ["#eab308", "#1a0b20", "#b364f1", "#a78bfa"];
    const defaults = {
      zIndex: 100,
      colors,
      shapes: ["square"] as any,
      scalar: 0.65,
    };

    confetti(
      Object.assign({}, defaults, {
        particleCount: 100,
        angle: 270,
        spread: 140,
        startVelocity: 25,
        origin: { x: 0.5, y: -0.1 },
        gravity: 0.6,
      }),
    );

    const timeout = setTimeout(() => {
      confetti(
        Object.assign({}, defaults, {
          particleCount: 120,
          angle: 90,
          spread: 120,
          startVelocity: 65,
          origin: { x: 0.5, y: 1.1 },
          gravity: 0.7,
        }),
      );
    }, 600);

    return () => clearTimeout(timeout);
  }, []);

  // Force the session to refetch so the Pro badge appears immediately.
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;

    const tryRefresh = async () => {
      attempts++;
      const { data } = await authClient.getSession({
        fetchOptions: { cache: "no-store" },
      });

      if ((data?.user as { plan?: string })?.plan === "pro") {
        router.refresh();
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(tryRefresh, 2000);
      } else {
        router.refresh();
      }
    };

    setTimeout(tryRefresh, 1000);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 glass p-10 text-center relative"
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
              {t("checkout.successTitle")}
            </h1>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              {t("checkout.successDesc")}
            </p>
          </div>
        </div>

        {/* Plan summary */}
        <div className="p-4 border border-primary/20 bg-primary/5 flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold">{t("checkout.planName")}</p>
            <p className="text-xs text-muted-foreground">
              {t("checkout.planPrice")}
            </p>
          </div>
          <span className="ml-auto text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
            {t("checkout.active")}
          </span>
        </div>

        <div className="space-y-3">
          <Button className="w-full" size="lg" asChild>
            <Link href={`/${locale}/dashboard`}>{t("checkout.goToDashboard")}</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            asChild
          >
            <Link href={`/${locale}/profile`}>{t("checkout.manageSubscription")}</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
