import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  QrCode,
  ScrollText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LinkButton } from "@/components/ui/button";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  getActivity,
  getProfileById,
  listAssignmentsForVolunteer,
  listAttendanceForPerson,
  getUnreadCount,
} from "@/lib/services";
import { formatActivityWindow } from "@/lib/util/format";

export const metadata: Metadata = { title: "Dashboard Relawan" };

export default async function VolunteerDashboardPage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "volunteer") {
    return (
      <ErrorState
        title="Sesi Relawan tidak ditemukan"
        description="Masuk kembali sebagai relawan (akun harus sudah disetujui admin) untuk membuka dashboard."
      />
    );
  }

  const profile = await getProfileById(session.userId);
  if (!profile) {
    return (
      <ErrorState
        title="Profil tidak ditemukan"
        description="Akun Anda tidak memiliki profil relawan pada aplikasi."
      />
    );
  }

  const now = new Date();
  const assignments = await listAssignmentsForVolunteer(profile.id);
  const assignmentRows = await Promise.all(
    assignments.map(async (assignment) => ({
      assignment,
      activity: await getActivity(assignment.activityId),
    }))
  );
  const upcoming = assignmentRows
    .filter(
      (r) => r.activity && new Date(r.activity.endsAt).getTime() > now.getTime()
    )
    .sort((a, b) =>
      (a.activity?.startsAt ?? "").localeCompare(b.activity?.startsAt ?? "")
    )
    .slice(0, 2);
  const attendance = await listAttendanceForPerson(profile.id);
  const [unread, attendanceTitles] = await Promise.all([
    getUnreadCount(profile.id),
    Promise.all(
      attendance.map(async (record) => ({
        record,
        title: (await getActivity(record.activityId))?.title ?? record.activityId,
      }))
    ),
  ]);

  return (
    <div className="space-y-8">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {profile.fullName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-bold text-ink">{profile.fullName}</p>
            <p className="text-sm text-ink-soft">
              ID Relawan {profile.memberNo} • {profile.email}
            </p>
          </div>
        </div>
        <Badge
          tone={profile.volunteerApprovalStatus === "approved" ? "success" : "warning"}
        >
          {profile.volunteerApprovalStatus === "approved"
            ? "Relawan disetujui"
            : `Status relawan: ${profile.volunteerApprovalStatus}`}
        </Badge>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Kegiatan mendatang"
          value={
            assignmentRows.filter(
              (r) =>
                r.activity &&
                new Date(r.activity.endsAt).getTime() > now.getTime()
            ).length
          }
        />
        <StatCard label="Total penugasan" value={assignmentRows.length} />
        <StatCard label="Total kehadiran" value={attendance.length} />
        <StatCard
          label="Notifikasi belum dibaca"
          value={unread}
          hint="Status aplikasi, penugasan, pengingat"
        />
        <StatCard
          label="Status relawan"
          value={
            profile.volunteerApprovalStatus === "approved" ? "Disetujui" : "Menunggu"
          }
        />
      </div>

      <section>
        <SectionTitle
          title="Tugas Mendatang"
          description="Dua penugasan terdekat dari volunteer_assignments."
        />
        {upcoming.length === 0 ? (
          <EmptyState
            title="Tidak ada penugasan mendatang"
            description="Penugasan baru ditetapkan admin/manajemen kegiatan."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map(({ assignment, activity }) => (
              <Card key={assignment.id} className="space-y-2">
                <p className="font-bold text-ink">
                  {activity?.title ?? assignment.activityId}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {activity
                    ? formatActivityWindow(activity.startsAt, activity.endsAt)
                    : "-"}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {activity?.location ?? "-"}
                </p>
                <p className="text-sm text-ink">
                  <span className="font-semibold">Tanggung jawab:</span>{" "}
                  {assignment.responsibilities}
                </p>
                {activity ? (
                  <Link
                    href={`/kegiatan/${activity.id}`}
                    className="inline-flex items-center text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
                  >
                    Detail kegiatan
                  </Link>
                ) : null}
              </Card>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href="/volunteer/jadwal" variant="secondary" size="sm">
            Lihat Jadwal dan Tugas
          </LinkButton>
          <LinkButton href="/volunteer/kegiatan" variant="secondary" size="sm">
            Menu Kegiatan Saya
          </LinkButton>
          <LinkButton href="/volunteer/qr-absensi" variant="ghost" size="sm">
            <QrCode className="h-4 w-4" aria-hidden />
            QR Absensi
          </LinkButton>
        </div>
      </section>

      <section>
        <SectionTitle
          title="Riwayat Kehadiran"
          description="Catatan terakhir dari attendance_records."
        />
        {attendance.length === 0 ? (
          <EmptyState
            title="Belum ada catatan kehadiran"
            description="Kehadiran tercatat saat QR Absensi dipindai petugas."
          />
        ) : (
          <div className="space-y-2">
            {attendanceTitles.slice(0, 3).map(({ record, title }) => (
              <Card key={record.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-primary-deep">
                  {title}
                </span>
                <span className="text-xs text-ink-soft">{record.scannedAt}</span>
              </Card>
            ))}
            <LinkButton href="/volunteer/kehadiran" variant="secondary" size="sm">
              Riwayat lengkap
            </LinkButton>
          </div>
        )}
      </section>

      <Card className="flex items-start gap-3 bg-surface-blue/50">
        <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-primary-deep" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-primary-deep">
            Panduan &amp; SOP Relawan
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Materi panduan/SOP resmi belum tersedia di aplikasi — dokumen
            resmi akan dipublikasikan admin ketika disiapkan. Kegiatan tetap
            mengikuti arahan koordinator pada setiap penugasan.
          </p>
        </div>
      </Card>
    </div>
  );
}
