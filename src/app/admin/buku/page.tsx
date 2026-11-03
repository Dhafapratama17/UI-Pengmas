import Link from "next/link";
import { listBooksForAdmin, listCategories } from "@/lib/services";
import { Card, SectionTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CircleAlert } from "lucide-react";
import { BooksAdmin } from "@/components/admin/books-admin";
import type { Book } from "@/types/db";

export const metadata = { title: "Manajemen Buku" };

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = (q ?? "").trim();

  const [categories, allBooks, filteredBooks] = await Promise.all([
    listCategories(),
    listBooksForAdmin(),
    search
      ? listBooksForAdmin({ search })
      : Promise.resolve(null as Book[] | null),
  ]);

  const books = filteredBooks ?? allBooks;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Manajemen Buku"
        description="Kelola katalog: tambah, edit, atur stok, dan hapus buku."
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="max-w-sm flex-1">
          <Input
            id="cari-buku"
            label="Cari judul / penulis"
            name="q"
            defaultValue={search}
            placeholder="cth. Ronggeng"
          />
        </div>
        <button
          type="submit"
          className="rounded-field bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
        >
          Cari
        </button>
        {search ? (
          <Link href="/admin/buku" className="text-sm text-primary hover:underline">
            Reset
          </Link>
        ) : null}
      </form>

      <Card>
        {books.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <CircleAlert className="h-4 w-4" aria-hidden />
            <span>Tidak ada buku yang cocok dengan pencarian.</span>
          </div>
        ) : (
          <BooksAdmin books={books} categories={categories} />
        )}
      </Card>
    </div>
  );
}
