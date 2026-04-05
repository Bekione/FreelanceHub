import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CheckoutButton } from "./checkout-button";
import type { Metadata } from "next";
import { CheckoutCardAnimator } from "./checkout-card-animator";

export const metadata: Metadata = {
  title: "Upgrade to Pro | FreelanceHub",
};

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // If already Pro, redirect to manage subscription
  if ((session.user as { plan?: string }).plan === "pro") {
    redirect("/profile");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <CheckoutCardAnimator className="w-full max-w-md space-y-8 glass p-10 rounded-2xl relative">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />

        <div className="text-center">
          <AppLogo className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold font-heading">Upgrade to Pro</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Unlock all features and streamline your freelance business.
          </p>
        </div>

        {/* Plan Details */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
          <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">
              FreelanceHub Pro — $5/month
            </h3>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
              <li>✓ Unlimited projects, clients & invoices</li>
              <li>✓ Advanced analytics & revenue tracking</li>
              <li>✓ Priority support</li>
              <li>✓ Cancel anytime</li>
            </ul>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="space-y-2">
          {[
            "No hidden fees — just $5/mo flat",
            "Auto-renews monthly, cancel any time",
            "Secure payment via Stripe",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <CheckoutButton />
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/dashboard">Skip for now, stay on Free</Link>
          </Button>
        </div>
      </CheckoutCardAnimator>
    </div>
  );
}
