import { NextRequest, NextResponse } from "next/server";
import {
  locales,
  defaultLocale,
  hasLocale,
  freeLocales,
} from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

// In production (HTTPS), Better-Auth prefixes the cookie with "__Secure-"
const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";

const LOCALE_COOKIE = "NEXT_LOCALE";

/** Extract best-matching locale from Accept-Language header */
function detectLocaleFromHeader(request: NextRequest): Locale {
  const acceptLang = request.headers.get("accept-language") ?? "";
  const preferred = acceptLang
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase());

  for (const tag of preferred) {
    // Exact match (e.g. "zh-cn" → "zh-CN")
    const exact = locales.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    // Language-only match (e.g. "en-US" → "en")
    const base = tag.split("-")[0];
    const baseMatch = locales.find((l) => l.toLowerCase() === base);
    if (baseMatch) return baseMatch;
  }
  return defaultLocale;
}

/** Determine locale for a request that has no locale prefix */
function getLocale(request: NextRequest, isDashboardPath: boolean): Locale {
  // 1. Cookie takes priority
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieValue && hasLocale(cookieValue)) {
    // For dashboard paths, Pro locales are not allowed for free users.
    // Since we can't check subscription here, fall back to "en" for Pro locales
    // on dashboard paths — the dashboard layout will handle Pro users correctly.
    const isProLocale = !(freeLocales as readonly string[]).includes(
      cookieValue,
    );
    if (isDashboardPath && isProLocale) {
      return defaultLocale;
    }
    return cookieValue;
  }
  // 2. Accept-Language header
  const headerLocale = detectLocaleFromHeader(request);
  // Same Pro locale guard for dashboard paths
  const isProLocale = !(freeLocales as readonly string[]).includes(
    headerLocale,
  );
  if (isDashboardPath && isProLocale) return defaultLocale;
  return headerLocale;
}

/** Strip the locale prefix from a pathname, e.g. "/en/dashboard" → "/dashboard" */
function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`))
      return pathname.slice(locale.length + 1);
  }
  return pathname;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Mode Toggle (coming soon / maintenance) ────────────────────────────────
  // Skip for API routes, static files, and the mode pages themselves
  const isApiOrStatic =
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes("/coming-soon") ||
    pathname.includes("/maintenance");

  if (!isApiOrStatic) {
    const adminSecret = process.env.ADMIN_BYPASS_SECRET;
    const adminCookie = request.cookies.get("admin_bypass")?.value;
    const isAdmin = adminSecret && adminCookie === adminSecret;

    if (!isAdmin) {
      const maintenanceMode =
        process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
      const comingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON === "true";

      if (maintenanceMode) {
        return NextResponse.rewrite(
          new URL(`/${defaultLocale}/maintenance`, request.url),
        );
      }
      if (comingSoonMode) {
        return NextResponse.rewrite(
          new URL(`/${defaultLocale}/coming-soon`, request.url),
        );
      }
    }
  }

  // ── Check if pathname already has a supported locale prefix ───────────────
  const pathnameLocale = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (!pathnameLocale) {
    // No locale prefix — detect and redirect
    // Check if this is a dashboard path before locale detection
    const isDashboardPath =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/projects") ||
      pathname.startsWith("/clients") ||
      pathname.startsWith("/invoices") ||
      pathname.startsWith("/time-tracking") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/settings");

    const locale = getLocale(request, isDashboardPath);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // ── Locale prefix present — run auth checks ────────────────────────────────
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const pathWithoutLocale = stripLocale(pathname);

  const isDashboard =
    pathWithoutLocale.startsWith("/dashboard") ||
    pathWithoutLocale.startsWith("/projects") ||
    pathWithoutLocale.startsWith("/clients") ||
    pathWithoutLocale.startsWith("/invoices") ||
    pathWithoutLocale.startsWith("/time-tracking") ||
    pathWithoutLocale.startsWith("/profile") ||
    pathWithoutLocale.startsWith("/settings");

  if (isDashboard && !sessionToken) {
    const loginUrl = new URL(`/${pathnameLocale}/login`, request.url);
    loginUrl.searchParams.set("redirectUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthPage =
    pathWithoutLocale === "/login" || pathWithoutLocale === "/register";
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(
      new URL(`/${pathnameLocale}/dashboard`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and ALL API routes
    "/((?!_next/static|_next/image|favicon\\.ico|api/).*)",
  ],
};
