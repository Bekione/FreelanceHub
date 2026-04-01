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
import { EmailShell } from "./email-layout";

interface Props {
  userName?: string;
  amount?: string;
  date?: string;
  invoiceUrl?: string;
}

export function PaymentReceiptEmail({
  userName = "there",
  amount = "$5.00",
  date = "May 1, 2026",
  invoiceUrl,
}: Props) {
  return (
    <EmailShell preview="Payment received — FreelanceHub Pro">
      <Preview>Payment received — FreelanceHub Pro</Preview>

      <Heading
        as="h1"
        className="m-0 mb-2 text-[26px] font-bold text-[#1a0b20]"
      >
        Payment Received
      </Heading>
      <Text className="text-[15px] text-[#7c5c7c] mt-0 mb-8">
        Hi {userName}, your monthly Pro subscription was successfully charged.
        Thanks for being a Pro member!
      </Text>

      {/* Receipt card */}
      <Section
        className="mb-8 rounded-xl overflow-hidden"
        style={{ border: "1px solid #ede6ed" }}
      >
        {/* Amount row — highlighted */}
        <Row className="px-5 py-4 bg-[#fef9ee]">
          <Column>
            <Text className="m-0 text-[13px] text-[#7c5c7c]">
              Amount charged
            </Text>
          </Column>
          <Column align="right">
            <Text className="m-0 text-[22px] font-bold text-[#eab308]">
              {amount}
            </Text>
          </Column>
        </Row>
        <Hr className="border-[#ede6ed] m-0" />
        <Row className="px-5 py-3">
          <Column>
            <Text className="m-0 text-[13px] text-[#7c5c7c]">Plan</Text>
          </Column>
          <Column align="right">
            <Text className="m-0 text-[13px] font-semibold text-[#1a0b20]">
              FreelanceHub Pro
            </Text>
          </Column>
        </Row>
        <Hr className="border-[#ede6ed] m-0" />
        <Row className="px-5 py-3">
          <Column>
            <Text className="m-0 text-[13px] text-[#7c5c7c]">Date</Text>
          </Column>
          <Column align="right">
            <Text className="m-0 text-[13px] font-semibold text-[#1a0b20]">
              {date}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* CTA */}
      {invoiceUrl && (
        <Section className="text-center">
          <Button
            href={invoiceUrl}
            className="rounded-lg bg-[#eab308] px-8 py-3 text-[14px] font-bold text-white no-underline"
          >
            View Invoice →
          </Button>
        </Section>
      )}
    </EmailShell>
  );
}

export default PaymentReceiptEmail;
