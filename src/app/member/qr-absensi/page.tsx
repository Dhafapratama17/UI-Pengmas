import Link from "next/link";
import { QrCode } from "lucide-react";
import {
  describeAttendanceWindow,
  getActiveTokenForActivity,
  listActivities,
  listAttendanceForPerson,
  listRegistrationsForUser,
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
  notificationCategoryLabel,
  notificationCategoryTone,
  formatDateTimeWib,
} from "@/lib/status-labels";
import {
  formatActivityWindow,
  formatEventDateJakarta,
} from "@/lib/util/format";

export const metadata = { title: "QR Absensi (Member)" };

export default async function MemberQrAbsensiPage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "member") {
    return (
      <ErrorState
        title="Sesi Member tidak ditemukan"
        description="Masuk kembali sebagai member untuk membuka QR absensi."
      />
    );
  }

  const now = new Date();
  const [registrations, attendance, upcomingActivities, allActivities, notifications] =
    await Promise.all([
      listRegistrationsForUser({ memberId: session.userId }),
      listAttendanceForPerson(session.userId),
      listActivities({ upcomingOnly: true, now }),
      listActivities({ now }),
      listNotificationsForUser(session.userId),
    ]);

  const activityById = new Map(upcomingActivities.map((a) => [a.id, a]));
  const allActivityById = new Map(allActivities.map((a) => [a.id, a]));

  const upcomingRows = registrations
    .filter((r) => r.status === "registered" && activityById.has(r.activityId))
    .map((registration) => {
      const activity = activityById.get(registration.activityId)!;
      return {
        registration,
        activity,
        token: getActiveTokenForActivity(activity.id),
        window: describeAttendanceWindow(activity),
      };
    })
    .sort((a, b) => a.activity.startsAt.localeCompare(b.activity.startsAt));

  const historyRows = attendance.map((record) => ({
    record,
    activity: allActivityById.get(record.activityId) ?? null,
  }));

  const pengingat = notifications
    .filter((n) => n.category === "pengingat")
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="QR Absensi"
        description="Check-in kegiatan melalui QR yang ditampilkan petugas; validasi dan keunikan menjadi tanggung jawab server."
      />

      <Card className="flex items-start gap-3 bg-surface-blue/50">
        <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-primary-deep" aria-hidden />
        <p className="text-sm text-primary-deep">
          Cara check-in: buka QR absensi kegiatan yang ditampilkan petugas,
          lalu tekan tombol check-in. Check-in divalidasi server, tercatat satu
          kali per kegiatan, dan hanya untuk peserta yang terdaftar.
        </p>
      </Card>

      <section>
        <SectionTitle
          title="Kegiatan Mendatang yang Anda Daftarkan"
          description="Halaman check-in terbuka setelah petugas membuat QR aktif."
        />
        {upcomingRows.length === 0 ? (
          <EmptyState
            icon={<QrCode aria-hidden />}
            title="Belum ada kegiatan mendatang terdaftar"
            description="Daftar kegiatan komunitas terlebih dahulu melalui menu Kegiatan."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingRows.map(({ registration, activity, token, window: absWindow }) => (
              <Card key={registration.id} className="space-y-2">
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
            title="Pengingat Kegiatan"
            description="Dihitung otomatis dari jadwal pendaftaran Anda."
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
                  href={item.href ?? "/member/kegiatan"}
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
          title="Riwayat Kehadiran"
          description="Catatan check-in Anda per kegiatan."
        />
        {historyRows.length === 0 ? (
          <EmptyState
            title="Belum ada kehadiran tercatat"
            description="Check-in melalui QR akan tercatat di sini."
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
        <LinkButton href="/member/kegiatan" variant="secondary" size="sm">
          Kegiatan Saya
        </LinkButton>
        <LinkButton href="/member/notifikasi" variant="ghost" size="sm">
          Notifikasi Saya
        </LinkButton>
      </div>
    </div>
  );
}
