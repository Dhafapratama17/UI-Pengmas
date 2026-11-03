import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  HeartHandshake,
  Receipt,
  Users,
} from "lucide-react";
import {
  describeLoanState,
  listActivitiesForAdmin,
  listAllRegistrations,
  listBorrowingsForAdmin,
  listBooksForAdmin,
  listDonations,
  listPayments,
  listProfiles,
  listVolunteerApplications,
} from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  formatDateTimeWib,
  formatRupiah,
} from "@/lib/status-labels";

export const metadata = { title: "Laporan" };

export default async function AdminReportsPage() {
  const [books, members, borrowings, activities, registrations, payments, donations, volunteers] =
    await Promise.all([
      listBooksForAdmin(),
      listProfiles("member"),
      listBorrowingsForAdmin(),
      listActivitiesForAdmin(),
      listAllRegistrations(),
      listPayments(),
      listDonations(),
      listVolunteerApplications(),
    ]);

  const loanState = borrowings.map((b) => ({
    state: describeLoanState(b),
    borrowing: b,
  }));
  const activeLoans = loanState.filter(
    (x) => x.state.label === "aktif" || x.state.label === "mendekati tenggat"
  ).length;
  const overdueLoans = loanState.filter(
    (x) => x.state.label === "terlambat"
  ).length;
  const upcoming = activities.filter(
    (a) => a.status === "published" && new Date(a.startsAt) > new Date()
  );
  const verifiedAmount = payments
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const donationsFinancial = donations.filter((d) => d.type === "financial");
  const donatedAmount = donationsFinancial
    .filter((d) => d.status !== "rejected")
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const physicalPending = donations.filter(
    (d) => d.type === "physical" && d.status === "pending"
  );

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Laporan Operasional"
        description="Ringkasan statistik periodik pustaka (design §13.1). Grafik hanya disiapkan bila data riil cukup tersedia."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Koleksi Buku"
          value={books.length}
          icon={<BookOpen className="h-5 w-5" aria-hidden />}
          hint={`${books.filter((b) => b.status === "published").length} tayang`}
        />
        <StatCard
          label="Member"
          value={members.length}
          icon={<Users className="h-5 w-5" aria-hidden />}
          hint={`${members.filter((m) => m.membershipStatus === "active").length} aktif`}
        />
        <StatCard
          label="Peminjaman Aktif"
          value={activeLoans}
          icon={<ClipboardList className="h-5 w-5" aria-hidden />}
          hint={`${overdueLoans} terlambat`}
        />
        <StatCard
          label="Kegiatan Mendatang"
          value={upcoming.length}
          icon={<CalendarDays className="h-5 w-5" aria-hidden />}
          hint={`${registrations.filter((r) => r.status === "registered").length} total pendaftar`}
        />
        <StatCard
          label="Pembayaran Terverifikasi"
          value={formatRupiah(verifiedAmount)}
          icon={<Receipt className="h-5 w-5" aria-hidden />}
          hint={`${pendingPayments.length} menunggu verifikasi`}
        />
        <StatCard
          label="Donasi Uang"
          value={formatRupiah(donatedAmount)}
          icon={<HeartHandshake className="h-5 w-5" aria-hidden />}
          hint={`${donationsFinancial.length} transaksi`}
        />
      </div>

      <section>
        <SectionTitle
          title="Rincian Peminjaman Terkini"
          description="Catatan sirkulasi dengan posisi tenggat."
        />
        {borrowings.length === 0 ? (
          <EmptyState title="Belum ada data peminjaman" />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Member</TH>
                <TH>Dipinjam</TH>
                <TH>Tenggat</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {borrowings.slice(0, 10).map((borrowing) => {
                const state = describeLoanState(borrowing);
                const tone =
                  state.label === "terlambat"
                    ? "danger"
                    : state.label === "mendekati tenggat"
                      ? "warning"
                      : state.label === "aktif"
                        ? "info"
                        : "neutral";
                return (
                  <TR key={borrowing.id}>
                    <TD className="font-medium">{borrowing.memberId}</TD>
                    <TD>{formatDateTimeWib(borrowing.borrowedAt)}</TD>
                    <TD>{formatDateTimeWib(borrowing.dueDate)}</TD>
                    <TD>
                      <Badge tone={tone}>{state.label}</Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="text-sm font-bold text-primary-deep">Donasi Buku Fisik</h3>
          <p className="mt-1 text-2xl font-bold text-ink">{physicalPending.length}</p>
          <p className="text-xs text-ink-soft">
            pengajuan drop-off menunggu konfirmasi.
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-primary-deep">Relawan</h3>
          <p className="mt-1 text-2xl font-bold text-ink">
            {volunteers.filter((v) => v.approval === "approved").length}
          </p>
          <p className="text-xs text-ink-soft">
            akun aktif;{" "}
            {volunteers.filter((v) => v.approval === "pending").length} menunggu
            persetujuan.
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-primary-deep">Pembayaran Ditolak</h3>
          <p className="mt-1 text-2xl font-bold text-ink">
            {payments.filter((p) => p.status === "rejected").length}
          </p>
          <p className="text-xs text-ink-soft">
            lengkap dengan alasan pada menu verifikasi.
          </p>
        </Card>
      </section>
    </div>
  );
}
