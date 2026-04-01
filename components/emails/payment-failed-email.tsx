import {
  Button,
  Heading,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";
import { EmailShell } from "./email-layout";

interface Props {
  userName?: string;
  updatePaymentUrl?: string;
}

export function PaymentFailedEmail({
  userName = "there",
  updatePaymentUrl = "https://freelancehub.vercel.app/profile",
}: Props) {
  return (
    <EmailShell preview="Action required — your payment failed">
      <Preview>Action required — your payment failed</Preview>

      {/* Alert icon */}
      <Section className="mb-4 text-center">
        <Text className="m-0 text-[40px]">⚠️</Text>
      </Section>

      <Heading
        as="h1"
        className="m-0 mb-2 text-[26px] font-bold text-[#1a0b20] text-center"
      >
        Payment Failed
      </Heading>
      <Text className="text-[15px] text-[#7c5c7c] text-center mt-0 mb-6">
        Hi {userName}, we couldn&apos;t process your FreelanceHub Pro payment.
        Please update your payment method to keep your Pro access.
      </Text>

      {/* Warning card */}
      <Section
        className="mb-8 rounded-xl p-5"
        style={{
          border: "1px solid #fca5a5",
          backgroundColor: "#fff5f5",
        }}
      >
        <Text className="m-0 text-[14px] text-[#b91c1c] leading-relaxed">
          Your subscription will be paused if we&apos;re unable to collect
          payment. Update your card details below to avoid any interruption to
          your Pro features.
        </Text>
      </Section>

      {/* CTA */}
      <Section className="mb-6 text-center">
        <Button
          href={updatePaymentUrl}
          className="rounded-lg bg-[#eab308] px-8 py-3 text-[14px] font-bold text-white no-underline"
        >
          Update Payment Method →
        </Button>
      </Section>

      <Text className="text-center text-[13px] text-[#7c5c7c]">
        Need help?{" "}
        <Link
          href="mailto:support@freelancehub.vercel.app"
          className="text-[#eab308] no-underline font-semibold"
        >
          Contact Support
        </Link>
      </Text>
    </EmailShell>
  );
}

export default PaymentFailedEmail;
