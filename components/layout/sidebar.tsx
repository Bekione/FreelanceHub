"use client";

import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Time Tracking", href: "/time-tracking", icon: Clock },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

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
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
          "bg-sidebar border-r border-sidebar-border",
          "lg:static lg:translate-x-0 lg:z-0",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 text-sidebar-primary  flex items-center justify-center">
              <svg
                version="1.1"
                viewBox="0 0 1984 2012"
                width="496"
                height="503"
                className="w-10 h-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  transform="translate(791,429)"
                  d="m0 0h584l16 2 18 6 14 7 13 9 15 13 11 14 8 14 6 14 5 21 2 22v567l-2 22-4 17-7 19-8 15-9 11-9 10-6 7-6 5-277 277-8 7-11 9-10 7-17 9-19 6-16 2h-544l-15-2-17-6-16-8-13-9-12-11-10-11-10-16-7-16-4-14-2-14-1-36v-453l1-17 4-20 6-16 12-21 29-43 16-25 30-45 9-14 11-17 22-33 26-40 10-15 21-32 10-15 15-23 21-32 15-23 20-30 8-10 14-15 8-7 15-10 11-5 17-6zm128 133-1 136v192l1 85h208l1-130h127v-86h-128l1-21h127v-176z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="font-semibold text-lg italic font-heading text-sidebar-foreground">
              FreelanceHub
            </span>
          </div>
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
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.innerWidth < 1024
                  ) {
                    setOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground/60"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom hint */}
        <div className="px-4 py-3 border-t border-sidebar-border shrink-0">
          <p className="text-xs text-sidebar-foreground/40 text-center">
            FreelanceHub v1.0
          </p>
        </div>
      </motion.aside>
    </>
  );
}
