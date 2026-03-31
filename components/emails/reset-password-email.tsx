import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Img,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import React from "react";

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

export const ResetPasswordEmail = ({
  userFirstname = "Freelancer",
  resetPasswordLink = "https://freelancehub.io/auth/reset-password",
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>FreelanceHub: Reset your password</Preview>
      <Tailwind>
        <Body className="bg-white font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px] flex justify-center w-full">
              <Text className="text-black text-[24px] font-bold text-center m-0">
                FreelanceHub
              </Text>
            </Section>

            <Heading className="text-black text-[22px] font-semibold text-center p-0 mt-[10px] mb-[20px] mx-0">
              Reset your password
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Hello {userFirstname},
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Someone recently requested a password change for your FreelanceHub
              account. If this was you, you can set a new password here:
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-black rounded-lg text-white text-[13px] font-medium no-underline text-center px-6 py-3"
                href={resetPasswordLink}
              >
                Reset password
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              If you did not request a password change, please ignore this
              email.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              To keep your account secure, please do not forward this email to
              anyone.
            </Text>

            <div className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This message was sent to you by FreelanceHub. If you have
              questions, please contact support.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;
