"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./getDictionary";
import { createT } from "./t";

type TFunction = ReturnType<typeof createT>;

const TranslationContext = createContext<TFunction | null>(null);

export function TranslationProvider({
  dict,
  children,
}: {
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const t = createT(dict);
  return (
    <TranslationContext.Provider value={t}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Access translations in any client component inside the dashboard.
 * Usage: const t = useTranslation(); t("dashboard.title")
 */
export function useTranslation(): TFunction {
  const t = useContext(TranslationContext);
  if (!t) {
    // Fallback: return key as-is if used outside provider (shouldn't happen)
    return (key: string) => key;
  }
  return t;
}
