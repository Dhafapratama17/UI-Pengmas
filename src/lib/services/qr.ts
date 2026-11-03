import { randomBytes } from "node:crypto";
import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import { notifyUser } from "@/lib/services/notifications";
import type {
  Activity,
  ActivityQrToken,
  AttendanceRecord,
} from "@/types/db";
import { formatTimeJakarta } from "@/lib/util/format";

const OPEN_BEFORE_MS = 30 * 60 * 1000;
const CLOSE_AFTER_MS = 60 * 60 * 1000;

export type AttendanceWindowState = "not_started" | "open" | "closed";

export interface AttendanceWindow {
  state: AttendanceWindowState;
  opensAt: string;
  closesAt: string;
}

export type CheckInResult =
  | "success"
  | "already_checked_in"
  | "not_registered"
  | "invalid_token"
  | "activity_unavailable"
  | "window_closed";

export interface ActivityAttendanceRow {
  personId: string;
  personRole: "member" | "volunteer";
  label: string;
  detail: string;
  eligible: boolean;
  paymentStatus: string | null;
  attendedAt: string | null;
}

export interface ActivityAttendanceOverview {
  eligibleCount: number;
  attendedCount: number;
  rows: ActivityAttendanceRow[];
}

export function describeAttendanceWindow(
  activity: Activity,
  now: Date = new Date()
): AttendanceWindow {
  const opensAt = new Date(
    new Date(activity.startsAt).getTime() - OPEN_BEFORE_MS
  ).toISOString();
  const closesAt = new Date(
    new Date(activity.endsAt).getTime() + CLOSE_AFTER_MS
  ).toISOString();
  const t = now.getTime();
  const state: AttendanceWindowState =
    t < new Date(opensAt).getTime()
      ? "not_started"
      : t > new Date(closesAt).getTime()
        ? "closed"
        : "open";
  return { state, opensAt, closesAt };
}

export function getActiveTokenForActivity(
  activityId: string
): ActivityQrToken | null {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk absensi belum tersedia.");
  }
  return (
    store.qrTokens.find(
      (t) => t.activityId === activityId && t.active
    ) ?? null
  );
}

function generateToken(): string {
  return `rt-${randomBytes(24).toString("base64url")}`;
}

export async function createOrRefreshToken(
  activityId: string,
  adminId: string
): Promise<ActivityQrToken> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk absensi belum tersedia.");
  }
  const admin = store.profiles.find((p) => p.id === adminId);
  if (!admin || admin.role !== "admin") {
    throw new Error("Akses admin diperlukan.");
  }
  const activity = store.activities.find((a) => a.id === activityId);
  if (!activity || activity.status !== "published") {
    throw new Error("QR absensi hanya untuk kegiatan terpublikasi.");
  }

  const now = new Date().toISOString();
  const expiresAt = new Date(
    new Date(activity.endsAt).getTime() + CLOSE_AFTER_MS,
  ).toISOString();
  for (const token of store.qrTokens) {
    if (token.activityId === activityId && token.active) {
      token.active = false;
      token.updatedAt = now;
    }
  }
  const token: ActivityQrToken = {
    id: `qrt-${store.qrTokens.length + 1}`,
    activityId,
    token: generateToken(),
    active: true,
    expiresAt,
    createdBy: adminId,
    createdAt: now,
    updatedAt: now,
  };
  store.qrTokens.push(token);
  return { ...token };
}

export async function setTokenActive(
  activityId: string,
  active: boolean,
  adminId: string
): Promise<ActivityQrToken | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk absensi belum tersedia.");
  }
  const admin = store.profiles.find((p) => p.id === adminId);
  if (!admin || admin.role !== "admin") {
    throw new Error("Akses admin diperlukan.");
  }
  const tokens = store.qrTokens
    .filter((t) => t.activityId === activityId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const latest = tokens[0];
  if (!latest) return null;
  if (latest.active !== active) {
    latest.active = active;
    latest.updatedAt = new Date().toISOString();
  }
  return { ...latest };
}

export interface ResolvedQrToken {
  tokenRow: ActivityQrToken;
  activity: Activity;
}

export function resolveActiveToken(token: string): ResolvedQrToken | null {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk absensi belum tersedia.");
  }
  const tokenRow = store.qrTokens.find(
    (t) => t.token === token && t.active,
  );
  if (!tokenRow) return null;
  if (
    tokenRow.expiresAt &&
    new Date(tokenRow.expiresAt).getTime() <= Date.now()
  ) {
    return null;
  }
  const activity = store.activities.find(
    (a) => a.id === tokenRow.activityId && a.status === "published",
  );
  if (!activity) return null;
  return { tokenRow, activity };
}

