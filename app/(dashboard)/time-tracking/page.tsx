import type { Metadata } from "next";
import { TimeTrackingContent } from "./time-tracking-client";

export const metadata: Metadata = {
  title: "Time Tracking | FreelanceHub",
  description:
    "Log your working hours and track productivity across all your freelance projects.",
};

export default function TimeTrackingPage() {
  return <TimeTrackingContent />;
}
