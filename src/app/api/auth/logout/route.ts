import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";

export async function POST() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV === "production";
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: isProduction,
  });
  return response;
}
