import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  en:      () => import("@/dictionaries/en.json").then((m) => m.default),
  es:      () => import("@/dictionaries/es.json").then((m) => m.default),
  fr:      () => import("@/dictionaries/fr.json").then((m) => m.default),
  de:      () => import("@/dictionaries/de.json").then((m) => m.default),
  "zh-CN": () => import("@/dictionaries/zh-CN.json").then((m) => m.default),
  ar:      () => import("@/dictionaries/ar.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<unknown>>;

export type Dictionary = Awaited<ReturnType<typeof dictionaries["en"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]() as Promise<Dictionary>;
}
