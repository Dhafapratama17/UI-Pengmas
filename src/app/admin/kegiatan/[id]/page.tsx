import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActivity,
  listPayments,
  listRegistrationsForActivity,
} from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  formatDateTimeWib,
  formatRupiah,
  paymentStatusLabel,
  paymentStatusTone,
  registrationStatusLabel,
  registrationStatusTone,
} from "@/lib/status-labels";

export const metadata = { title: "Detail Kegiatan (Admin)" };

export default async function AdminActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) notFound();

  const [registrations, payments] = await Promise.all([
    listRegistrationsForActivity(activity.id),
    listPayments({ subject: undefined }),
  ]);

  const activityPayments = payments.filter(
    (p) =>
      registrations.some(
        (r) => r.id === p.activityRegistrationId
      )
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        title={activity.title}
        description={`${activity.location} • Mulai ${formatDateTimeWib(activity.startsAt)} • Kuota ${activity.capacity}`}
        action={
          <LinkButton href="/admin/kegiatan" size="sm" variant="secondary">
            Kembali ke Daftar Kegiatan
          </LinkButton>
        }
      />

      <Card>
        <p className="text-sm text-ink-soft">{activity.description}</p>
        <p className="mt-2 text-xs text-ink-soft">
          Penanggung jawab: {activity.organizer} • Biaya:{" "}
          {activity.feeAmount > 0 ? formatRupiah(activity.feeAmount) : "gratis"}{" "}
          • Batas pendaftaran: {formatDateTimeWib(activity.registrationDeadline)}
        </p>
      </Card>

      <section>
        <SectionTitle
          title={`Daftar Peserta (${registrations.filter((r) => r.status === "registered").length}/${activity.capacity})`}
          description="Status pembayaran mengikuti verifikasi (tabel pembayaran kosong = kegiatan gratis semua peserta valid)."
        />
        {registrations.length === 0 ? (
          <EmptyState title="Belum ada pendaftar" />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Referensi</TH>
                <TH>Peserta</TH>
                <TH>Daftar</TH>
                <TH>Status Pendaftaran</TH>
                <TH>Pembayaran</TH>
              </TR>
            </THead>
            <TBody>
              {registrations.map((registration) => {
                const payment = activityPayments.find(
                  (p) => p.activityRegistrationId === registration.id
                );
                return (
                  <TR key={registration.id}>
                    <TD className="font-medium">{registration.reference}</TD>
                    <TD>
                      {registration.memberId ? (
                        <Link
                          href="/admin/member"
                          className="text-primary hover:underline"
                        >
                          {registration.memberId}
                        </Link>
                      ) : (
                        <>
                          <div>{registration.guestName}</div>
                          <div className="text-xs text-ink-soft">
                            {registration.guestEmail}
                          </div>
                        </>
                      )}
                    </TD>
                    <TD>{formatDateTimeWib(registration.registeredAt)}</TD>
                    <TD>
                      <Badge tone={registrationStatusTone(registration.status)}>
                        {registrationStatusLabel(registration.status)}
                      </Badge>
                    </TD>
                    <TD>
                      {payment ? (
                        <Badge tone={paymentStatusTone(payment.status)}>
                          {paymentStatusLabel(payment.status)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-ink-soft">
                          {activity.feeAmount > 0 ? "—" : "Gratis"}
                        </span>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </section>
    </div>
  );
}
