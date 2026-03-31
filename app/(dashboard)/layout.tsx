import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | FreelanceHub",
  },
};

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user && !session.user.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
