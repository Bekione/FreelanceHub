import { NextResponse } from "next/server";
import { Resend } from "resend";
import * as React from "react";
import { AccountDeletedEmail } from "@/components/emails/account-deleted-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const firstName = name ? name.split(" ")[0] : "there";
    console.log(`\n📧 Sending Farewell Email to ${email}...\n`);

    await resend.emails.send({
      from: "FreelanceHub <onboarding@resend.dev>",
      to: [email],
      subject: "We're sorry to see you go — account deleted",
      react: React.createElement(AccountDeletedEmail, { userName: firstName }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Farewell Email Error:", error);
    return NextResponse.json(
      { error: "Failed to send farewell email" },
      { status: 500 },
    );
  }
}
