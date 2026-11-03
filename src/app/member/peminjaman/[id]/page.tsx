import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  describeLoanState,
  getBook,
  listBorrowingsByMember,
} from "@/lib/services";

export const metadata: Metadata = { title: "Detail Peminjaman" };

const LABEL_TONES: Record<string, "info" | "warning" | "danger" | "neutral"> = {
  aktif: "info",
  "mendekati tenggat": "warning",
  terlambat: "danger",
  "sudah dikembalikan": "neutral",
};

export default async function MemberLoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionFromServer();
  if (!session || session.role !== "member") {
    return (
      <ErrorState
        title="Sesi Member tidak ditemukan"
        description="Masuk kembali sebagai member untuk membuka detail peminjaman."
      />
    );
  }

  const { id } = await params;
  const loans = await listBorrowingsByMember(session.userId);
  const loan = loans.find((b) => b.id === id);
  if (!loan || loan.memberId !== session.userId) {
    return (
      <div className="mx-auto w-full max-w-xl space-y-6">
        <ErrorState
          title="Peminjaman tidak ditemukan"
          description="Catatan peminjaman dengan nomor tersebut bukan pinjaman Anda atau tidak ada."
        />
        <div>
          <Link
            href="/member/peminjaman"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke Peminjaman Saya
          </Link>
        </div>
      </div>
    );
  }

  const book = await getBook(loan.bookId);
  const state = describeLoanState(loan, new Date());

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href="/member/peminjaman"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke Peminjaman Saya
      </Link>

      <Card className="flex flex-wrap gap-5">
        {book?.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Cover buku ${book.title}`}
            width={120}
            height={172}
            className="h-43 w-30 shrink-0 rounded-field border border-surface-soft object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-43 w-30 shrink-0 items-center justify-center rounded-field bg-surface-blue/70 text-3xl font-bold text-primary-deep"
          >
            {(book?.title ?? "B").charAt(0)}
          </div>
        )}
        <div className="min-w-60 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            ID Peminjaman{" "}
            <span className="font-mono text-ink">{loan.id}</span>
          </p>
          <h1 className="text-lg font-bold text-ink">
            {book?.title ?? loan.bookId}
          </h1>
          <p className="text-sm text-ink-soft">
            Penulis: {book?.author ?? "-"} • {book?.publicationYear ?? "-"}
          </p>
          <Badge tone={LABEL_TONES[state.label] ?? "info"}>
            {state.label.charAt(0).toUpperCase() + state.label.slice(1)}
          </Badge>
          <dl className="space-y-1.5 pt-1 text-sm text-ink-soft">
            <div>
              <dt className="inline font-semibold text-ink">Tanggal pinjam: </dt>
              <dd className="inline">{loan.borrowedAt}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-ink">Jatuh tempo: </dt>
              <dd className="inline">
                {loan.dueDate}
                {state.daysRemaining > 0
                  ? ` (sisa ${state.daysRemaining} hari)`
                  : state.daysRemaining < 0
                    ? ` (melewati ${Math.abs(state.daysRemaining)} hari)`
                    : ""}
              </dd>
            </div>
            {loan.returnedAt ? (
              <div>
                <dt className="inline font-semibold text-ink">
                  Tanggal kembali:{" "}
                </dt>
                <dd className="inline">{loan.returnedAt}</dd>
              </div>
            ) : null}
            <div>
              <dt className="inline font-semibold text-ink">
                Ketersediaan koleksi:{" "}
              </dt>
              <dd className="inline">
                {book
                  ? `${book.availableCopies}/${book.totalCopies} salinan tersedia`
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      {book?.synopsis ? (
        <Card>
          <h2 className="text-base font-bold text-ink">Sinopsis</h2>
          <p className="mt-1 text-sm text-ink-soft">{book.synopsis}</p>
        </Card>
      ) : null}

      <Card className="flex items-start gap-2.5 bg-surface-blue/50">
        <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary-deep" aria-hidden />
        <p className="text-sm text-primary-deep">
          {state.label === "terlambat"
            ? "Jatuh tempo terlewat — segera kembalikan buku ke meja petugas atau hubungi pengelola untuk penyelesaian."
            : state.label === "sudah dikembalikan"
              ? "Pengembalian telah dicatat petugas. Terima kasih atas kedisiplinan Anda."
              : "Kembalikan buku ke meja petugas ReteMali paling lambat pada jatuh tempo. Perpanjangan diajukan langsung ke petugas selama buku belum melewati tenggat."}
        </p>
      </Card>
    </div>
  );
}
