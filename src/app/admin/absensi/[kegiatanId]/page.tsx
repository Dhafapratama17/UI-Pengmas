import Link from "next/link";
import { notFound } from "next/navigation";
import {
  describeAttendanceWindow,
  getActivity,
  getActiveTokenForActivity,
  listActivityAttendance,
} from "@/lib/services";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AttendanceTokenPanel } from "@/components/attendance/attendance-token-panel";
import {
  formatDateTimeWib,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/lib/status-labels";
import { formatActivityWindow } from "@/lib/util/format";

export const metadata = { title: "Detail Absensi Kegiatan (Admin)" };

export default async function AdminAbsensiDetailPage({
  params,
}: {
  params: Promise<{ kegiatanId: string }>;
}) {
  const { kegiatanId } = await params;
  const activity = await getActivity(kegiatanId);
  if (!activity) notFound();

  const [overview, token] = await Promise.all([
    listActivityAttendance(activity.id),
    Promise.resolve(getActiveTokenForActivity(activity.id)),
  ]);
  const window = describeAttendanceWindow(activity);

  const windowTone: BadgeTone =
    window.state === "open"
      ? "success"
      : window.state === "not_started"
        ? "info"
        : "danger";
  const windowLabel =
    window.state === "open"
      ? "Terbuka"
      : window.state === "not_started"
        ? "Belum dibuka"
        : "Ditutup";

  return (
    <div className="space-y-6">
      <SectionTitle
        title={`Absensi: ${activity.title}`}
        description={`${activity.location} • ${formatActivityWindow(activity.startsAt, activity.endsAt)} WIB`}
        action={
          <Link
            href="/admin/absensi"
            className="rounded-field px-3 py-2 text-sm font-semibold text-primary-deep hover:bg-surface-blue"
          >
            Kembali ke Daftar
          </Link>
        }
      />

      <Card padded={false}>
        <div className="border-b border-surface-soft p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-ink">QR Code Kegiatan</h2>
            <Badge tone={windowTone}>
              Jendela absensi: {windowLabel}
            </Badge>
          </div>
          <div className="mb-4 text-xs text-ink-soft">
            Terbuka {formatDateTimeWib(window.opensAt)} s.d.
            {" "}
            {formatDateTimeWib(window.closesAt)} (validasi server).
          </div>
          <AttendanceTokenPanel
            activityId={activity.id}
            activityTitle={activity.title}
            startsAt={activity.startsAt}
            endsAt={activity.endsAt}
            initialToken={
              token
                ? {
                    token: token.token,
                    active: token.active,
                    createdAt: token.createdAt,
                    updatedAt: token.updatedAt,
                  }
                : null
            }
            attendanceWindow={window}
          />
        </div>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-primary-deep">
            Daftar Peserta ({overview.attendedCount}/{overview.eligibleCount} sudah hadir)
          </h2>
        </div>
        {overview.rows.length === 0 ? (
          <EmptyState
            title="Belum ada peserta terdaftar"
            description="Peserta tampil setelah ada pendaftaran atau penugasan relawan."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Peserta</TH>
                <TH>Peran</TH>
                <TH>Pembayaran</TH>
                <TH>Check-in</TH>
                <TH>Status Absensi</TH>
              </TR>
            </THead>
            <TBody>
              {overview.rows.map((row) => (
                <TR key={`${row.personRole}-${row.personId}`}>
                  <TD>
                    <div className="font-medium text-ink">{row.label}</div>
                    <div className="text-xs text-ink-soft">{row.detail}</div>
                  </TD>
                  <TD>{row.personRole === "member" ? "Member" : "Relawan"}</TD>
                  <TD>
                    {row.paymentStatus === "unpaid_guest" ? (
                      <span className="text-xs text-ink-soft">Tamu</span>
                    ) : row.paymentStatus ? (
                      <Badge tone={paymentStatusTone(row.paymentStatus)}>
                        {paymentStatusLabel(row.paymentStatus)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-ink-soft">—</span>
                    )}
                  </TD>
                  <TD>
                    {row.attendedAt
                      ? formatDateTimeWib(row.attendedAt)
                      : "—"}
                  </TD>
                  <TD>
                    {row.attendedAt ? (
                      <Badge tone="success">Hadir</Badge>
                    ) : row.eligible ? (
                      <Badge tone="warning">Belum hadir</Badge>
                    ) : (
                      <Badge tone="neutral">
                        Tamu (tanpa akun; check-in manual)
                      </Badge>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
        <p className="text-xs text-ink-soft">
          Duplikasi check-in otomatis ditolak (satu orang satu kegiatan).
          Peserta tanpa akun masih tercantum di daftar, tetapi harus diabsen
          manual oleh petugas karena check-in QR terikat pada akun pendaftar.
        </p>
      </section>
    </div>
  );
}
