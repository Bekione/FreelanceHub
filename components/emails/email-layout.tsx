/**
 * Shared FreelanceHub email layout — used by all emails.
 * Light theme: white background, dark-purple text, yellow primary.
 * Color values are the hex equivalents of the globals.css oklch tokens.
 *
 * Primary (yellow):  #eab308  (oklch 0.852 0.199 91.936 ≈)
 * Foreground:        #1a0b20  (oklch 0.145 0.008 326 ≈)
 * Muted text:        #7c5c7c  (oklch 0.542 0.034 322.5 ≈)
 * Border:            #ede6ed  (oklch 0.922 0.005 325.62 ≈)
 */

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import React from "react";

// Cloudinary-hosted assets — always available regardless of deployment environment
const BASE_URL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://freelancehub.vercel.app";

export const LOGO_URL =
  "https://res.cloudinary.com/dzhobawko/image/upload/v1775039499/freelance-hub/images/logo-light.png";
export const ICON_X_URL =
  "https://res.cloudinary.com/dzhobawko/image/upload/w_40,c_fill,ar_1:1/v1775031296/freelance-hub/images/icon-x.png";
export const ICON_BSK_URL =
  "https://res.cloudinary.com/dzhobawko/image/upload/w_40,c_fill,ar_1:1/v1775031295/freelance-hub/images/icon-bsky.png";
export const ICON_GH_URL =
  "https://res.cloudinary.com/dzhobawko/image/upload/w_40,c_fill,ar_1:1/v1775040040/freelance-hub/images/icon-github.png";

// ─── Shared footer ───────────────────────────────────────────────
export function EmailFooter() {
  return (
    <>
      <Hr className="border-[#ede6ed] my-8 mx-0 w-full" />

      {/* Social icons */}
      <Section className="mb-4">
        <Row>
          <Column align="center">
            <Link href="#" style={{ display: "inline-block", margin: "0 6px" }}>
              <Img src={ICON_X_URL} width={20} height={20} alt="X (Twitter)" />
            </Link>
            <Link href="#" style={{ display: "inline-block", margin: "0 6px" }}>
              <Img src={ICON_BSK_URL} width={20} height={20} alt="Bluesky" />
            </Link>
            <Link href="#" style={{ display: "inline-block", margin: "0 6px" }}>
              <Img src={ICON_GH_URL} width={20} height={20} alt="GitHub" />
            </Link>
          </Column>
        </Row>
      </Section>

      {/* Footer links */}
      <Section className="mb-3">
        <Row>
          <Column align="center">
            <Link
              href={`${BASE_URL}/privacy`}
              className="text-[11px] text-[#7c5c7c] no-underline mx-2"
            >
              Privacy
            </Link>
            <Link
              href={`${BASE_URL}/terms`}
              className="text-[11px] text-[#7c5c7c] no-underline mx-2"
            >
              Terms
            </Link>
            <Link
              href={`${BASE_URL}/profile`}
              className="text-[11px] text-[#7c5c7c] no-underline mx-2"
            >
              Manage Subscription
            </Link>
          </Column>
        </Row>
      </Section>

      <Text className="text-center text-[11px] text-[#a890a8] m-0">
        © 2026 FreelanceHub. All rights reserved.
      </Text>
    </>
  );
}

// ─── Shared wrapper that all email templates use ──────────────────
export function EmailShell({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      {/* Preview text is set per-email via the Preview component inline */}
      <Tailwind>
        <Body
          className="bg-[#f8f4f8] font-sans m-0 p-0"
          style={{ backgroundColor: "#f8f4f8" }}
        >
          <Container
            width={540}
            className="bg-white mx-auto my-10 rounded-2xl overflow-hidden shadow-sm"
            style={{
              maxWidth: "540px",
              width: "100%",
              margin: "40px auto",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Header */}
            <Section
              className="bg-[#1a0b20] px-8 py-5"
              style={{ backgroundColor: "#1a0b20" }}
            >
              <Img
                src={LOGO_URL}
                width="160"
                alt="FreelanceHub"
                style={{ width: "160px", height: "auto", display: "block" }}
              />
            </Section>

            {/* Content */}
            <Section className="px-8 py-8">{children}</Section>

            {/* Footer */}
            <Section className="px-8 pb-8">
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
