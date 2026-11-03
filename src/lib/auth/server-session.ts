import { cookies } from "next/headers";
import type { AuthSession } from "@/types/auth";
import {
  decodeSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";

export async function getSessionFromServer(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  return decodeSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
}
