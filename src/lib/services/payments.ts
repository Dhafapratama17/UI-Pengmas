import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import { notifyAdmins, notifyUser } from "@/lib/services/notifications";
import type { Payment, PaymentStatus, PaymentSubject } from "@/types/db";

export async function listPayments(filter?: {
  status?: PaymentStatus;
  subject?: PaymentSubject;
}): Promise<Payment[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk pembayaran belum tersedia di Fase 1");
  }
  return store.payments
    .filter(
      (p) =>
        (!filter?.status || p.status === filter.status) &&
        (!filter?.subject || p.subject === filter.subject)
    )
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function verifyPayment(
  paymentId: string,
  decision: "verified" | "rejected",
  options: { rejectionReason?: string | null } = {}
): Promise<Payment> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk pembayaran belum tersedia di Fase 1");
  }
  const payment = store.payments.find((p) => p.id === paymentId);
  if (!payment) throw new Error("Pembayaran tidak ditemukan.");
  if (payment.status !== "pending") {
    throw new Error(
      "Pembayaran sudah diverifikasi. Keputusan tidak dapat diubah."
    );
  }
  payment.status = decision;
  payment.verifiedAt = decision === "verified" ? new Date().toISOString() : null;
  payment.rejectionReason =
    decision === "rejected" ? options.rejectionReason ?? "" : null;

  if (payment.activityRegistrationId) {
    const registration = store.registrations.find(
      (r) => r.id === payment.activityRegistrationId
    );
    if (registration?.memberId) {
      notifyUser(registration.memberId, {
        category: "pembayaran",
        title:
          decision === "verified"
            ? "Pembayaran telah diverifikasi"
            : "Pembayaran ditolak",
        body:
          decision === "verified"
            ? "Pembayaran Anda terverifikasi. Status pendaftaran kini terkonfirmasi."
            : `Bukti pembayaran ditolak: ${payment.rejectionReason || "tanpa alasan"}. Silakan kirim bukti yang benar melalui konfirmasi.`,
        href: "/member/kegiatan",
      });
    }
  }
  if (payment.donationId) {
    const donation = store.donations.find((d) => d.id === payment.donationId);
    if (donation) {
      const donorProfile = store.profiles.find(
        (p) => p.email.toLowerCase() === donation.donorEmail.toLowerCase()
      );
      if (donorProfile) {
        notifyUser(donorProfile.id, {
          category: "donasi",
          title: "Donasi diperbarui",
          body:
            decision === "verified"
              ? "Terima kasih, donasi Anda telah terverifikasi."
              : `Donasi ditolak: ${payment.rejectionReason || "tanpa alasan"}.`,
          href: "/donasi/status",
        });
      }
      notifyAdmins({
        category: "donasi",
        title: "Status donasi diperbarui",
        body: `Donasi ${donation.reference} oleh ${donation.donorName} kini ${
          decision === "verified" ? "terverifikasi" : "ditolak"
        }.`,
        href: "/admin/donasi",
      });
    }
  }

  return { ...payment };
}
