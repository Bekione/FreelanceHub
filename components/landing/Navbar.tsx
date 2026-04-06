"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppLogo } from "@/components/app-logo";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { MarketingLanguageSwitcher } from "@/components/i18n/marketing-language-switcher";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

interface NavbarProps {
  lang: Locale;
  dict: Dictionary["nav"];
}

export default function Navbar({ lang, dict }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { label: dict.features, anchor: "features" },
    { label: dict.pricing, anchor: "pricing" },
    { label: dict.dashboardPreview, anchor: "dashboard-preview" },
    { label: dict.testimonials, anchor: "testimonials" },
    { label: dict.contact, anchor: "contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-20 bg-transparent backdrop-blur-sm border-b border-foreground/6"
    >
      <div className="flex items-center justify-between px-6 xl:px-[120px] py-4">
        <AppLogo />
        <div className="hidden xl:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.anchor}
              href={`/#${link.anchor}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="hidden xl:flex items-center gap-3">
          <MarketingLanguageSwitcher currentLocale={lang} />
          <Link
            href={`/${lang}/register`}
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all whitespace-nowrap"
          >
            {dict.getStarted}
          </Link>
        </div>
        <button
          className="xl:hidden text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="xl:hidden bg-card/90 backdrop-blur-xl border-t border-foreground/8 p-4 space-y-3">
          {links.map((link) => (
            <a
              key={link.anchor}
              href={`/#${link.anchor}`}
              className="block text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-foreground/8">
            <MarketingLanguageSwitcher currentLocale={lang} />
            <Link
              href={`/${lang}/register`}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm text-center"
            >
              {dict.getStarted}
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
