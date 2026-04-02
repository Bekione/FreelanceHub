import {
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

export function AccountDeletedEmail({ userName = "there" }: Props) {
  return (
    <EmailShell preview="Your FreelanceHub account has been deleted">
      <Preview>Your FreelanceHub account has been deleted</Preview>

      <Heading
        as="h1"
        className="m-0 mb-2 text-[26px] font-bold text-[#1a0b20]"
      >
        Goodbye, {userName} 👋
      </Heading>
      <Text className="text-[15px] text-[#7c5c7c] mt-0 mb-8">
        Your FreelanceHub account and all associated data have been permanently
        deleted. We&apos;re sad to see you go.
      </Text>

      {/* Info card */}
      <Section
        className="mb-8 rounded-xl p-6"
        style={{ border: "1px solid #ede6ed", backgroundColor: "#faf7fa" }}
      >
        <Text className="m-0 text-[11px] font-semibold uppercase tracking-widest text-[#7c5c7c] mb-3">
          What was deleted
        </Text>
        <Hr className="border-[#ede6ed] mt-0 mb-4" />
        {[
          "Your account and login credentials",
          "All projects, clients, and invoices",
          "All uploaded files and attachments",
          "Your profile and subscription data",
        ].map((line) => (
          <Text key={line} className="m-0 mb-2 text-[14px] text-[#4a2f4a]">
            ✓ &nbsp;{line}
          </Text>
        ))}
      </Section>

      <Text className="text-[15px] text-[#7c5c7c] mb-8">
        If this was a mistake or you change your mind, you&apos;re always
        welcome back. Simply create a new account at any time.
      </Text>

      <Text className="text-center text-[13px] text-[#7c5c7c]">
        Have feedback for us?{" "}
        <Link
          href="mailto:support@freelancehub.vercel.app"
          className="text-[#eab308] no-underline font-semibold"
        >
          We&apos;d love to hear it
        </Link>
      </Text>
    </EmailShell>
  );
}

export default AccountDeletedEmail;
