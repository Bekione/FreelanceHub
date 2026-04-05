"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getLocaleDir } from "@/lib/i18n/config";

/**
 * Sets lang and dir attributes on <html> from the client.
 * Used because the root layout owns <html> but [lang] layout knows the locale.
 */
export function HtmlDir({ lang }: { lang: Locale }) {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", getLocaleDir(lang));
  }, [lang]);

  return null;
}
