import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { readFileSync } from "fs";
import { join } from "path";
import { hasLocale, freeLocales } from "@/lib/i18n/config";
import { isPro } from "@/lib/subscription/limits";
import type { FreeLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | FreelanceHub",
  },
};

// Read once at module load — version only changes on deploy
const pkg = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf-8"),
);

export default async function DashboardGroupLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${lang}/login`);
  }

  if (!session.user.onboardingCompleted) {
    redirect(`/${lang}/onboarding`);
  }

  // Gate: if the URL locale is Pro-only and the user is on the free plan,
  // redirect to the same page under /en/ and reset the NEXT_LOCALE cookie.
  // The sidebar now uses locale-prefixed links so this only fires on the
  // initial entry (e.g. landing page set ar → clicked "Get Started").
  const isFreeUser = !isPro((session.user as any).subscriptionStatus);
  const isProLocale = !freeLocales.includes(lang as FreeLocale);
  if (isFreeUser && isProLocale) {
    // Preserve the page path, just swap locale to "en"
    // e.g. /ar/projects → /en/projects
    redirect(`/en/dashboard`);
  }

  return <DashboardLayout version={pkg.version}>{children}</DashboardLayout>;
}
