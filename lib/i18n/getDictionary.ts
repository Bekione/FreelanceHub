import "server-only";
import type { Locale } from "./config";
import type enDict from "@/dictionaries/en.json";

// Dictionary shape is derived from the English source-of-truth file.
// All other locale files must mirror this structure exactly.
export type Dictionary = typeof enDict;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en:      () => import("@/dictionaries/en.json").then((m) => m.default),
  es:      () => import("@/dictionaries/es.json").then((m) => m.default as Dictionary),
  fr:      () => import("@/dictionaries/fr.json").then((m) => m.default as Dictionary),
  de:      () => import("@/dictionaries/de.json").then((m) => m.default as Dictionary),
  "zh-CN": () => import("@/dictionaries/zh-CN.json").then((m) => m.default as Dictionary),
  ar:      () => import("@/dictionaries/ar.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
