"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Users,
  User,
  Clock,
  X,
  Zap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { useSession } from "@/lib/auth-client";
import { useTranslation } from "@/lib/i18n/translation-context";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  version?: string;
}

export function Sidebar({ open, setOpen, version }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslation();
  const isPro = (session?.user as { plan?: string })?.plan === "pro";
  const versionLabel = version ? `v${version}` : "FreelanceHub";

  // Extract current locale from pathname (e.g. "/en/dashboard" → "en")
  const localeMatch = pathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)/);
  const currentLocale = localeMatch ? localeMatch[1] : "en";

  // Strip the locale prefix for active-link comparison
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";

  const navigation = [
    { nameKey: "nav.dashboard",    href: "/dashboard",    icon: LayoutDashboard },
    { nameKey: "nav.projects",     href: "/projects",     icon: FolderOpen },
    { nameKey: "nav.invoices",     href: "/invoices",     icon: FileText },
    { nameKey: "nav.clients",      href: "/clients",      icon: Users },
    { nameKey: "nav.timeTracking", href: "/time-tracking",icon: Clock },
    { nameKey: "nav.profile",      href: "/profile",      icon: User },
    { nameKey: "nav.settings",     href: "/settings",     icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-64 flex flex-col",
          "bg-sidebar border-e border-sidebar-border",
          "lg:static lg:translate-x-0 lg:z-0",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border shrink-0">
          <AppLogo />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathWithoutLocale === item.href ||
              pathWithoutLocale.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={`/${currentLocale}${item.href}`}
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.innerWidth < 1024
                  ) {
                    setOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{t(item.nameKey)}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="ms-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground/60"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-3 border-t border-sidebar-border shrink-0 space-y-3">
          {isPro ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-sidebar-foreground/40">
                FreelanceHub {versionLabel}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <Zap className="h-3 w-3" />
                Pro
              </span>
            </div>
          ) : (
            <>
              <p className="text-xs text-sidebar-foreground/40 text-center">
                FreelanceHub v1.0
              </p>
              <Link
                href={`/${currentLocale}/checkout`}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                {t("settings.upgradeButton")}
              </Link>
            </>
          )}
        </div>
      </motion.aside>
    </>
  );
}
