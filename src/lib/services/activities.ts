import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import { listRegistrationsForActivity } from "@/lib/services/registrations";
import type {
  Activity,
  ActivityActivityWindowState,
  ActivityRegistrationSummary,
  ActivityStatus,
  ActivityTypeBadge,
} from "@/types/db";

function isUpcoming(activity: Activity, now: Date): boolean {
  return new Date(activity.startsAt).getTime() > now.getTime();
}

function activityIsFree(activity: Activity): boolean {
  return activity.feeAmount <= 0;
}

export async function listActivities(options: {
  upcomingOnly?: boolean;
  freeOnly?: boolean;
  paidOnly?: boolean;
  now?: Date;
}): Promise<Activity[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk kegiatan belum tersedia di Fase 1");
  }
  const now = options.now ?? new Date();
  let items = store.activities.filter((a) => a.status === "published");
  if (options.upcomingOnly) items = items.filter((a) => isUpcoming(a, now));
  if (options.freeOnly) items = items.filter(activityIsFree);
  if (options.paidOnly) items = items.filter((a) => !activityIsFree(a));
  return items
    .slice()
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function getActivity(id: string): Promise<Activity | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk kegiatan belum tersedia di Fase 1");
  }
  return store.activities.find((a) => a.id === id) ?? null;
}

export async function describeRegistrationSummary(
  activity: Activity,
  now: Date = new Date()
): Promise<ActivityRegistrationSummary> {
  const registeredCount = (await listRegistrationsForActivity(activity.id))
    .filter((r) => r.status === "registered").length;

  let window: ActivityActivityWindowState = "open";
  if (activity.status !== "published") {
    window = "closed";
  } else if (new Date(activity.registrationDeadline).getTime() <= now.getTime()) {
    window = "deadline_passed";
  } else if (registeredCount >= activity.capacity) {
    window = "full";
  }

  return {
    registeredCount,
    slotsLeft: Math.max(activity.capacity - registeredCount, 0),
    window,
    isFree: activityIsFree(activity),
  };
}

export type { ActivityTypeBadge, ActivityActivityWindowState };

export interface ActivityWriteInput {
  title: string;
  description: string;
  posterUrl?: string | null;
  startsAt: string;
  endsAt: string;
  location: string;
  organizer: string;
  feeAmount: number;
  capacity: number;
  registrationDeadline: string;
  status: ActivityStatus;
}

function nextActivityId(): string {
  const numbers = store.activities.flatMap((a) => {
    const match = /^act-(\d+)$/.exec(a.id);
    return match ? [Number(match[1])] : [];
  });
  const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
  return `act-${String(next).padStart(3, "0")}`;
}

function validDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function validateActivityDates(input: {
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
}) {
  if (
    !validDate(input.startsAt) ||
    !validDate(input.endsAt) ||
    !validDate(input.registrationDeadline)
  ) {
    throw new Error("Tanggal kegiatan tidak valid.");
  }
  if (new Date(input.endsAt) <= new Date(input.startsAt)) {
    throw new Error("Waktu selesai harus setelah waktu mulai.");
  }
  if (new Date(input.registrationDeadline) > new Date(input.startsAt)) {
    throw new Error("Batas pendaftaran tidak boleh setelah waktu mulai.");
  }
}

function applyActivityValues(activity: Activity, input: ActivityWriteInput) {
  activity.title = input.title;
  activity.description = input.description;
  activity.posterUrl = input.posterUrl || null;
  activity.startsAt = new Date(input.startsAt).toISOString();
  activity.endsAt = new Date(input.endsAt).toISOString();
  activity.location = input.location;
  activity.organizer = input.organizer;
  activity.feeAmount = input.feeAmount;
  activity.capacity = input.capacity;
  activity.registrationDeadline = new Date(
    input.registrationDeadline
  ).toISOString();
  activity.status = input.status;
}

export async function createActivity(
  input: ActivityWriteInput
): Promise<Activity> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk kegiatan belum tersedia di Fase 1");
  }
  validateActivityDates(input);
  if (input.feeAmount < 0) throw new Error("Biaya kegiatan tidak boleh negatif.");
  if (input.capacity < 1) throw new Error("Kapasitas kegiatan minimal 1 peserta.");
  const activity: Activity = {
    id: nextActivityId(),
    title: input.title,
    description: input.description,
    posterUrl: input.posterUrl || null,
    startsAt: new Date(input.startsAt).toISOString(),
    endsAt: new Date(input.endsAt).toISOString(),
    location: input.location,
    organizer: input.organizer,
    feeAmount: input.feeAmount,
    capacity: input.capacity,
    registrationDeadline: new Date(input.registrationDeadline).toISOString(),
    status: input.status,
    createdAt: new Date().toISOString(),
  };
  store.activities.push(activity);
  return { ...activity };
}

export async function updateActivity(
  id: string,
  patch: Partial<ActivityWriteInput>
): Promise<Activity> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk kegiatan belum tersedia di Fase 1");
  }
  const activity = store.activities.find((a) => a.id === id);
  if (!activity) throw new Error("Kegiatan tidak ditemukan.");
  const merged: ActivityWriteInput = {
    title: patch.title ?? activity.title,
    description: patch.description ?? activity.description,
    posterUrl: patch.posterUrl !== undefined ? patch.posterUrl : activity.posterUrl,
    startsAt: patch.startsAt ?? activity.startsAt,
    endsAt: patch.endsAt ?? activity.endsAt,
    location: patch.location ?? activity.location,
    organizer: patch.organizer ?? activity.organizer,
    feeAmount: patch.feeAmount ?? activity.feeAmount,
    capacity: patch.capacity ?? activity.capacity,
    registrationDeadline:
      patch.registrationDeadline ?? activity.registrationDeadline,
    status: patch.status ?? activity.status,
  };
  validateActivityDates(merged);
  if (merged.feeAmount < 0) {
    throw new Error("Biaya kegiatan tidak boleh negatif.");
  }
  const registered = (await listRegistrationsForActivity(id)).filter(
    (r) => r.status === "registered"
  ).length;
  if (merged.capacity < registered) {
    throw new Error(
      `Kapasitas tidak boleh lebih kecil dari jumlah peserta terdaftar (${registered}).`
    );
  }
  applyActivityValues(activity, merged);
  return { ...activity };
}

export async function setActivityStatus(
  id: string,
  status: ActivityStatus
): Promise<Activity> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk kegiatan belum tersedia di Fase 1");
  }
  const activity = store.activities.find((a) => a.id === id);
  if (!activity) throw new Error("Kegiatan tidak ditemukan.");
  activity.status = status;
  return { ...activity };
}

export async function deleteActivity(id: string): Promise<boolean> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk kegiatan belum tersedia di Fase 1");
  }
  const index = store.activities.findIndex((a) => a.id === id);
  if (index === -1) throw new Error("Kegiatan tidak ditemukan.");
  if (store.registrations.some((r) => r.activityId === id)) {
    throw new Error(
      "Kegiatan masih memiliki data pendaftaran. Ubah status menjadi diarsipkan."
    );
  }
  if (store.assignments.some((a) => a.activityId === id)) {
    throw new Error(
      "Kegiatan masih memiliki penugasan relawan. Ubah status menjadi diarsipkan."
    );
  }
  if (store.attendance.some((a) => a.activityId === id)) {
    throw new Error(
      "Kegiatan masih memiliki data absensi. Ubah status menjadi diarsipkan."
    );
  }
  store.activities.splice(index, 1);
  return true;
}

export async function listActivitiesForAdmin(): Promise<Activity[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk kegiatan belum tersedia di Fase 1");
  }
  return store.activities
    .slice()
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}
