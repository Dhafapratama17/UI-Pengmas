import Link from "next/link";
import { ScanLine, QrCode } from "lucide-react";
import {
  describeAttendanceWindow,
  getActiveTokenForActivity,
  getProfileById,
  listActivities,
  listAttendanceForPerson,
  listAssignmentsForVolunteer,
  listNotificationsForUser,
} from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LinkButton } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  formatDateTimeWib,
  notificationCategoryLabel,
  notificationCategoryTone,
} from "@/lib/status-labels";
import {
  formatActivityWindow,
  formatEventDateJakarta,
} from "@/lib/util/format";

export const metadata = { title: "QR Absensi (Relawan)" };

export default async function VolunteerQrAbsensiPage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "volunteer") {
    return (
      <ErrorState
        title="Sesi Relawan tidak ditemukan"
        description="Masuk kembali sebagai relawan untuk membuka QR absensi."
      />
    );
  }
  const profile = await getProfileById(session.userId);
  if (!profile || profile.volunteerApprovalStatus !== "approved") {
    return (
      <ErrorState
        title="Relawan belum disetujui"
        description="Check-in relawan hanya tersedia untuk relawan yang telah disetujui dan ditugaskan (design §11.5)."
      />
    );
  }

  const now = new Date();
  const [assignments, attendance, publishedActivities, notifications] =
    await Promise.all([
      listAssignmentsForVolunteer(session.userId),
      listAttendanceForPerson(session.userId),
      listActivities({ now }),
      listNotificationsForUser(session.userId),
    ]);

  const activityById = new Map(
    publishedActivities.map((activity) => [activity.id, activity])
  );

  const upcomingAssignments = assignments
    .filter(
      (a) =>
        a.approval === "approved" &&
        activityById.has(a.activityId) &&
        new Date(
          (activityById.get(a.activityId)?.endsAt ?? "")
        ).getTime() >= now.getTime()
    )
    .map((assignment) => {
      const activity = activityById.get(assignment.activityId)!;
      return {
        assignment,
        activity,
        token: getActiveTokenForActivity(activity.id),
        window: describeAttendanceWindow(activity),
      };
    })
    .sort((a, b) => a.activity.startsAt.localeCompare(b.activity.startsAt));

  const historyRows = attendance
    .filter((record) => record.personRole === "volunteer")
    .map((record) => ({
      record,
      activity: activityById.get(record.activityId) ?? null,
    }));

  const pengingat = notifications
    .filter((n) => n.category === "pengingat")
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="QR Absensi Relawan"
        description="Check-in penugasan Anda melalui QR kegiatan; kehadiran relawan divalidasi per penugasan di server."
      />

      <Card className="flex items-start gap-3 bg-surface-blue/50">
        <ScanLine className="mt-0.5 h-5 w-5 shrink-0 text-primary-deep" aria-hidden />
        <p className="text-sm text-primary-deep">
          Check-in hanya berlaku untuk penugasan yang sudah disetujui pada
          kegiatan terpublikasi, dan hanya saat jendela absensi terbuka.
        </p>
      </Card>

      <section>
        <SectionTitle
          title="Penugasan Mendatang"
          description="Halaman check-in tersedia setelah petugas menyiapkan QR kegiatan."
        />
        {upcomingAssignments.length === 0 ? (
          <EmptyState
            icon={<QrCode aria-hidden />}
            title="Belum ada penugasan mendatang"
            description="Penugasan relawan yang disetujui akan tampil di sini."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingAssignments.map(({ activity, token, window: absWindow }) => (
              <Card key={activity.id} className="space-y-2">
                <p className="font-bold text-ink">{activity.title}</p>
                <p className="text-xs text-ink-soft">
                  {formatEventDateJakarta(activity.startsAt)} •{" "}
                  {activity.location}
                </p>
                <p className="text-xs text-ink-soft">
                  {formatActivityWindow(activity.startsAt, activity.endsAt)} WIB
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    tone={
                      absWindow.state === "open"
                        ? "success"
                        : absWindow.state === "not_started"
                          ? "info"
                          : "danger"
                    }
                  >
                    Absensi{" "}
                    {absWindow.state === "open"
                      ? "terbuka"
                      : absWindow.state === "not_started"
                        ? "belum dibuka"
                        : "ditutup"}
                  </Badge>
                  {token ? (
                    <Link
                      href={`/absensi?token=${encodeURIComponent(token.token)}`}
                      className="rounded-field bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-deep"
                    >
                      Buka Halaman Check-in
                    </Link>
                  ) : (
                    <Badge tone="neutral">QR belum dibuat petugas</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {pengingat.length > 0 ? (
        <section>
          <SectionTitle
            title="Pengingat Penugasan"
            description="Dihasilkan otomatis untuk jendela 7 hari kegiatan terpublikasi."
          />
          <div className="space-y-2">
            {pengingat.map((item) => (
              <Card
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <Badge tone={notificationCategoryTone(item.category)}>
                    {notificationCategoryLabel(item.category)}
                  </Badge>
                  <p className="mt-1 text-sm font-bold text-ink">{item.title}</p>
                  <p className="text-xs text-ink-soft">{item.body}</p>
                </div>
                <Link
                  href={item.href ?? "/volunteer/jadwal"}
                  className="shrink-0 rounded-field px-3 py-1.5 text-xs font-semibold text-primary-deep hover:bg-surface-blue"
                >
                  Lihat Jadwal
                </Link>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionTitle
          title="Riwayat Kehadiran Relawan"
          description="Catatan check-in Anda selama bertugas."
        />
        {historyRows.length === 0 ? (
          <EmptyState
            title="Belum ada kehadiran tercatat"
            description="Check-in penugasan melalui QR akan tercatat di sini."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Kegiatan</TH>
                <TH>Waktu Check-in</TH>
              </TR>
            </THead>
            <TBody>
              {historyRows.map(({ record, activity }) => (
                <TR key={record.id}>
                  <TD className="font-medium">
                    {activity?.title ?? record.activityId}
                  </TD>
                  <TD>{formatDateTimeWib(record.scannedAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/volunteer/jadwal" variant="secondary" size="sm">
          Jadwal Tugas Saya
        </LinkButton>
        <LinkButton href="/volunteer/notifikasi" variant="ghost" size="sm">
          Notifikasi Saya
        </LinkButton>
      </div>
    </div>
  );
}
