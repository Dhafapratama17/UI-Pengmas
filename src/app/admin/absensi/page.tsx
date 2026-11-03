import Link from "next/link";
import { QrCode } from "lucide-react";
import {
  describeAttendanceWindow,
  getActiveTokenForActivity,
  listActivitiesWithAttendance,
  listActivityAttendance,
} from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  activityStatusLabel,
  activityStatusTone,
  formatDateTimeWib,
} from "@/lib/status-labels";
import { formatActivityWindow } from "@/lib/util/format";

export const metadata = { title: "QR dan Absensi" };

export default async function AdminAbsensiPage() {
  const activities = await listActivitiesWithAttendance();
  const overviews = await Promise.all(
    activities.map(async (activity) => ({
      activity,
      overview: await listActivityAttendance(activity.id),
      token: getActiveTokenForActivity(activity.id),
      window: describeAttendanceWindow(activity),
    }))
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        title="QR dan Absensi"
        description="Kelola QR per kegiatan, pantau peserta hadir, dan jendela waktu validasi absensi (design §12.3)."
      />

      {overviews.length === 0 ? (
        <EmptyState
          icon={<QrCode aria-hidden />}
          title="Belum ada kegiatan berpendaftar"
          description="Kegiatan yang memiliki pendaftar atau penugasan relawan akan tampil di sini."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Kegiatan</TH>
              <TH>Jadwal</TH>
              <TH>Status Terbit</TH>
              <TH>Peserta Terdaftar</TH>
              <TH>Sudah Hadir</TH>
              <TH>QR</TH>
              <TH>Aksi</TH>
            </TR>
          </THead>
          <TBody>
            {overviews.map(
              ({ activity, overview, token, window: attendanceWindow }) => (
                <TR key={activity.id}>
                  <TD>
                    <Link
                      href={`/admin/absensi/${activity.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {activity.title}
                    </Link>
                    <div className="text-xs text-ink-soft">
                      {activity.location}
                    </div>
                  </TD>
                  <TD className="text-xs">
                    {formatActivityWindow(activity.startsAt, activity.endsAt)}
                    <div className="text-ink-soft">
                      Absensi{" "}
                      {attendanceWindow.state === "open"
                        ? "terbuka"
                        : attendanceWindow.state === "not_started"
                          ? "belum dibuka"
                          : "ditutup"}
                    </div>
                  </TD>
                  <TD>
                    <Badge tone={activityStatusTone(activity.status)}>
                      {activityStatusLabel(activity.status)}
                    </Badge>
                  </TD>
                  <TD>{overview.eligibleCount}</TD>
                  <TD>{overview.attendedCount}</TD>
                  <TD>
                    <Badge tone={token ? "success" : "neutral"}>
                      {token ? "Ada (aktif)" : "Belum dibuat"}
                    </Badge>
                  </TD>
                  <TD>
                    <Link
                      href={`/admin/absensi/${activity.id}`}
                      className="rounded-field px-3 py-1.5 text-xs font-semibold text-primary-deep hover:bg-surface-blue"
                    >
                      Kelola QR
                    </Link>
                  </TD>
                </TR>
              )
            )}
          </TBody>
        </Table>
      )}

      <p className="text-xs text-ink-soft">
        Waktu server saat halaman dimuat: {formatDateTimeWib(new Date().toISOString())} WIB.
        Jendela absensi kegiatan: terbuka mulai 30 menit sebelum acara dan
        ditutup 60 menit setelah selesai (validasi di server).
      </p>
    </div>
  );
}
