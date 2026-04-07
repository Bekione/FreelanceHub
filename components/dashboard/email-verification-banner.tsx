"use client";

import { useState, useTransition, useEffect } from "react";
import {
  MailCheck,
  X,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/translation-context";

export function EmailVerificationBanner() {
  const { data: session, refetch } = authClient.useSession();
  const t = useTranslation();
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  // Persistent Cooldown
  useEffect(() => {
    const checkCooldown = () => {
      const lastSent = localStorage.getItem("otp-last-sent");
      if (lastSent) {
        const remaining =
          60 - Math.floor((Date.now() - parseInt(lastSent)) / 1000);
        if (remaining > 0) {
          setCooldown(remaining);
        } else {
          setCooldown(0);
        }
      }
    };
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load dismissed and acknowledged states
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("email-verification-dismissed") === "true") {
        setDismissed(true);
      }
      if (localStorage.getItem("email-verification-acknowledged") === "true") {
        setAcknowledged(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("email-verification-dismissed", "true");
    }
  };

  const handleAcknowledge = () => {
    setAcknowledged(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("email-verification-acknowledged", "true");
    }
  };

  // Only hide if: no session, OR (email is verified AND the thanks banner is acknowledged)
  if (!session || (session.user.emailVerified && acknowledged)) return null;

  const email = session.user.email;

  const handleResend = () => {
    if (cooldown > 0) return;
    localStorage.setItem("otp-last-sent", Date.now().toString());
    setCooldown(60);
    startTransition(async () => {
      const { error } = await (authClient as any).emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) {
        toast.error(t("toasts.verificationSentFail"));
      } else {
        setShowOTP(true);
        toast.success(t("toasts.verificationSent"));
      }
    });
  };

  const handleVerify = () => {
    if (otp.length < 6) return;
    startTransition(async () => {
      const { error } = await (authClient as any).emailOtp.verifyEmail({
        email,
        otp,
      });
      if (error) {
        toast.error(t("toasts.invalidVerificationCode"));
        setOtp("");
      } else {
        // Show a "Thank you" success state — no full page reload
        setVerified(true);
        setShowOTP(false);
        // Silently refresh the session in the background
        if (refetch) refetch();
      }
    });
  };

  // ── Success state ──────────────────────────────────────────────
  if (session.user.emailVerified || verified) {
    return (
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-2.5 flex items-center gap-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex-1">
          {t("emailVerification.successTitle")}
        </span>
        <span className="text-sm text-emerald-600 dark:text-emerald-500 hidden sm:block">
          {t("emailVerification.successMessage")}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-emerald-600 ml-2 shrink-0"
          onClick={handleAcknowledge}
        >
          {t("emailVerification.successDismiss")}
        </Button>
      </div>
    );
  }

  // ── Unverified state ───────────────────────────────────────────
  if (dismissed) return null;
  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 flex-1 min-w-0">
        <MailCheck className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium truncate">
          {t("emailVerification.bannerMessage")}
        </span>
      </div>

      {showOTP ? (
        <div className="flex items-center gap-2 shrink-0">
          <Input
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder={t("emailVerification.codePlaceholder")}
            maxLength={6}
            className="w-32 h-8 text-center font-mono text-sm tracking-widest border-amber-500/50 bg-background"
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleVerify}
            disabled={isPending || otp.length < 6}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("emailVerification.verify")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-muted-foreground gap-1"
            onClick={handleResend}
            disabled={isPending || cooldown > 0}
          >
            <RefreshCw className="h-3 w-3" />
            {t("emailVerification.resend")} {cooldown > 0 && `(${cooldown}s)`}
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 shrink-0"
          onClick={handleResend}
          disabled={isPending || cooldown > 0}
        >
          {isPending ? t("common.sending") : t("emailVerification.enterCode")}
          {cooldown > 0 && !isPending && ` (${cooldown}s)`}
        </Button>
      )}

      <button
        onClick={handleDismiss}
        className="ml-auto shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={t("common.dismiss")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
