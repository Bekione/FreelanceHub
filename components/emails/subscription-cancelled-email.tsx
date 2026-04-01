import {
  Button,
  Heading,
  Hr,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailShell } from "./email-layout";

interface Props {
  userName?: string;
}

export function SubscriptionCancelledEmail({ userName = "there" }: Props) {
  return (
    <EmailShell preview="Your FreelanceHub Pro subscription has ended">
      <Preview>Your FreelanceHub Pro subscription has ended</Preview>

      <Heading
        as="h1"
        className="m-0 mb-2 text-[26px] font-bold text-[#1a0b20]"
      >
        Subscription Cancelled
      </Heading>
      <Text className="text-[15px] text-[#7c5c7c] mt-0 mb-8">
        Hi {userName}, your FreelanceHub Pro subscription has been cancelled.
        Your account is now on the Free plan.
      </Text>

      {/* Info card */}
      <Section
        className="mb-8 rounded-xl p-6"
        style={{ border: "1px solid #ede6ed", backgroundColor: "#faf7fa" }}
      >
        <Text className="m-0 text-[11px] font-semibold uppercase tracking-widest text-[#7c5c7c] mb-3">
          What happens now
        </Text>
        <Hr className="border-[#ede6ed] mt-0 mb-4" />
        {[
          "Your account is now on the Free plan",
          "All your data — projects, clients, invoices — stays safe",
          "Pro-only features have been disabled",
          "You can resubscribe anytime",
        ].map((line) => (
          <Text key={line} className="m-0 mb-2 text-[14px] text-[#4a2f4a]">
            ✓ &nbsp;{line}
          </Text>
        ))}
      </Section>

      {/* CTA */}
      <Section className="mb-6 text-center">
        <Button
          href={`${process.env.BETTER_AUTH_URL || "https://freelancehub.vercel.app"}/checkout`}
          className="rounded-lg bg-[#eab308] px-8 py-3 text-[14px] font-bold text-white no-underline"
        >
          Resubscribe to Pro →
        </Button>
      </Section>

      <Text className="text-center text-[13px] text-[#7c5c7c]">
        What made you cancel?{" "}
        <Link
          href="mailto:support@freelancehub.vercel.app"
          className="text-[#eab308] no-underline font-semibold"
        >
          We&apos;d love your feedback
        </Link>
      </Text>
    </EmailShell>
  );
}

export default SubscriptionCancelledEmail;
