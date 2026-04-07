import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { APIError } from "better-auth/api";
import { ResetPasswordEmail } from "@/components/emails/reset-password-email";
import VerifyEmailOTPEmail from "@/components/emails/verify-email-otp-email";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      role: {
        type: "string",
        required: false,
      },
      companySize: {
        type: "string",
        required: false,
      },
      themePreference: {
        type: "string",
        required: false,
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
      },
      subscriptionStatus: {
        type: "string",
        required: false,
      },
      lastEmailSentAt: {
        type: "date",
        required: false,
      },
    },
  },

  rateLimit: {
    storage: "database",
    window: 60,
    max: 50,
    customRules: {
      "/email-otp/send-verification-otp": {
        window: 60,
        max: 2,
      },
      "/email-otp/verify-email": {
        window: 60,
        max: 2,
      },
      "/email-otp/request-password-reset": {
        window: 60,
        max: 2,
      },
      "/email-otp/reset-password": {
        window: 60,
        max: 2,
      },
      "/reset-password": {
        window: 60,
        max: 2,
      },
    },
  },

  // Email + password sign-up / sign-in
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // sign in immediately after registration
    sendResetPassword: async ({ user, url }, request) => {
      // User-level cooldown check
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (dbUser?.lastEmailSentAt) {
        const diff = Date.now() - dbUser.lastEmailSentAt.getTime();
        if (diff < 60000) {
          throw new APIError("TOO_MANY_REQUESTS", {
            message: "Too many requests",
          });
        }
      }

      await prisma.user.update({
        where: { email: user.email },
        data: { lastEmailSentAt: new Date() },
      });

      // 🚨 Log to terminal so developers can test without verified emails on Resend Free Tier
      console.log("\n🔑 [TESTING] PASSWORD RESET LINK GENERATED:");
      console.log(url, "\n");

      const { error } = await resend.emails.send({
        from: "FreelanceHub <onboarding@resend.dev>",
        to: [user.email],
        subject: "Reset your FreelanceHub password",
        react: ResetPasswordEmail({
          userFirstname: user.name.split(" ")[0],
          resetPasswordLink: url,
        }),
      });
      if (error) {
        console.error("Failed to send reset password email:", error);
      }
    },
  },

  // Google OAuth
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    emailOTP({
      // Send 6-digit OTP when a new email/password user signs up
      sendVerificationOnSignUp: true,
      // Route all default email verification through OTP (not link)
      overrideDefaultEmailVerification: true,
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      resendStrategy: "reuse",

      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          // User-level cooldown check
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser?.lastEmailSentAt) {
            const diff = Date.now() - dbUser.lastEmailSentAt.getTime();
            if (diff < 60000) {
              throw new APIError("TOO_MANY_REQUESTS", {
                message: "Too many requests",
              });
            }
          }

          await prisma.user.update({
            where: { email },
            data: { lastEmailSentAt: new Date() },
          });

          // Console log so devs can test without an email hitting a real inbox
          console.log(
            `\n📬 [OTP] Email verification OTP for ${email}: ${otp}\n`,
          );

          const { error } = await resend.emails.send({
            from: "FreelanceHub <onboarding@resend.dev>",
            to: [email],
            subject: "Your FreelanceHub verification code",
            react: React.createElement(VerifyEmailOTPEmail, { otp }),
          });
          if (error) console.error("Failed to send verification OTP:", error);
        }
        // sign-in and forget-password OTPs are not used in this product
      },
    }),
  ],

  // Create a Profile record whenever a new user signs up
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.profile.create({
            data: { userId: user.id },
          });
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
