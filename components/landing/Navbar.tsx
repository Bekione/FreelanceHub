"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppLogo } from "@/components/app-logo";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const links = [
  "Features",
  "Pricing",
  "Dashboard Preview",
  "Testimonials",
  "Contact",
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
          {links.map((link) => {
            const href = `/#${link.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <a
                key={link}
                href={href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {link}
              </a>
            );
          })}
        </div>
        <div className="hidden xl:block">
          <Link
            href="/register"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all whitespace-nowrap"
          >
            Get Started for Free
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
          {links.map((link) => {
            const href = `/#${link.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <a
                key={link}
                href={href}
                className="block text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link}
              </a>
            );
          })}
          <Link
            href="/register"
            className="block px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm text-center"
          >
            Get Started for Free
          </Link>
        </div>
      )}
    </motion.nav>
  );
}
