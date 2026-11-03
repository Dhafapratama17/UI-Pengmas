"use client";

import Link from "next/link";
import { AlertCircle, BookOpen, LogIn } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { useSession } from "@/components/providers/session-provider";

interface BorrowCtaProps {
  bookTitle: string;
  availableCopies: number;
}

export function BorrowCta({ bookTitle, availableCopies }: BorrowCtaProps) {
  const { session } = useSession();
  const role = session?.role ?? null;
  const isMember = role === "member";
  const isStaff = role === "admin" || role === "volunteer";
  const eligible = availableCopies > 0;

  if (isMember) {
    if (!eligible) {
      return (
        <div
          role="status"
          className="flex items-start gap-2 rounded-field border border-primary/30 bg-surface-blue/70 px-4 py-3 text-sm text-primary-deep"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Semua eksemplar &quot;{bookTitle}&quot; sedang dipinjam. Silakan
            pantau ketersediaan di katalog atau ajukan peminjaman langsung di
            meja sirkulasi ReteMali.
          </span>
        </div>
      );
    }
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-field border border-primary/30 bg-surface-blue/70 px-4 py-3 text-sm text-primary-deep"
      >
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          Pengajuan peminjaman online untuk member aktif diberlakukan setelah
          fitur dashboard member selesai. Saat ini, pengambilan dan
          perekaman peminjaman dilakukan langsung di meja sirkulasi
          ReteMali dengan kartu member Anda.
        </span>
      </div>
    );
  }

  if (isStaff) {
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-field border border-surface-soft bg-surface px-4 py-3 text-sm text-ink-soft"
      >
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          Katalog dilihat dalam mode{" "}
          {role === "admin" ? "administrator" : "relawan"} — perekaman
          peminjaman dilakukan dari mode pengelolaan (Fase 8).
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <LinkButton href="/login" className="w-full">
        <LogIn className="h-4 w-4" aria-hidden />
        Masuk sebagai Member untuk meminjam
      </LinkButton>
      <Link
        href="/login/daftar"
        className="flex justify-center text-xs font-semibold text-primary-deep underline-offset-4 hover:underline"
      >
        Belum punya akun? Daftar member baru
      </Link>
    </div>
  );
}
