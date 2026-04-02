import type { Metadata } from "next";
import { SettingsContent } from "./settings-client";

export const metadata: Metadata = {
  title: "Settings | FreelanceHub",
  description: "Manage your account, billing, and branding preferences.",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
