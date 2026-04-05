"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { locales, LOCALE_DISPLAY_NAMES } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  /** When provided, these locales render as disabled with a Pro badge */
  gatedLocales?: Locale[];
  /** Called when a user clicks a gated locale — parent shows UpgradeModal */
  onGatedSelect?: (locale: Locale) => void;
  /** Open dropdown upward instead of downward (use in footer) */
  dropUp?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  currentLocale,
  gatedLocales = [],
  onGatedSelect,
  dropUp = false,
  className,
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(locale: Locale) {
    setOpen(false);

    if (gatedLocales.includes(locale)) {
      onGatedSelect?.(locale);
      return;
    }

    // Persist preference in cookie (1 year)
    document.cookie = `NEXT_LOCALE=${locale}; Max-Age=31536000; Path=/; SameSite=Lax`;

    // Replace the locale segment in the current path and use router.push
    // for instant client-side navigation — no full page reload
    const segments = pathname.split("/");
    segments[1] = locale;
    const newPath = segments.join("/");
    router.push(newPath);
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {LOCALE_DISPLAY_NAMES[currentLocale]}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          className={cn(
            "absolute end-0 z-50 min-w-[160px] bg-popover border border-border shadow-md py-1",
            dropUp ? "bottom-full mb-1" : "top-full mt-1",
          )}
        >
          {locales.map((locale) => {
            const isActive = locale === currentLocale;
            const isGated = gatedLocales.includes(locale);

            return (
              <button
                key={locale}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => switchLocale(locale)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  isGated && "opacity-60",
                )}
              >
                <span>{LOCALE_DISPLAY_NAMES[locale]}</span>
                <span className="flex items-center gap-1.5 ms-3">
                  {isGated && (
                    <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-semibold flex items-center gap-0.5">
                      <Zap className="h-2.5 w-2.5" /> Pro
                    </span>
                  )}
                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
