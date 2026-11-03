import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  QrCode,
  Receipt,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  listActivitiesForAdmin,
  listActivitiesWithAttendance,
  listActivityAttendance,
  listBooks,
  listDonations,
  listPayments,
  listProfiles,
  listRegistrationsForActivity,
  listVolunteerApplications,
} from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  donationStatusLabel,
  donationStatusTone,
  formatDateTimeWib,
  formatRupiah,
  paymentStatusLabel,
  paymentStatusTone,
  paymentSubjectLabel,
  volunteerApprovalLabel,
  volunteerApprovalTone,
} from "@/lib/status-labels";
import type { Donation, Payment } from "@/types/db";

export const metadata = { title: "Dashboard Admin" };

interface FeedItem {
  id: string;
  label: string;
  meta: string;
  at: string;
  statusLabel: string;
  statusTone: "neutral" | "info" | "success" | "warning" | "danger";
  href: string;
}

function paymentFeedItem(
  payment: Payment,
  description: string
): FeedItem {
  return {
    id: payment.id,
    label: description || paymentSubjectLabel(payment.subject),
    meta: `${formatRupiah(payment.amount)} • ${payment.method === "qris" ? "QRIS" : "Transfer Bank"}`,
    at: payment.createdAt,
    statusLabel: paymentStatusLabel(payment.status),
    statusTone: paymentStatusTone(payment.status),
    href: "/admin/pembayaran",
  };
}

function donationFeedItem(donation: Donation): FeedItem {
  return {
    id: donation.id,
    label:
      donation.type === "financial"
        ? `Donasi uang: ${donation.donorName}`
        : `Donasi buku: ${donation.donorName}`,
    meta:
      donation.type === "financial"
        ? formatRupiah(donation.amount ?? 0)
        : `${donation.bookCount} buku langsung ke perpustakaan`,
    at: donation.createdAt,
    statusLabel: donationStatusLabel(donation.status),
    statusTone: donationStatusTone(donation.status),
    href: "/admin/donasi",
  };
}

