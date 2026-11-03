import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import { notifyAdmins, notifyUser } from "@/lib/services/notifications";
import type {
  Donation,
  DonationStatus,
  DonationType,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "@/types/db";

export interface FinancialDonationInput {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  notes?: string | null;
}

export interface FinancialDonationPayment {
  method: PaymentMethod;
  evidenceFileName: string;
}

export interface PhysicalDonationInput {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  bookCount: number;
  bookTitles: string;
  bookCondition: string;
  notes?: string | null;
  dropOffAt: string;
}

function nextReference(type: DonationType): string {
  const year = new Date().getFullYear();
  const prefix = type === "financial" ? "DON" : "DONB";
  const seq = store.donations.length + 1;
  return `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
}

function mockEvidencePath(reference: string, fileName: string): string {
  const safeName = fileName
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);
  return `mock/evidence/${reference}/${safeName || "bukti"}`;
}

function formatAmountPlain(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export async function createFinancialDonation(
  input: FinancialDonationInput,
  payment: FinancialDonationPayment
): Promise<Donation> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk donasi belum tersedia di Fase 1");
  }

  const now = new Date().toISOString();
  const reference = nextReference("financial");
  const donation: Donation = {
    id: `don-${store.donations.length + 1}`,
    reference,
    type: "financial",
    donorName: input.donorName,
    donorEmail: input.donorEmail,
    donorPhone: input.donorPhone,
    amount: input.amount,
    bookCount: null,
    bookTitles: null,
    bookCondition: null,
    notes: input.notes ?? null,
    paymentMethod: payment.method,
    evidenceUrl: mockEvidencePath(reference, payment.evidenceFileName),
    dropOffAt: null,
    status: "pending",
    createdAt: now,
  };
  store.donations.push(donation);

  store.payments.push({
    id: `pay-${store.payments.length + 1}`,
    subject: "donation",
    activityRegistrationId: null,
    donationId: donation.id,
    amount: input.amount,
    method: payment.method,
    evidenceUrl: donation.evidenceUrl,
    status: "pending",
    verifiedAt: null,
    rejectionReason: null,
    createdAt: now,
  });

  notifyAdmins({
    category: "donasi",
    title: "Donasi uang baru masuk",
    body: `${donation.donorName} mengajukan donasi ${formatAmountPlain(input.amount)} via ${payment.method === "qris" ? "QRIS" : "transfer bank"} (${donation.reference}).`,
    href: "/admin/donasi",
  });

  return { ...donation };
}

export async function createPhysicalDonation(
  input: PhysicalDonationInput
): Promise<Donation> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk donasi belum tersedia di Fase 1");
  }

  const donation: Donation = {
    id: `don-${store.donations.length + 1}`,
    reference: nextReference("physical"),
    type: "physical",
    donorName: input.donorName,
    donorEmail: input.donorEmail,
    donorPhone: input.donorPhone,
    amount: null,
    bookCount: input.bookCount,
    bookTitles: input.bookTitles,
    bookCondition: input.bookCondition,
    notes: input.notes ?? null,
    paymentMethod: null,
    evidenceUrl: null,
    dropOffAt: input.dropOffAt,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.donations.push(donation);
  notifyAdmins({
    category: "donasi",
    title: "Pengajuan donasi buku baru",
    body: `${donation.donorName} mengajukan ${donation.bookCount} buku (drop-off terjadwal). Referensi ${donation.reference}.`,
    href: "/admin/donasi",
  });
  return { ...donation };
}

export async function listDonations(): Promise<Donation[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk donasi belum tersedia di Fase 1");
  }
  return store.donations
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDonationByReference(
  reference: string
): Promise<Donation | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk donasi belum tersedia di Fase 1");
  }
  const needle = reference.trim().toUpperCase();
  return store.donations.find((d) => d.reference.toUpperCase() === needle) ?? null;
}

export async function getDonationPayment(
  donationId: string
): Promise<Payment | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk donasi belum tersedia di Fase 1");
  }
  return store.payments.find((p) => p.donationId === donationId) ?? null;
}

export async function getDonationPaymentStatus(
  donationId: string
): Promise<PaymentStatus | null> {
  const payment = await getDonationPayment(donationId);
  return payment?.status ?? null;
}

export async function getDonationById(donationId: string): Promise<Donation | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk donasi belum tersedia di Fase 1");
  }
  return store.donations.find((d) => d.id === donationId) ?? null;
}

const allowedPhysicalTransitions: Record<string, DonationStatus[]> = {
  pending: ["confirmed", "rejected"],
  confirmed: ["fulfilled"],
  rejected: [],
  fulfilled: [],
};

export async function updatePhysicalDonationStatus(
  donationId: string,
  status: DonationStatus
): Promise<Donation> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk donasi belum tersedia di Fase 1");
  }
  const donation = store.donations.find((d) => d.id === donationId);
  if (!donation) throw new Error("Pengajuan donasi buku tidak ditemukan.");
  if (donation.type !== "physical") {
    throw new Error("Pengajuan ini bukan donasi buku fisik.");
  }
  if (!allowedPhysicalTransitions[donation.status].includes(status)) {
    throw new Error(
      `Perubahan status dari "${donation.status}" ke "${status}" tidak diizinkan.`
    );
  }
  donation.status = status;
  const donorProfile = store.profiles.find(
    (p) => p.email.toLowerCase() === donation.donorEmail.toLowerCase()
  );
  if (donorProfile) {
    notifyUser(donorProfile.id, {
      category: "donasi",
      title: "Donasi buku diperbarui",
      body: status === "confirmed"
        ? "Donasi buku Anda diterima (drop-off terkonfirmasi). Terima kasih."
        : status === "fulfilled"
          ? "Buku donasi Anda telah diproses ke katalog/arsip."
          : "Pengajuan donasi buku Anda ditolak.",
      href: "/donasi/status",
    });
  }
  notifyAdmins({
    category: "donasi",
    title: "Status donasi buku diperbarui",
    body: `Donasi ${donation.reference} (${donation.donorName}) kini berstatus ${status}.`,
    href: "/admin/donasi",
  });
  return { ...donation };
}
