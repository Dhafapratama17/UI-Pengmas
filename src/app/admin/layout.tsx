import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  dashboardForRole,
  decodeSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";

export const metadata = { title: "Dashboard Admin" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = await decodeSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect(dashboardForRole(session.role));

  return <AppShell variant="admin">{children}</AppShell>;
}
