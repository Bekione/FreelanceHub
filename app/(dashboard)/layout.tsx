import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readFileSync } from "fs";
import { join } from "path";

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
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user && !session.user.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <DashboardLayout version={pkg.version}>{children}</DashboardLayout>;
}
