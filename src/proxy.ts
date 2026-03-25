import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Proxy (formerly Middleware) for route protection and RBAC.
 * Reads auth cookies set by AuthService (proxy cannot access localStorage).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("medlink_token")?.value;
  const role = request.cookies.get("medlink_role")?.value;

  // --- Auth Check ---
  if (!token) {
    // Not logged in → redirect to login
    // Use nextUrl.clone() to avoid host-mismatch infinite loops
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // --- RBAC Check (for authenticated users) ---
  if (role && role.toLowerCase() === "receptionist") {
    // Block Receptionist from admin-only routes
    const adminOnlyPaths = ["/users", "/payments"];
    const isAdminOnly = adminOnlyPaths.some((p) => pathname.startsWith(p));

    if (isAdminOnly) {
      // Redirect to dashboard with no access
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run on app routes — explicitly exclude login, static files, images, api, and favicon
  matcher: [
    "/((?!login|_next/static|_next/image|api|favicon.ico).*)",
  ],
};
