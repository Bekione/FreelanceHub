import type { Metadata } from "next";
import { ProfileContent } from "./profile-client";

export const metadata: Metadata = {
  title: "Profile Settings | FreelanceHub",
  description:
    "Manage your personal information, security, and account preferences.",
};

export default function ProfilePage() {
  return <ProfileContent />;
}
