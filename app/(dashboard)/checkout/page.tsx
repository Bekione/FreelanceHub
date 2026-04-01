import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Double check if user actually selected Pro via database attributes
  // In a real app, this page would load Stripe Elements
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="w-full max-w-md space-y-8 glass p-10 rounded-2xl relative">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />

        <div className="text-center">
          <AppLogo className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold font-heading">
            Complete Your Upgrade
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            You've built your profile. Let's unlock Pro features to turbocharge
            your freelance business.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
          <div>
            <h3 className="font-semibold text-sm">Pro Plan Selected</h3>
            <p className="text-xs text-muted-foreground mt-1">
              $5/mo billed clearly. You'll get access to tax analytics, custom
              branding, and limitless storage.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <Button className="w-full py-6 text-lg" size="lg">
            Proceed to Payment
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/dashboard">Skip for now, keep me on Free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