export default async function AdminDashboardPage() {
  const [books, payments, allPayments, donations, activities, members, volunteers, attendanceActivities] =
    await Promise.all([
      listBooks({ pageSize: 1 }),
      listPayments({ status: "pending" }),
      listPayments(),
      listDonations(),
      listActivitiesForAdmin(),
      listProfiles("member"),
      listVolunteerApplications(),
      listActivitiesWithAttendance(),
    ]);
  const attendanceRows = await Promise.all(
    attendanceActivities.slice(0, 5).map(async (activity) => ({
      activity,
      overview: await listActivityAttendance(activity.id),
    }))
  );
  const totalCheckins = attendanceRows.reduce(
    (sum, entry) => sum + entry.overview.attendedCount,
    0
  );

  const physicalPending = donations.filter(
    (d) => d.type === "physical" && d.status === "pending"
  ).length;
  const volunteerPending = volunteers.filter(
    (v) => v.approval === "pending"
  ).length;
  const upcoming = activities.filter(
    (a) => a.status === "published" && new Date(a.startsAt) > new Date()
  );
  const registrationTotals = await Promise.all(
    activities.map(async (activity) => {
      const regs = await listRegistrationsForActivity(activity.id);
      return { count: regs.filter((r) => r.status === "registered").length };
    })
  );
  const totalRegistrations = registrationTotals.reduce(
    (sum, entry) => sum + entry.count,
    0
  );

  const subjectDescriptions: Record<string, string> = {};
  for (const payment of allPayments.slice(0, 60)) {
    subjectDescriptions[payment.id] = paymentSubjectLabel(payment.subject);
  }

  const feed: FeedItem[] = [
    ...payments.map((payment) => paymentFeedItem(payment, subjectDescriptions[payment.id])),
    ...allPayments
      .filter((payment) => payment.status !== "pending")
      .slice(0, 6)
      .map((payment) => paymentFeedItem(payment, subjectDescriptions[payment.id])),
    ...donations.slice(0, 8).map(donationFeedItem),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Ringkasan Operasional"
        description="Mode data: mock (in-memory). Verifikasi pembayaran tetap manual sesuai rancangan."
        action={
          <LinkButton href="/admin/pembayaran" size="sm" variant="secondary">
            <Receipt className="h-4 w-4" aria-hidden />
            Buka Verifikasi
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard
          label="Buku Katalog"
          value={books.total}
          icon={<BookOpen className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Member"
          value={members.length}
          icon={<UserRound className="h-5 w-5" aria-hidden />}
          hint={`${members.filter((m) => m.membershipStatus === "active").length} aktif`}
        />
        <StatCard
          label="Relawan"
          value={volunteers.filter((v) => v.approval === "approved").length}
          icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
          hint={`${volunteerPending} menunggu persetujuan`}
        />
        <StatCard
          label="Kegiatan Mendatang"
          value={upcoming.length}
          icon={<CalendarDays className="h-5 w-5" aria-hidden />}
          hint={`${activities.length} total (termasuk draf/arsip)`}
        />
        <StatCard
          label="Total Pendaftaran"
          value={totalRegistrations}
          icon={<ClipboardList className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Verifikasi Tertunda"
          value={payments.length + physicalPending}
          icon={<Receipt className="h-5 w-5" aria-hidden />}
          hint={`${physicalPending} donasi buku + ${payments.length} pembayaran`}
        />
        <StatCard
          label="Check-in QR Tercatat"
          value={totalCheckins}
          icon={<QrCode className="h-5 w-5" aria-hidden />}
          hint="Dari 5 kegiatan terakhir berabsensi"
        />
      </div>

      <section>
        <SectionTitle
          title="Pembayaran Menunggu Verifikasi"
          description="Status pendaftar/donatur tetap menunggu sampai admin memverifikasi (design §9.5)."
        />
        {payments.length === 0 ? (
          <EmptyState
            title="Tidak ada pembayaran tertunda"
            description="Semua pembayaran sudah diproses."
          />
        ) : (          <Table>
            <THead>
              <TR>
                <TH>Subjek</TH>
                <TH>Jumlah</TH>
                <TH>Metode</TH>
                <TH>Status</TH>
                <TH>Masuk</TH>
              </TR>
            </THead>
            <TBody>
              {payments.slice(0, 5).map((payment) => (
                <TR key={payment.id}>
                  <TD className="font-medium">
                    {subjectDescriptions[payment.id] ?? paymentSubjectLabel(payment.subject)}
                  </TD>
                  <TD>{formatRupiah(payment.amount)}</TD>
                  <TD>{payment.method === "qris" ? "QRIS" : "Transfer Bank"}</TD>
                  <TD>
                    <Badge tone={paymentStatusTone(payment.status)}>
                      {paymentStatusLabel(payment.status)}
                    </Badge>
                  </TD>
                  <TD>{formatDateTimeWib(payment.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>

      <section>
        <SectionTitle
          title="Absensi Kegiatan"
          description="Peserta hadir via QR per kegiatan; token dan jendela waktu dikelola di menu QR dan Absensi."
        />
        {attendanceRows.length === 0 ? (
          <EmptyState
            title="Belum ada kegiatan berabsensi"
            description="Kegiatan dengan pendaftar/penugasan relawan tampil di sini."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Kegiatan</TH>
                <TH>Hadir</TH>
                <TH>Terdaftar</TH>
                <TH>Kelola</TH>
              </TR>
            </THead>
            <TBody>
              {attendanceRows.map(({ activity, overview }) => (
                <TR key={activity.id}>
                  <TD className="font-medium">{activity.title}</TD>
                  <TD>{overview.attendedCount}</TD>
                  <TD>{overview.eligibleCount}</TD>
                  <TD>
                    <LinkButton
                      href={`/admin/absensi/${activity.id}`}
                      size="sm"
                      variant="ghost"
                    >
                      Kelola QR
                    </LinkButton>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>

      <section>
        <SectionTitle
          title="Aktivitas Terbaru"
          description="Enam peristiwa terakhir: pembayaran dan donasi."
        />
        {feed.length === 0 ? (
          <EmptyState title="Belum ada aktivitas" />
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-surface-soft">
              {feed.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{item.label}</div>
                    <div className="text-xs text-ink-soft">
                      {item.meta} • {formatDateTimeWib(item.at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={item.statusTone}>{item.statusLabel}</Badge>
                    <LinkButton href={item.href} size="sm" variant="ghost">
                      Lihat
                    </LinkButton>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section>
        <SectionTitle
          title="Pengajuan Menunggu Persetujuan"
          description="Donasi buku (drop-off) dan pendaftaran relawan perlu keputusan admin."
        />
        {physicalPending === 0 && volunteerPending === 0 ? (
          <EmptyState title="Tidak ada pengajuan tertunda" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-primary-deep">
                    Donasi Buku Tertunda
                  </h3>
                  <p className="text-xs text-ink-soft">
                    {physicalPending} pengajuan menunggu konfirmasi drop-off.
                  </p>
                </div>
                <LinkButton href="/admin/donasi" size="sm" variant="secondary">
                  Buka
                </LinkButton>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-primary-deep">
                    Relawan Menunggu Persetujuan
                  </h3>
                  <p className="text-xs text-ink-soft">
                    {volunteerPending} akun menunggu dikaktifkan sebagai relawan.
                  </p>
                </div>
                <LinkButton href="/admin/volunteer" size="sm" variant="secondary">
                  Buka
                </LinkButton>
              </div>
            </Card>
          </div>
        )}
      </section>

      <section>
        <SectionTitle
          title="Persetujuan Relawan Terbaru"
          description="Daftar seluruh akun relawan dan status persetujuannya."
        />
        <Table>
          <THead>
            <TR>
              <TH>Nama</TH>
              <TH>Email</TH>
              <TH>Status</TH>
              <TH>Aksi</TH>
            </TR>
          </THead>
          <TBody>
            {volunteers.slice(0, 5).map((volunteer) => (
              <TR key={volunteer.id}>
                <TD className="font-medium">{volunteer.fullName}</TD>
                <TD>{volunteer.email}</TD>
                <TD>
                  <Badge tone={volunteerApprovalTone(volunteer.approval)}>
                    {volunteerApprovalLabel(volunteer.approval)}
                  </Badge>
                </TD>
                <TD>
                  <LinkButton href="/admin/volunteer" size="sm" variant="ghost">
                    Kelola
                  </LinkButton>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>

      <section>
        <SectionTitle
          title="Status Donasi Terkini"
          description="Ringkas semua donasi (uang & buku) beserta statusnya."
        />
        {donations.length === 0 ? (
          <EmptyState title="Belum ada donasi" />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Referensi</TH>
                <TH>Jenis</TH>
                <TH>Donatur</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {donations.slice(0, 6).map((donation) => (
                <TR key={donation.id}>
                  <TD className="font-medium">{donation.reference}</TD>
                  <TD>{donation.type === "financial" ? "Uang" : "Buku"}</TD>
                  <TD>{donation.donorName}</TD>
                  <TD>
                    <Badge tone={donationStatusTone(donation.status)}>
                      {donationStatusLabel(donation.status)}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>
    </div>
  );
}
