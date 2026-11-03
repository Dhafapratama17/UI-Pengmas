import type { AuthSession } from "@/types/auth";
import { signSession, verifySession } from "@/lib/auth/session-signing";

export const SESSION_COOKIE = "retemali_session";

export async function encodeSessionCookie(
  session: AuthSession,
): Promise<string> {
  return signSession(session);
}

export async function decodeSessionCookie(
  raw: string | undefined,
): Promise<AuthSession | null> {
  return verifySession(raw);
}

export function dashboardForRole(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "volunteer") return "/volunteer";
  if (role === "member") return "/member";
  return "/beranda";
}

export const rolePrefixes = {
  member: "/member",
  volunteer: "/volunteer",
  admin: "/admin",
} as const;
