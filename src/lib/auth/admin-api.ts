import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSessionCookie } from "@/lib/auth/session-cookie";
import type { AuthSession } from "@/types/auth";

export async function requireAdminApi(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const session = await decodeSessionCookie(
    cookieStore.get(SESSION_COOKIE)?.value,
  );
  if (!session || session.role !== "admin") return null;
  return session;
}
