import Link from "next/link";
import {
  listActivitiesForAdmin,
  listAllRegistrations,
  listPayments,
  listProfiles,
} from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  formatDateTimeWib,
  paymentStatusLabel,
  paymentStatusTone,
  registrationStatusLabel,
  registrationStatusTone,
} from "@/lib/status-labels";

export const metadata = { title: "Pendaftaran Kegiatan" };

export default async function AdminRegistrationsPage() {
  const [registrations, activities, payments, profiles] = await Promise.all([
    listAllRegistrations(),
    listActivitiesForAdmin(),
    listPayments(),
    listProfiles(),
  ]);

  const activityById = new Map(activities.map((a) => [a.id, a]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const paymentByRegistrationId = new Map(
    payments
      .filter((p) => p.activityRegistrationId)
      .map((p) => [p.activityRegistrationId, p])
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Pendaftaran Kegiatan"
        description="Semua pendaftar dari seluruh kegiatan, termasuk tamu dan pendaftar berbayar yang menunggu verifikasi."
      />

      <Card>
        {registrations.length === 0 ? (
          <EmptyState
            title="Belum ada pendaftaran"
            description="Pendaftar akan muncul setelah kegiatan dipublikasikan."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Referensi</TH>
                <TH>Kegiatan</TH>
                <TH>Peserta</TH>
                <TH>Daftar</TH>
                <TH>Status</TH>
                <TH>Pembayaran</TH>
              </TR>
            </THead>
            <TBody>
              {registrations.map((registration) => {
                const activity = activityById.get(registration.activityId);
                const payment = paymentByRegistrationId.get(registration.id);
                return (
                  <TR key={registration.id}>
                    <TD className="font-mono text-xs">
                      {registration.reference}
                    </TD>
                    <TD>
                      {activity ? (
                        <Link
                          href={`/admin/kegiatan/${activity.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {activity.title}
                        </Link>
                      ) : (
                        registration.activityId
                      )}
                    </TD>
                    <TD>
                      {registration.memberId ? (
                        <div>
                          {profileById.get(registration.memberId)?.fullName ??
                            registration.memberId}
                        </div>
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
                          {activity && activity.feeAmount > 0 ? "—" : "Gratis"}
                        </span>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
