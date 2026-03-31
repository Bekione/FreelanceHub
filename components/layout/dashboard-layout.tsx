"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { AppHeader } from "./header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    // Set initial value
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>

        <footer className="px-4 py-3 text-center text-xs text-muted-foreground border-t border-border shrink-0">
          Made by Bereket Kinfe
        </footer>
      </div>
    </div>
  );
}
