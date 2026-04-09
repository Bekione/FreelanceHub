"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe, Check, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { locales, LOCALE_DISPLAY_NAMES } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

interface MarketingLanguageSwitcherProps {
  currentLocale: Locale;
  dropUp?: boolean;
  origin?: "left" | "right";
  className?: string;
}

/**
 * Language switcher styled for the marketing site (dark glass UI).
 * Distinct from the dashboard LanguageSwitcher which uses muted/accent colors.
 */
export function MarketingLanguageSwitcher({
  currentLocale,
  dropUp = false,
  origin = 'left',
  className,
}: MarketingLanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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
    document.cookie = `NEXT_LOCALE=${locale}; Max-Age=31536000; Path=/; SameSite=Lax`;
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-foreground/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{LOCALE_DISPLAY_NAMES[currentLocale]}</span>
        <ChevronUp
          className={cn(
            "h-3 w-3 transition-transform",
            open ? "rotate-0" : "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          className={cn(
            "absolute z-50 min-w-[180px] bg-white/5 backdrop-blur-sm border border-foreground/10 shadow-xl py-1 rounded-xl overflow-hidden",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
            origin === 'left' ? "inset-s-0" : "inset-e-0"
          )}
        >
          {locales.map((locale) => {
            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => switchLocale(locale)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "text-foreground bg-white/10 font-medium"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5",
                )}
              >
                <span>{LOCALE_DISPLAY_NAMES[locale]}</span>
                {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
