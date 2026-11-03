import { listDonations, listPayments } from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { PhysicalDonationsAdmin } from "@/components/admin/physical-donations-admin";
import {
  donationStatusLabel,
  donationStatusTone,
  formatDateTimeWib,
  formatRupiah,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/lib/status-labels";
import type { Donation } from "@/types/db";

export const metadata = { title: "Manajemen Donasi" };

export default async function AdminDonationsPage() {
  const [donations, payments] = await Promise.all([
    listDonations(),
    listPayments({ subject: "donation" }),
  ]);

  const physical = donations.filter((d) => d.type === "physical");
  const financial = donations.filter((d) => d.type === "financial");
  const paymentByDonationId = new Map(
    payments.map((payment) => [payment.donationId, payment])
  );

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Manajemen Donasi"
        description="Tinjau donasi uang (status taut pembayaran) dan donasi buku fisik yang wajib lewat drop-off (design §10.5)."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-primary-deep">
          Donasi Buku Fisik ({physical.length})
        </h2>
        <Card>
          {physical.length === 0 ? (
            <EmptyState
              title="Belum ada pengajuan donasi buku"
              description="Pengajuan drop-off dari halaman publik akan tampil di sini."
            />
          ) : (
            <PhysicalDonationsAdmin donations={physical} />
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-primary-deep">
          Donasi Uang ({financial.length})
        </h2>
        {financial.length === 0 ? (
          <EmptyState
            title="Belum ada donasi uang"
            description="Donasi uang dengan bukti transfer akan muncul di sini."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Referensi</TH>
                <TH>Donatur</TH>
                <TH>Nominal</TH>
                <TH>Metode</TH>
                <TH>Status Donasi</TH>
                <TH>Status Pembayaran</TH>
                <TH>Masuk</TH>
              </TR>
            </THead>
            <TBody>
              {financial.map((donation: Donation) => {
                const payment = paymentByDonationId.get(donation.id);
                return (
                  <TR key={donation.id}>
                    <TD className="font-semibold text-ink">{donation.reference}</TD>
                    <TD>
                      <div>{donation.donorName}</div>
                      <div className="text-xs text-ink-soft">
                        {donation.donorEmail}
                      </div>
                    </TD>
                    <TD>{formatRupiah(donation.amount ?? 0)}</TD>
                    <TD>
                      {donation.paymentMethod === "qris"
                        ? "QRIS"
                        : donation.paymentMethod
                          ? "Transfer Bank"
                          : "—"}
                    </TD>
                    <TD>
                      <Badge tone={donationStatusTone(donation.status)}>
                        {donationStatusLabel(donation.status)}
                      </Badge>
                    </TD>
                    <TD>
                      {payment ? (
                        <Badge tone={paymentStatusTone(payment.status)}>
                          {paymentStatusLabel(payment.status)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-ink-soft">—</span>
                      )}
                      {payment?.rejectionReason ? (
                        <div className="text-xs text-danger">
                          {payment.rejectionReason}
                        </div>
                      ) : null}
                    </TD>
                    <TD>{formatDateTimeWib(donation.createdAt)}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
        <p className="text-xs text-ink-soft">
          Status pembayaran donasi uang diverifikasi melalui menu Verifikasi
          Pembayaran; keputusan tersebut juga mengubah bukti transfer pada
          baris ini.
        </p>
      </section>
    </div>
  );
}
