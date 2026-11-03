import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  describeLoanState,
  getBook,
  listBorrowingsByMember,
} from "@/lib/services";

export const metadata: Metadata = { title: "Peminjaman Saya" };

const LABEL_TONES: Record<string, "info" | "warning" | "danger" | "neutral"> = {
  aktif: "info",
  "mendekati tenggat": "warning",
  terlambat: "danger",
  "sudah dikembalikan": "neutral",
};

function LoanHint({ label }: { label: string }) {
  if (label === "terlambat") {
    return (
      <p className="text-xs text-danger">
        Jatuh tempo terlewat — selesaikan pengembalian di meja petugas
        agar status pinjaman tidak terus menunggak.
      </p>
    );
  }
  if (label === "mendekati tenggat") {
    return (
      <p className="text-xs text-ink-soft">
        Kembalikan buku ke meja petugas sebelum jatuh tempo; perpanjangan
        diajukan langsung ke petugas di lokasi.
      </p>
    );
  }
  if (label === "sudah dikembalikan") {
    return (
      <p className="text-xs text-ink-soft">
        Buku telah diterima petugas dan catatan ini tertutup.
      </p>
    );
  }
  return (
    <p className="text-xs text-ink-soft">
      Masih dalam masa pinjam. Kembalikan di meja petugas paling lambat
      jatuh tempo.
    </p>
  );
}

export default async function MemberLoansPage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "member") {
    return (
      <ErrorState
        title="Sesi Member tidak ditemukan"
        description="Masuk kembali sebagai member untuk melihat peminjaman Anda."
      />
    );
  }

  const loans = await listBorrowingsByMember(session.userId);
  const now = new Date();
  const rows = await Promise.all(
    loans.map(async (loan) => ({
      loan,
      book: await getBook(loan.bookId),
      state: describeLoanState(loan, now),
    }))
  );
  const active = rows.filter((r) => r.state.label !== "sudah dikembalikan");
  const history = rows.filter((r) => r.state.label === "sudah dikembalikan");

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Peminjaman Saya"
        description="Status dihitung dari record peminjaman dan tanggal jatuh tempo."
      />

      <section>
        <h2 className="mb-3 text-base font-bold text-ink">Sedang Dipinjam</h2>
        {active.length === 0 ? (
          <EmptyState
            title="Tidak ada buku yang sedang dipinjam"
            description="Cari koleksi di Katalog Buku, lalu ajukan peminjaman melalui petugas di taman baca."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.map(({ loan, book, state }) => (
              <Card key={loan.id} className="flex gap-4">
                {book?.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={`Cover buku ${book.title}`}
                    width={76}
                    height={108}
                    className="h-27 w-19 shrink-0 rounded-field border border-surface-soft object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="flex h-27 w-19 shrink-0 items-center justify-center rounded-field bg-surface-blue/70 text-xl font-bold text-primary-deep"
                  >
                    {(book?.title ?? "B").charAt(0)}
                  </div>
                )}
                <div className="min-w-0 space-y-1.5">
                  <p className="truncate font-bold text-ink">
                    {book?.title ?? loan.bookId}
                  </p>
                  <p className="text-xs text-ink-soft">
                    Dipinjam {loan.borrowedAt} • Jatuh tempo {loan.dueDate}
                    {state.daysRemaining > 0
                      ? ` (sisa ${state.daysRemaining} hari)`
                      : ""}
                  </p>
                  <Badge tone={LABEL_TONES[state.label] ?? "info"}>
                    {state.label.charAt(0).toUpperCase() + state.label.slice(1)}
                  </Badge>
                  <LoanHint label={state.label} />
                  <Link
                    href={`/member/peminjaman/${loan.id}`}
                    className="inline-flex items-center text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
                  >
                    Detail peminjaman
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-ink">
          Riwayat Peminjaman
        </h2>
        {history.length === 0 ? (
          <EmptyState title="Belum ada riwayat pengembalian" />
        ) : (
          <Table>
            <THead>
              <TH>Buku</TH>
              <TH>Dipinjam</TH>
              <TH>Jatuh Tempo</TH>
              <TH>Dikembalikan</TH>
              <TH>Detail</TH>
            </THead>
            <TBody>
              {history.map(({ loan, book }) => (
                <TR key={loan.id}>
                  <TD>{book?.title ?? loan.bookId}</TD>
                  <TD>{loan.borrowedAt}</TD>
                  <TD>{loan.dueDate}</TD>
                  <TD>{loan.returnedAt ?? "-"}</TD>
                  <TD>
                    <Link
                      href={`/member/peminjaman/${loan.id}`}
                      className="text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
                    >
                      Detail
                    </Link>
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
