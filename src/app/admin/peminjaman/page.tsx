import { listBorrowingsForAdmin, listBooksForAdmin, listProfiles } from "@/lib/services";
import { Card, SectionTitle } from "@/components/ui/card";
import { LoansAdmin } from "@/components/admin/loans-admin";

export const metadata = { title: "Manajemen Peminjaman" };

export default async function AdminLoansPage() {
  const [borrowings, members, books] = await Promise.all([
    listBorrowingsForAdmin(),
    listProfiles(),
    listBooksForAdmin(),
  ]);

  const unpaidMemberCount = members.filter(
    (m) => m.membershipStatus !== "active"
  ).length;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Manajemen Peminjaman"
        description="Sirkulasi pinjam-kembali: tandai pengembalian setelah fisik buku diterima kembali (design §13.3)."
      />
      <Card>
        <div className="mb-3 flex flex-wrap gap-4 text-xs text-ink-soft">
          <span>Total catatan: {borrowings.length}</span>
          <span>
            Belum kembali:{" "}
            {borrowings.filter((b) => b.status !== "returned").length}
          </span>
          <span>Member belum aktif: {unpaidMemberCount}</span>
        </div>
        <LoansAdmin
          borrowings={borrowings}
          members={members}
          books={books}
        />
      </Card>
    </div>
  );
}
