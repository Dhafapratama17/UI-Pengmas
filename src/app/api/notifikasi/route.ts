import { NextResponse } from "next/server";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";
import { markReadSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const session = await getSessionFromServer();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sesi tidak ditemukan. Masuk kembali." },
      { status: 401 }
    );
  }
  const notifications = await listNotificationsForUser(session.userId);
  const unread = notifications.filter((n) => !n.readAt).length;

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit"));
  const items =
    Number.isFinite(limit) && limit > 0
      ? notifications.slice(0, limit)
      : notifications;

  return NextResponse.json({ ok: true, items, unread, total: notifications.length });
}

export async function PATCH(request: Request) {
  const session = await getSessionFromServer();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sesi tidak ditemukan. Masuk kembali." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = markReadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const unread = parsed.data.all
    ? await markAllNotificationsRead(session.userId)
    : await markNotificationRead(parsed.data.id!, session.userId);
  return NextResponse.json({ ok: true, unread });
}
