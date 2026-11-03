import { NextResponse, type NextRequest } from "next/server";
import {
  dashboardForRole,
  decodeSessionCookie,
  rolePrefixes,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";

export async function middleware(request: NextRequest) {
  const session = await decodeSessionCookie(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const path = request.nextUrl.pathname;

  for (const [role, prefix] of Object.entries(rolePrefixes)) {
    if (!path.startsWith(prefix)) continue;
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== role) {
      return NextResponse.redirect(
        new URL(dashboardForRole(session.role), request.url),
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*", "/volunteer/:path*"],
};
