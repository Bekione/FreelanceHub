import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Cancelled | FreelanceHub",
};

export default function CheckoutCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="w-full max-w-md space-y-8 glass p-10 rounded-2xl text-center">
        <AppLogo className="mx-auto" />

        <div>
          <p className="text-4xl mb-4">🤔</p>
          <h1 className="text-2xl font-bold font-heading">No problem!</h1>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            You cancelled the checkout. You can upgrade to Pro anytime
            you&apos;re ready — your account stays as-is.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-muted/20 text-left space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            What you&apos;ll unlock with Pro
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>⚡ Unlimited projects, clients & invoices</li>
            <li>📊 Advanced analytics & revenue chart</li>
            <li>🎯 Priority support</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button className="w-full" size="lg" asChild>
            <Link href="/checkout">
              <Zap className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
