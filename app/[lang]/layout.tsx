import { notFound } from "next/navigation";
import { locales, hasLocale, getLocaleDir } from "@/lib/i18n/config";
import { Providers } from "@/app/providers";
import { HtmlDir } from "@/components/i18n/html-dir";
import type { LayoutProps } from "next/types";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dir = getLocaleDir(lang);

  return (
    <Providers dir={dir}>
      <HtmlDir lang={lang} />
      {children}
    </Providers>
  );
}
