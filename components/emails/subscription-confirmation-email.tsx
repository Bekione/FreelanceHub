import {
  Button,
  Heading,
  Hr,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import React from "react";
import { EmailShell } from "./email-layout";

interface Props {
  userName?: string;
  planName?: string;
  amount?: string;
  nextBillingDate?: string;
}

export function SubscriptionConfirmationEmail({
  userName = "there",
  planName = "Pro",
  amount = "$5.00",
  nextBillingDate = "Next month",
}: Props) {
  return (
    <EmailShell preview="You're now on FreelanceHub Pro 🎉">
      <Preview>You&apos;re now on FreelanceHub Pro 🎉</Preview>

      {/* Check icon */}
      <Section className="mb-6 text-center">
        <div
          style={{
            display: "inline-block",
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: "#eab308",
            lineHeight: "56px",
            textAlign: "center",
            fontSize: 26,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          ✓
        </div>
      </Section>

      <Heading
        as="h1"
        className="m-0 mb-2 text-[26px] font-bold text-[#1a0b20] text-center"
      >
        You&apos;re now Pro!
      </Heading>
      <Text className="text-[15px] text-[#7c5c7c] text-center mt-0 mb-8">
        Welcome, {userName}. Your FreelanceHub Pro subscription is now active.
      </Text>

      {/* Plan summary card */}
      <Section
        className="mb-8 rounded-xl p-0 overflow-hidden"
        style={{ border: "1px solid #ede6ed" }}
      >
        <Row className="px-5 py-3">
          <Column>
            <Text className="m-0 text-[13px] text-[#7c5c7c]">Plan</Text>
          </Column>
          <Column align="right">
            <Text className="m-0 text-[13px] font-semibold text-[#1a0b20]">
              FreelanceHub {planName}
            </Text>
          </Column>
        </Row>
        <Hr className="border-[#ede6ed] m-0" />
        <Row className="px-5 py-3">
          <Column>
            <Text className="m-0 text-[13px] text-[#7c5c7c]">Amount</Text>
          </Column>
          <Column align="right">
            <Text className="m-0 text-[13px] font-semibold text-[#1a0b20]">
              {amount}/month
            </Text>
          </Column>
        </Row>
        <Hr className="border-[#ede6ed] m-0" />
        <Row className="px-5 py-3">
          <Column>
            <Text className="m-0 text-[13px] text-[#7c5c7c]">
              Next billing date
            </Text>
          </Column>
          <Column align="right">
            <Text className="m-0 text-[13px] font-semibold text-[#1a0b20]">
              {nextBillingDate}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* CTA */}
      <Section className="text-center">
        <Button
          href={`${process.env.BETTER_AUTH_URL || "https://freelancehub.vercel.app"}/dashboard`}
          className="rounded-lg bg-[#eab308] px-8 py-3 text-[14px] font-bold text-white no-underline"
        >
          Go to Dashboard →
        </Button>
      </Section>
    </EmailShell>
  );
}

export default SubscriptionConfirmationEmail;
