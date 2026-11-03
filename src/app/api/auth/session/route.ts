import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeSessionCookie, SESSION_COOKIE } from "@/lib/auth/session-cookie";

export async function GET() {
  const cookieStore = await cookies();
  const session = await decodeSessionCookie(
    cookieStore.get(SESSION_COOKIE)?.value,
  );
  return NextResponse.json({ session });
}
