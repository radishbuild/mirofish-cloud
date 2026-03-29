import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const sessionCookie = req.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    const { pathname } = req.nextUrl;

    // API routes get a 401 response
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dashboard routes redirect to login
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/dashboard/:path*", "/api/((?!auth|cron|health).*)"],
};
