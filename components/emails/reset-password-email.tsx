import {
  Heading,
  Button,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailShell } from "./email-layout";

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

export const ResetPasswordEmail = ({
  userFirstname = "Freelancer",
  resetPasswordLink = "https://freelancehub.vercel.app/auth/reset-password",
}: ResetPasswordEmailProps) => {
  return (
    <EmailShell preview="FreelanceHub: Reset your password">
      <Preview>FreelanceHub: Reset your password</Preview>

      <Heading
        as="h1"
        className="m-0 mb-2 text-[26px] font-bold text-[#1a0b20]"
      >
        Reset your password
      </Heading>

      <Text className="text-[15px] text-[#7c5c7c] mt-0 mb-3">
        Hello {userFirstname},
      </Text>

      <Text className="text-[15px] text-[#7c5c7c] mt-0 mb-8">
        Someone recently requested a password change for your FreelanceHub
        account. If this was you, click the button below to set a new password:
      </Text>

      <Section className="mb-8 text-center">
        <Button
          href={resetPasswordLink}
          className="rounded-lg bg-[#eab308] px-8 py-3 text-[14px] font-bold text-white no-underline"
        >
          Reset Password →
        </Button>
      </Section>

      <Text className="text-[14px] text-[#a890a8]">
        If you did not request a password change, please ignore this email. To
        keep your account secure, do not forward this email to anyone.
      </Text>
    </EmailShell>
  );
};

export default ResetPasswordEmail;
