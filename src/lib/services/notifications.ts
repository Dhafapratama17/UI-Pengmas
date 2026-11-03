import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import type {
  AppNotification,
  NotificationCategory,
  Activity,
} from "@/types/db";
import { formatActivityWindow } from "@/lib/util/format";

const REMINDER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export interface NotificationPayload {
  category: NotificationCategory;
  title: string;
  body: string;
  href?: string | null;
}

export type BroadcastTarget = "member" | "volunteer" | "all";

function nextNotificationId(): string {
  let max = 0;
  for (const item of store.notifications) {
    const match = /^ntf-(\d+)$/.exec(item.id);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `ntf-${max + 1}`;
}

export function notifyUser(
  userId: string,
  payload: NotificationPayload
): AppNotification | null {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk notifikasi belum tersedia.");
  }
  if (!store.profiles.some((p) => p.id === userId)) return null;
  const notification: AppNotification = {
    id: nextNotificationId(),
    userId,
    category: payload.category,
    title: payload.title,
    body: payload.body,
    href: payload.href ?? null,
    readAt: null,
    createdAt: new Date().toISOString(),
  };
  store.notifications.push(notification);
  return { ...notification };
}

export function notifyUsers(
  userIds: string[],
  payload: NotificationPayload
): void {
  for (const userId of userIds) {
    notifyUser(userId, payload);
  }
}

export function notifyAdmins(payload: NotificationPayload): void {
  const admins = store.profiles.filter((p) => p.role === "admin");
  notifyUsers(
    admins.map((a) => a.id),
    payload
  );
}

export async function broadcastNotifications(
  target: BroadcastTarget,
  payload: NotificationPayload,
  senderId: string
): Promise<number> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk notifikasi belum tersedia.");
  }
  const sender = store.profiles.find((p) => p.id === senderId);
  if (!sender || sender.role !== "admin") {
    throw new Error("Akses admin diperlukan untuk mengirim pengumuman.");
  }
  const recipients = store.profiles.filter((p) =>
    target === "all"
      ? p.role === "member" || p.role === "volunteer"
      : p.role === target
  );
  notifyUsers(
    recipients.map((r) => r.id),
    payload
  );
  return recipients.length;
}

function publishReminder(
  userId: string,
  href: string,
  activity: Activity,
  responsibilitiesNote: string
): void {
  const exists = store.notifications.some(
    (n) => n.userId === userId && n.category === "pengingat" && n.href === href
  );
  if (exists) return;

  const title = `Ingatkan: ${activity.title}`;
  const tail = responsibilitiesNote
    ? ` Tugas Anda: ${responsibilitiesNote}.`
    : "";
  store.notifications.push({
    id: nextNotificationId(),
    userId,
    category: "pengingat",
    title,
    body: `Jadwal ${formatActivityWindow(activity.startsAt, activity.endsAt)} di ${activity.location}.${tail}`,
    href,
    readAt: null,
    createdAt: new Date().toISOString(),
  });
}

function materializeMemberReminders(memberId: string): void {
  const now = Date.now();
  const windowStart = now;
  const windowEnd = now + REMINDER_WINDOW_MS;

  for (const registration of store.registrations) {
    if (
      registration.memberId !== memberId ||
      registration.status !== "registered"
    ) {
      continue;
    }
    const activity = store.activities.find(
      (a) =>
        a.id === registration.activityId &&
        a.status === "published" &&
        new Date(a.startsAt).getTime() >= windowStart &&
        new Date(a.startsAt).getTime() <= windowEnd
    );
    if (!activity) continue;
    publishReminder(
      memberId,
      `/member/kegiatan?pengingat=${activity.id}`,
      activity,
      ""
    );
  }
}

function materializeVolunteerReminders(volunteerId: string): void {
  const now = Date.now();
  const windowEnd = now + REMINDER_WINDOW_MS;
  const approval =
    store.profiles.find((p) => p.id === volunteerId)?.volunteerApprovalStatus ??
    "pending";
  if (approval !== "approved") return;

  for (const assignment of store.assignments) {
    if (assignment.volunteerId !== volunteerId) continue;
    const activity = store.activities.find(
      (a) =>
        a.id === assignment.activityId &&
        a.status === "published" &&
        new Date(a.startsAt).getTime() >= now &&
        new Date(a.startsAt).getTime() <= windowEnd
    );
    if (!activity) continue;
    publishReminder(
      volunteerId,
      `/volunteer/qr-absensi?pengingat=${activity.id}`,
      activity,
      assignment.responsibilities
    );
  }
}

export async function listNotificationsForUser(
  userId: string
): Promise<AppNotification[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk notifikasi belum tersedia.");
  }
  const profile = store.profiles.find((p) => p.id === userId);
  if (profile?.role === "member") {
    materializeMemberReminders(profile.id);
  } else if (profile?.role === "volunteer") {
    materializeVolunteerReminders(profile.id);
  }
  return store.notifications
    .filter((n) => n.userId === userId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUnreadCount(userId: string): Promise<number> {
  await listNotificationsForUser(userId);
  return store.notifications.filter(
    (n) => n.userId === userId && !n.readAt
  ).length;
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<number> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk notifikasi belum tersedia.");
  }
  const notification = store.notifications.find(
    (n) => n.id === notificationId && n.userId === userId
  );
  if (notification && !notification.readAt) {
    notification.readAt = new Date().toISOString();
  }
  return store.notifications.filter((n) => n.userId === userId && !n.readAt)
    .length;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk notifikasi belum tersedia.");
  }
  const now = new Date().toISOString();
  for (const notification of store.notifications) {
    if (notification.userId === userId && !notification.readAt) {
      notification.readAt = now;
    }
  }
  return 0;
}
