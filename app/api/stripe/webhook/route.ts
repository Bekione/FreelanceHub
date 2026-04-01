import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import Stripe from "stripe";
import { SubscriptionConfirmationEmail } from "@/components/emails/subscription-confirmation-email";
import { PaymentReceiptEmail } from "@/components/emails/payment-receipt-email";
import { PaymentFailedEmail } from "@/components/emails/payment-failed-email";
import { SubscriptionCancelledEmail } from "@/components/emails/subscription-cancelled-email";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[STRIPE_WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[STRIPE_WEBHOOK] Processing event:", event.type);

  try {
    switch (event.type) {
      // ─── User subscribes ────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        console.log("[WEBHOOK] checkout.session.completed — userId:", userId);
        if (!userId || session.mode !== "subscription") break;

        // Retrieve subscription — cast broadly to access runtime fields
        const subscriptionRaw = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        // Safely extract current_period_end regardless of API version typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawEnd = (subscriptionRaw as any).current_period_end;
        const periodEnd =
          typeof rawEnd === "number" && !isNaN(rawEnd)
            ? new Date(rawEnd * 1000)
            : null;

        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "pro",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionRaw.id,
            subscriptionStatus: subscriptionRaw.status,
            currentPeriodEnd: periodEnd,
          },
        });
        console.log("[WEBHOOK] User updated to pro:", user.id);

        // Send confirmation email — isolated so a failure won't undo the DB update
        try {
          await resend.emails.send({
            from: "FreelanceHub <onboarding@resend.dev>",
            to: [user.email],
            subject: "Welcome to FreelanceHub Pro! 🎉",
            react: React.createElement(SubscriptionConfirmationEmail, {
              userName: user.name.split(" ")[0],
              planName: "Pro",
              amount: "$5.00",
              nextBillingDate: periodEnd
                ? periodEnd.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Next month",
            }),
          });
          console.log("[WEBHOOK] Confirmation email sent to:", user.email);
        } catch (emailErr) {
          console.error("[WEBHOOK] Email send failed (non-fatal):", emailErr);
        }
        break;
      }

      // ─── Subscription updated (e.g. reactivated, plan changed) ──────
      case "customer.subscription.updated": {
        const subRaw = event.data.object as unknown as Stripe.Subscription & {
          current_period_end: number;
        };
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subRaw.id },
          data: {
            subscriptionStatus: subRaw.status,
            currentPeriodEnd: new Date(subRaw.current_period_end * 1000),
            plan: subRaw.status === "active" ? "pro" : "free",
          },
        });
        break;
      }

      // ─── Subscription cancelled ──────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: "free",
            stripeSubscriptionId: null,
            subscriptionStatus: "canceled",
            currentPeriodEnd: null,
          },
        });

        await resend.emails.send({
          from: "FreelanceHub <onboarding@resend.dev>",
          to: [user.email],
          subject: "Your FreelanceHub Pro subscription has ended",
          react: React.createElement(SubscriptionCancelledEmail, {
            userName: user.name.split(" ")[0],
          }),
        });
        break;
      }

      // ─── Monthly payment succeeded ───────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // Skip the very first invoice (handled by checkout.session.completed)
        if (invoice.billing_reason === "subscription_create") break;

        const customer = await stripe.customers.retrieve(
          invoice.customer as string,
        );
        if (customer.deleted) break;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        });
        if (!user) break;

        await resend.emails.send({
          from: "FreelanceHub <onboarding@resend.dev>",
          to: [user.email],
          subject: "Payment received – FreelanceHub Pro",
          react: React.createElement(PaymentReceiptEmail, {
            userName: user.name.split(" ")[0],
            amount: `$${((invoice.amount_paid ?? 0) / 100).toFixed(2)}`,
            date: new Date(
              (invoice.created ?? Date.now()) * 1000,
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            invoiceUrl: invoice.hosted_invoice_url ?? undefined,
          }),
        });
        break;
      }

      // ─── Payment failed ──────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        });
        if (!user) break;

        const portalLink = `${process.env.BETTER_AUTH_URL}/api/stripe/create-portal-session`;

        await resend.emails.send({
          from: "FreelanceHub <onboarding@resend.dev>",
          to: [user.email],
          subject: "Payment failed – action required",
          react: React.createElement(PaymentFailedEmail, {
            userName: user.name.split(" ")[0],
            updatePaymentUrl: portalLink,
          }),
        });
        break;
      }

      default:
        console.log(`[STRIPE_WEBHOOK] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error("[STRIPE_WEBHOOK] Handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
