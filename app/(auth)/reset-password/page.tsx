import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Securely change your FreelanceHub password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
