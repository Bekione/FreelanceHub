import { Heading, Preview, Section, Text } from "@react-email/components";
import { EmailShell } from "./email-layout";

interface VerifyEmailOTPEmailProps {
  otp?: string;
}

export const VerifyEmailOTPEmail = ({
  otp = "000000",
}: VerifyEmailOTPEmailProps) => {
  return (
    <EmailShell preview="Your FreelanceHub verification code">
      <Preview>Your FreelanceHub verification code: {otp}</Preview>

      <Heading
        as="h1"
        className="m-0 mb-2 text-[26px] font-bold text-[#1a0b20]"
      >
        Verify your email
      </Heading>

      <Text className="text-[15px] text-[#7c5c7c] mt-0 mb-6">
        Enter the code below in FreelanceHub to verify your email address. This
        code expires in 10 minutes.
      </Text>

      <Section className="mb-8 text-center">
        <div
          style={{
            display: "inline-block",
            background: "#faf5ff",
            border: "2px solid #e9d5ff",
            borderRadius: "12px",
            padding: "16px 36px",
          }}
        >
          <Text
            style={{
              fontSize: "36px",
              fontWeight: "800",
              letterSpacing: "10px",
              color: "#7c3aed",
              margin: 0,
              fontFamily: "monospace",
            }}
          >
            {otp}
          </Text>
        </div>
      </Section>

      <Text className="text-[14px] text-[#a890a8]">
        If you didn&apos;t create a FreelanceHub account, you can safely ignore
        this email.
      </Text>
    </EmailShell>
  );
};

export default VerifyEmailOTPEmail;
