import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Redirect EMPLOYEEs away from /admin routes
    if (pathname.startsWith("/admin") && token?.role !== "ORG_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect ORG_ADMINs away from employee routes
    if (
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/check-in") ||
        pathname.startsWith("/chat") ||
        pathname.startsWith("/resources")) &&
      token?.role === "ORG_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/check-in/:path*",
    "/chat/:path*",
    "/resources/:path*",
    "/admin/:path*",
  ],
};