function isPersonRegistered(personId: string, activityId: string): boolean {
  return store.registrations.some(
    (r) =>
      r.activityId === activityId &&
      r.memberId === personId &&
      r.status === "registered"
  );
}

function isVolunteerAssigned(personId: string, activityId: string): boolean {
  return store.assignments.some(
    (a) => a.activityId === activityId && a.volunteerId === personId
  );
}

export async function checkInByToken(
  token: string,
  person: { id: string; role: "member" | "volunteer" }
): Promise<
  | {
      status: "success";
      record: AttendanceRecord;
      activity: Activity;
    }
  | {
      status: Exclude<CheckInResult, "success">;
      activity: Activity | null;
    }
> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk absensi belum tersedia.");
  }
  const resolved = resolveActiveToken(token.trim());
  if (!resolved) {
    return { status: "invalid_token", activity: null };
  }
  const { activity } = resolved;

  const eligible =
    person.role === "member"
      ? isPersonRegistered(person.id, activity.id)
      : isVolunteerAssigned(person.id, activity.id);
  if (!eligible) {
    return { status: "not_registered", activity };
  }

  const existing = store.attendance.find(
    (a) => a.activityId === activity.id && a.personId === person.id
  );
  if (existing) {
    return { status: "already_checked_in", activity };
  }

  const window = describeAttendanceWindow(activity);
  if (window.state !== "open") {
    return { status: "window_closed", activity };
  }

  let nextId = 1;
  for (const record of store.attendance) {
    const match = /^atd-(\d+)$/.exec(record.id);
    if (match) nextId = Math.max(nextId, Number(match[1]) + 1);
  }
  const record: AttendanceRecord = {
    id: `atd-${nextId}`,
    activityId: activity.id,
    personId: person.id,
    personRole: person.role,
    scannedAt: new Date().toISOString(),
  };
  store.attendance.push(record);
  notifyUser(person.id, {
    category: "absensi",
    title: "Kehadiran tercatat",
    body: `Kehadiran Anda pada "${activity.title}" tercatat pukul ${formatTimeJakarta(record.scannedAt)} WIB.`,
    href: person.role === "member" ? "/member/kegiatan" : "/volunteer/kehadiran",
  });
  return { status: "success", record, activity };
}

export async function listActivityAttendance(
  activityId: string
): Promise<ActivityAttendanceOverview> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk absensi belum tersedia.");
  }
  const paymentsByRegistration = new Map<string, string>();
  for (const payment of store.payments) {
    if (payment.activityRegistrationId) {
      paymentsByRegistration.set(payment.activityRegistrationId, payment.status);
    }
  }

  const rows: ActivityAttendanceRow[] = [];

  for (const registration of store.registrations) {
    if (registration.activityId !== activityId) continue;
    if (registration.status !== "registered") continue;
    const profile =
      registration.memberId
        ? store.profiles.find((p) => p.id === registration.memberId)
        : undefined;
    rows.push({
      personId: profile?.id ?? registration.reference,
      personRole: "member",
      label:
        profile?.fullName ?? registration.guestName ?? registration.reference,
      detail: registration.memberId
        ? registration.memberId
        : (registration.guestEmail ?? "-"),
      eligible: Boolean(profile),
      paymentStatus: registration.memberId
        ? paymentsByRegistration.get(registration.id) ?? null
        : "unpaid_guest",
      attendedAt:
        (profile &&
          store.attendance.find(
            (a) => a.activityId === activityId && a.personId === profile.id
          )?.scannedAt) ??
        null,
    });
  }

  for (const assignment of store.assignments) {
    if (assignment.activityId !== activityId) continue;
    const profile = store.profiles.find((p) => p.id === assignment.volunteerId);
    rows.push({
      personId: assignment.volunteerId,
      personRole: "volunteer",
      label: profile?.fullName ?? assignment.volunteerId,
      detail: profile?.email ?? assignment.volunteerId,
      eligible: true,
      paymentStatus: null,
      attendedAt:
        store.attendance.find(
          (a) =>
            a.activityId === activityId &&
            a.personId === assignment.volunteerId
        )?.scannedAt ?? null,
    });
  }

  return {
    eligibleCount: rows.filter((r) => r.eligible).length,
    attendedCount: rows.filter((r) => r.attendedAt).length,
    rows,
  };
}

export async function listActivitiesWithAttendance():
  Promise<Activity[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk absensi belum tersedia.");
  }
  const activityIds = new Set<string>();
  for (const registration of store.registrations) {
    if (registration.status === "registered") {
      activityIds.add(registration.activityId);
    }
  }
  for (const assignment of store.assignments) {
    activityIds.add(assignment.activityId);
  }
  return store.activities
    .filter((a) => activityIds.has(a.id))
    .slice()
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}
