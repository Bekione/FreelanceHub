export const locales = ["en", "es", "fr", "de", "zh-CN", "ar"] as const;
export const freeLocales = ["en", "es", "fr", "de"] as const;
export const proLocales = ["en", "es", "fr", "de", "zh-CN", "ar"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];
export type FreeLocale = (typeof freeLocales)[number];

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale);

export function getLocaleDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  "zh-CN": "简体中文",
  ar: "العربية",
};
