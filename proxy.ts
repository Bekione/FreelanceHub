import { NextRequest, NextResponse } from "next/server";

// In production (HTTPS), Better-Auth prefixes the cookie with "__Secure-"
const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  // Protect all dashboard routes
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/time-tracking") ||
    pathname.startsWith("/profile");

  if (isDashboard && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect already-authenticated users away from auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API auth routes
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)",
  ],
};
