import type { Dictionary } from "./getDictionary";

/**
 * Creates a translation helper bound to a dictionary.
 * Usage: const t = createT(dict); t("common.save") // → "Save"
 *
 * Supports dot-notation keys up to 3 levels deep.
 * Falls back to the key itself if the translation is missing.
 */
export function createT(dict: Dictionary) {
  return function t(key: string, fallback?: string): string {
    const parts = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = dict;
    for (const part of parts) {
      if (value == null || typeof value !== "object") return fallback ?? key;
      value = value[part];
    }
    if (typeof value === "string") return value;
    return fallback ?? key;
  };
}
