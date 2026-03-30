import type { Metadata } from "next";
import { DashboardContent } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard | FreelanceHub",
  description:
    "Overview of your freelance business metrics and recent activity.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
