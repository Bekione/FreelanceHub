import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales, defaultLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import type { LayoutProps } from "next/types";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://freelancehub.app";

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;

  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${APP_URL}/${locale}`;
  }
  languages["x-default"] = `${APP_URL}/${defaultLocale}`;

  return {
    title: "FreelanceHub | Run Your Freelance Business Like a Pro",
    description:
      "Manage clients, track projects, send invoices, and monitor your earnings — all from one powerful dashboard.",
    alternates: { languages },
  };
}

export default async function MarketingLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar lang={lang} dict={dict.nav} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} dict={dict.footer} />
    </div>
  );
}
