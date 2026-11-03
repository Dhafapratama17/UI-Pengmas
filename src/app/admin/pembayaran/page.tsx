import { listAllRegistrations, listActivitiesForAdmin, listDonations, listPayments, listProfiles } from "@/lib/services";
import { Card, SectionTitle } from "@/components/ui/card";
import { PaymentsAdmin } from "@/components/admin/payments-admin";
import { formatRupiah } from "@/lib/status-labels";

export const metadata = { title: "Verifikasi Pembayaran" };

export default async function AdminPaymentsPage() {
  const [payments, registrations, donations, activities, profiles] =
    await Promise.all([
      listPayments(),
      listAllRegistrations(),
      listDonations(),
      listActivitiesForAdmin(),
      listProfiles(),
    ]);

  const activityById = new Map(activities.map((a) => [a.id, a]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const subjectDescriptions: Record<string, string> = {};
  for (const payment of payments) {
    if (payment.donationId) {
      const donation = donations.find((d) => d.id === payment.donationId);
      subjectDescriptions[payment.id] = donation
        ? `${donation.reference} • ${donation.donorName}`
        : "";
      continue;
    }
    const registration = registrations.find(
      (r) => r.id === payment.activityRegistrationId
    );
    if (registration) {
      const participant = registration.memberId
        ? profileById.get(registration.memberId)?.fullName ??
          registration.memberId
        : registration.guestName ?? registration.guestEmail ?? "Tamu";
      const activityTitle =
        activityById.get(registration.activityId)?.title ?? "Kegiatan";
      subjectDescriptions[payment.id] = `${registration.reference} • ${participant} • ${activityTitle}`;
    } else {
      subjectDescriptions[payment.id] = "";
    }
  }

  const pending = payments.filter((p) => p.status === "pending");
  const processed = payments.filter((p) => p.status !== "pending");

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Verifikasi Pembayaran"
        description="Keputusan final: pending → terverifikasi/ditolak beserta alasan (design §9.5, §10.3). Status pendaftar tetap menunggu sampai admin memverifikasi."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-primary-deep">
          Menunggu Verifikasi ({pending.length})
        </h2>
        <Card>
          <PaymentsAdmin payments={payments} subjectDescriptions={subjectDescriptions} />
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-primary-deep">
          Riwayat Diproses ({processed.length})
        </h2>
        <Card padded={false}>
          <ul className="divide-y divide-surface-soft">
            {processed.length === 0 ? (
              <li className="px-4 py-3 text-sm text-ink-soft">
                Belum ada pembayaran yang diproses.
              </li>
            ) : null}
            {processed.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="min-w-0">
                  <span className="font-medium text-ink">
                    {subjectDescriptions[payment.id] ?? "—"}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {payment.method === "qris" ? "QRIS" : "Transfer Bank"} •{" "}
                    {formatRupiah(payment.amount)}
                  </span>
                </span>
                <span className="text-xs font-semibold text-ink-soft">
                  {payment.status === "verified" ? "Terverifikasi" : "Ditolak"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
