import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { ResetPasswordEmail } from "@/components/emails/reset-password-email";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Email + password sign-up / sign-in
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // sign in immediately after registration
    sendResetPassword: async ({ user, url }, request) => {
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
