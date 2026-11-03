import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Hourglass,
  MapPin,
  QrCode,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LinkButton } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  describeLoanState,
  getActivity,
  getBook,
  getProfileById,
  listActivities,
  listAttendanceForPerson,
  listBorrowingsByMember,
  listPayments,
  listRegistrationsForUser,
  getUnreadCount,
} from "@/lib/services";
import { formatActivityWindow } from "@/lib/util/format";

export const metadata: Metadata = { title: "Dashboard Member" };

const LABEL_TONES: Record<string, "info" | "warning" | "danger" | "neutral"> = {
  aktif: "info",
  "mendekati tenggat": "warning",
  terlambat: "danger",
  "sudah dikembalikan": "neutral",
};

export default async function MemberDashboardPage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "member") {
    return (
      <ErrorState
        title="Sesi Member tidak ditemukan"
        description="Masuk kembali sebagai member untuk membuka dashboard."
      />
    );
  }

  const profile = await getProfileById(session.userId);
  if (!profile) {
    return (
      <ErrorState
        title="Profil tidak ditemukan"
        description="Akun Anda tidak memiliki profil member pada aplikasi."
      />
    );
  }

  const now = new Date();
  const loans = await listBorrowingsByMember(profile.id);
  const [attendance, unread] = await Promise.all([
    listAttendanceForPerson(profile.id),
    getUnreadCount(profile.id),
  ]);
  const loanRows = await Promise.all(
    loans.map(async (loan) => ({
      loan,
      book: await getBook(loan.bookId),
      state: describeLoanState(loan, now),
    }))
  );
  const activeRows = loanRows.filter(
    (r) => r.state.label !== "sudah dikembalikan"
  );
  const dueSoonRows = activeRows
    .filter((r) => r.state.label !== "terlambat")
    .sort((a, b) => a.loan.dueDate.localeCompare(b.loan.dueDate))
    .slice(0, 3);
  const overdueCount = loanRows.filter(
    (r) => r.state.label === "terlambat"
  ).length;
  const returnedCount = loanRows.filter(
    (r) => r.state.label === "sudah dikembalikan"
  ).length;

  const payments = await listPayments();
  const registrations = await listRegistrationsForUser({
    memberId: profile.id,
  });
  const recentRegistrations = registrations
    .slice()
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, 3);
  const paymentRows = await Promise.all(
    recentRegistrations.map(async (registration) => {
      const payment = payments.find(
        (p) => p.activityRegistrationId === registration.id
      );
      const activity = await getActivity(registration.activityId);
      const paidRequired = Boolean(payment) && activity && activity.feeAmount > 0;
      return { registration, activity, paidRequired };
    })
  );
  const paymentPendingCount = paymentRows.filter(
    (r) => r.paidRequired
  ).length;

  const upcomingActivities = (await listActivities({ upcomingOnly: true, now }))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {(session.fullName || profile.fullName).charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-bold text-ink">{profile.fullName}</p>
            <p className="text-sm text-ink-soft">
              ID Member {profile.memberNo} • {profile.email}
            </p>
          </div>
        </div>
        <Badge tone={profile.membershipStatus === "active" ? "success" : "warning"}>
          {profile.membershipStatus === "active"
            ? "Member ReteMali — aktif"
            : "Member ReteMali — menunggu verifikasi admin"}
        </Badge>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Sedang dipinjam" value={activeRows.length} />
        <StatCard label="Terlambat" value={overdueCount} />
        <StatCard label="Sudah dikembalikan" value={returnedCount} />
        <StatCard
          label="Kegiatan diikuti"
          value={registrations.length}
          hint={
            paymentPendingCount > 0
              ? `${paymentPendingCount} menunggu verifikasi pembayaran`
              : undefined
          }
        />
        <StatCard
          label="Kehadiran tercatat"
          value={attendance.length}
          icon={<QrCode className="h-5 w-5" aria-hidden />}
          hint="Check-in QR kegiatan"
        />
        <StatCard
          label="Notifikasi belum dibaca"
          value={unread}
          hint="Pesan pembayaran, pengingat, dan pengumuman"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/member/qr-absensi" variant="secondary" size="sm">
          <QrCode className="h-4 w-4" aria-hidden />
          Buka QR Absensi
        </LinkButton>
        <LinkButton href="/member/notifikasi" variant="ghost" size="sm">
          Buka Notifikasi
        </LinkButton>
      </div>

      <section>
        <SectionTitle
          title="Mendekati Tenggat"
          description="Pinjaman aktif dengan jatuh tempo terdekat, termasuk yang melewati tenggat."
        />
        {activeRows.length === 0 ? (
          <EmptyState
            title="Tidak ada pinjaman aktif"
            description="Telusuri katalog dan ajukan peminjaman melalui petugas."
          />
        ) : (
          <Table>
            <THead>
              <TH>Buku</TH>
              <TH>Dipinjam</TH>
              <TH>Jatuh Tempo</TH>
              <TH>Status</TH>
              <TH>Detail</TH>
            </THead>
            <TBody>
              {(overdueCount > 0 ? activeRows : dueSoonRows).map(
                ({ loan, book, state }) => (
                  <TR key={loan.id}>
                    <TD>{book?.title ?? loan.bookId}</TD>
                    <TD>{loan.borrowedAt}</TD>
                    <TD>{loan.dueDate}</TD>
                    <TD>
                      <Badge tone={LABEL_TONES[state.label] ?? "info"}>
                        {state.label.charAt(0).toUpperCase() + state.label.slice(1)}
                      </Badge>
                    </TD>
                    <TD>
                      <Link
                        href={`/member/peminjaman/${loan.id}`}
                        className="text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
                      >
                        Detail
                      </Link>
                    </TD>
                  </TR>
                )
              )}
            </TBody>
          </Table>
        )}
        <div className="mt-3">
          <LinkButton href="/member/peminjaman" variant="secondary" size="sm">
            Lihat semua peminjaman
          </LinkButton>
        </div>
      </section>

      <section>
        <SectionTitle
          title="Kegiatan Saya (Terbaru)"
          description="Tiga pendaftaran terakhir beserta status pembayarannya."
        />
        {recentRegistrations.length === 0 ? (
          <EmptyState
            title="Belum terdaftar kegiatan"
            description="Telusuri Kegiatan Komunitas untuk mendaftar."
          />
        ) : (
          <Table>
            <THead>
              <TH>Referensi</TH>
              <TH>Kegiatan</TH>
              <TH>Pembayaran</TH>
            </THead>
            <TBody>
              {paymentRows.map(({ registration, activity, paidRequired }) => (
                <TR key={registration.id}>
                  <TD className="font-mono text-xs">{registration.reference}</TD>
                  <TD>{activity?.title ?? registration.activityId}</TD>
                  <TD>
                    <Badge tone={paidRequired ? "warning" : "success"}>
                      {paidRequired
                        ? "Menunggu verifikasi admin"
                        : activity && activity.feeAmount > 0
                          ? "Menunggu verifikasi admin"
                          : "Gratis — terkonfirmasi"}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
        <div className="mt-3">
          <LinkButton href="/member/kegiatan" variant="secondary" size="sm">
            Menu Kegiatan Saya
          </LinkButton>
        </div>
      </section>

      <section>
        <SectionTitle
          title="Aktivitas Terbaru"
          description="Kegiatan komunitas mendatang; terbuka untuk pendaftaran."
        />
        {upcomingActivities.length === 0 ? (
          <EmptyState title="Belum ada kegiatan mendatang" />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingActivities.map((activity) => (
              <Card key={activity.id} className="space-y-2">
                <p className="font-bold text-ink">{activity.title}</p>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {formatActivityWindow(activity.startsAt, activity.endsAt)}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {activity.location}
                </p>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-deep">
                  <Wallet className="h-3.5 w-3.5" aria-hidden />
                  {activity.feeAmount > 0
                    ? `Biaya ${activity.feeAmount.toLocaleString("id-ID")} — lihat detail`
                    : "Gratis"}
                  <Hourglass className="h-3.5 w-3.5" aria-hidden />
                </p>
                <Link
                  href={`/kegiatan/${activity.id}`}
                  className="inline-flex items-center text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
                >
                  Lihat Kegiatan
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
