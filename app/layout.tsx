import type { Metadata } from "next";
import { Raleway, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "FreelanceHub",
    template: "%s | FreelanceHub",
  },
  description:
    "Your personal freelance work management hub — track projects, clients, and invoices in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        raleway.variable,
        spaceGrotesk.variable,
      )}
    >
      <body
        className="min-h-full bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        {/*
          ThemeProvider lives here — at the true root — so it never re-mounts
          during client-side locale navigation. This prevents the "script tag
          in React component" warning from next-themes.
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
