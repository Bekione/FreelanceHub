"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/invoices": "Invoices",
  "/clients": "Clients",
  "/time-tracking": "Time Tracking",
  "/profile": "Profile",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  // Prevent hydration mismatch — theme is undefined on the server
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pageTitle = pageTitles[pathname] ?? "FreelanceHub";

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // Immediately enforce redirect
        },
      },
    });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Render a placeholder button until mounted to avoid hydration mismatch
  const ThemeButton = () => {
    if (!mounted) {
      return (
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Monitor className="h-4 w-4" />
        </Button>
      );
    }

    const ThemeIcon =
      theme === "dark" ? Sun : theme === "light" ? Moon : Monitor;

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={cycleTheme}
        title={`Theme: ${theme}`}
        aria-label={`Switch theme, current: ${theme}`}
      >
        <ThemeIcon className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold font-heading">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeButton />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  {user?.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={user.name || "User Avatar"}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs font-medium bg-sidebar-primary text-sidebar-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="px-2 py-2 space-y-0.5">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-xs text-muted-foreground leading-none pt-1">
                  {user?.email || "..."}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                variant="destructive"
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
