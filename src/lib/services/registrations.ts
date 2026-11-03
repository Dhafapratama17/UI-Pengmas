import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import { notifyAdmins, notifyUser } from "@/lib/services/notifications";
import type {
  ActivityRegistration,
  PaymentMethod,
} from "@/types/db";

export interface RegistrationParticipant {
  memberId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
}

function nextReference(): string {
  const year = new Date().getFullYear();
  const seq = store.registrations.length + 1;
  return `REG-${year}-${String(seq).padStart(4, "0")}`;
}

function activeDuplicateExists(
  activityId: string,
  participant: RegistrationParticipant
): boolean {
  const identityKey = participant.memberId
    ? `member:${participant.memberId}`
    : `email:${participant.guestEmail?.toLowerCase()}`;
  return store.registrations.some((r) => {
    if (r.activityId !== activityId || r.status !== "registered") return false;
    if (r.memberId) return identityKey === `member:${r.memberId}`;
    return r.guestEmail?.toLowerCase() === participant.guestEmail?.toLowerCase();
  });
}

export async function listRegistrationsForActivity(
  activityId: string
): Promise<ActivityRegistration[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk registrasi belum tersedia di Fase 1");
  }
  return store.registrations.filter((r) => r.activityId === activityId);
}

export async function listAllRegistrations(): Promise<ActivityRegistration[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk registrasi belum tersedia di Fase 1");
  }
  return store.registrations
    .slice()
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
}

export async function getRegistration(registrationId: string): Promise<ActivityRegistration | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk registrasi belum tersedia di Fase 1");
  }
  return store.registrations.find((r) => r.id === registrationId) ?? null;
}

export async function listRegistrationsForUser(
  user: { memberId?: string; email?: string }
): Promise<ActivityRegistration[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk registrasi belum tersedia di Fase 1");
  }
  return store.registrations.filter(
    (r) =>
      (user.memberId && r.memberId === user.memberId) ||
      (user.email && r.guestEmail?.toLowerCase() === user.email.toLowerCase())
  );
}

export async function getRegistrationByReference(
  reference: string
): Promise<ActivityRegistration | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk registrasi belum tersedia di Fase 1");
  }
  const needle = reference.trim().toUpperCase();
  return (
    store.registrations.find(
      (r) => r.reference.toUpperCase() === needle
    ) ?? null
  );
}

export async function createRegistration(
  activityId: string,
  participant: RegistrationParticipant
): Promise<ActivityRegistration> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk registrasi belum tersedia di Fase 1");
  }

  const activity = store.activities.find((a) => a.id === activityId);
  if (!activity || activity.status !== "published") {
    throw new Error("Kegiatan tidak ditemukan atau tidak terbuka untuk pendaftaran.");
  }
  if (new Date(activity.registrationDeadline).getTime() <= Date.now()) {
    throw new Error("Pendaftaran untuk kegiatan ini sudah ditutup.");
  }

  const registered = store.registrations.filter(
    (r) => r.activityId === activityId && r.status === "registered"
  ).length;
  if (registered >= activity.capacity) {
    throw new Error("Kuota kegiatan ini sudah penuh.");
  }
  if (activeDuplicateExists(activityId, participant)) {
    throw new Error("Anda sudah terdaftar pada kegiatan ini.");
  }

  const registration: ActivityRegistration = {
    id: `reg-${store.registrations.length + 1}`,
    reference: nextReference(),
    activityId,
    memberId: participant.memberId ?? null,
    guestName: participant.guestName ?? null,
    guestEmail: participant.guestEmail ?? null,
    guestPhone: participant.guestPhone ?? null,
    registeredAt: new Date().toISOString(),
    status: "registered",
  };
  store.registrations.push(registration);

  const activityTitle = store.activities.find((a) => a.id === activityId)?.title ?? activityId;
  if (participant.memberId) {
    notifyUser(participant.memberId, {
      category: "kegiatan",
      title: "Pendaftaran berhasil",
      body: `Anda terdaftar pada "${activityTitle}" dengan referensi ${registration.reference}.`,
      href: "/member/kegiatan",
    });
  }
  notifyAdmins({
    category: "kegiatan",
    title: "Pendaftar baru",
    body: `${participant.memberId ? "Member" : "Tamu"} mendaftar ${activityTitle} (${registration.reference}).`,
    href: "/admin/pendaftaran",
  });

  return { ...registration };
}

export async function createPaidRegistration(
  activityId: string,
  participant: RegistrationParticipant,
  payment: { method: PaymentMethod; evidenceFileName: string }
): Promise<{ registration: ActivityRegistration; paymentPending: true }> {
  const registration = await createRegistration(activityId, participant);

  store.payments.push({
    id: `pay-${store.payments.length + 1}`,
    subject: "activity_registration",
    activityRegistrationId: registration.id,
    donationId: null,
    amount: activityFee(activityId),
    method: payment.method,
    evidenceUrl: mockEvidencePath(registration.reference, payment.evidenceFileName),
    status: "pending",
    verifiedAt: null,
    rejectionReason: null,
    createdAt: new Date().toISOString(),
  });

  return { registration: { ...registration }, paymentPending: true };
}

function mockEvidencePath(reference: string, fileName: string): string {
  const safeName = fileName
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);
  return `mock/evidence/${reference}/${safeName || "bukti"}`;
}

function activityFee(activityId: string): number {
  return store.activities.find((a) => a.id === activityId)?.feeAmount ?? 0;
}
