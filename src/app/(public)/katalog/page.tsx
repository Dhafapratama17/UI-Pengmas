import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { SearchX, BookOpen } from "lucide-react";
import { CatalogControls } from "@/components/catalog/catalog-controls";
import { BookCard } from "@/components/catalog/book-card";
import { LinkButton } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { listBooks, listCategories } from "@/lib/services";
import type { BookSort, BookQuery } from "@/types/db";

export const metadata: Metadata = { title: "Katalog Buku" };

const PAGE_SIZE = 12;

const SORT_VALUES = new Set<BookSort>([
  "title_asc",
  "title_desc",
  "newest",
  "popular",
]);

function parseQuery(
  searchParams: Record<string, string | string[] | undefined>
): BookQuery {
  const pick = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const search = pick("cari")?.trim() || undefined;
  const categorySlug = pick("kategori")?.trim() || undefined;
  const availableOnly = pick("tersedia") === "1";
  const rawSort = pick("urut");
  const sort: BookSort =
    rawSort && SORT_VALUES.has(rawSort as BookSort)
      ? (rawSort as BookSort)
      : "title_asc";
  const rawPage = Number.parseInt(pick("hal") ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  return { search, categorySlug, availableOnly, sort, page, pageSize: PAGE_SIZE };
}

function buildPageHref(
  base: Record<string, string | string[] | undefined>,
  page: number
): string {
  const params = new URLSearchParams();
  const single: Record<string, string> = {};
  for (const [key, value] of Object.entries(base)) {
    if (typeof value === "string" && value) single[key] = value;
  }
  for (const [key, value] of Object.entries(single)) params.set(key, value);
  if (page > 1) params.set("hal", String(page));
  const query = params.toString();
  return query ? `/katalog?${query}` : "/katalog";
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const query = parseQuery(resolvedParams);

  try {
    const [categories, books] = await Promise.all([
      listCategories(),
      listBooks(query),
    ]);

    const categoryNameFor = (categoryId: string) =>
      categories.find((category) => category.id === categoryId);

    const shownFrom =
      (books.page - 1) * books.pageSize + books.items.length;
    const resultLabel = `Menampilkan ${books.items.length} dari ${books.total} koleksi`;
    const hasNext = books.page * books.pageSize < books.total;
    const hasPrev = books.page > 1;

    return (
      <div className="space-y-6">
        <SectionTitle
          title="Katalog Koleksi Buku"
          description="Jelajahi koleksi Taman Baca ReteMali — cari berdasarkan judul, penulis, atau kategori, lalu saring sesuai kebutuhan."
        />

        <Suspense fallback={<Skeleton className="h-56" />}>
          <CatalogControls
            categories={categories}
            resultLabel={resultLabel}
          />
        </Suspense>

        {books.items.length === 0 ? (
          <EmptyState
            icon={<SearchX aria-hidden />}
            title="Tidak ada buku yang cocok"
            description="Tidak ditemukan koleksi dengan kombinasi pencarian/filter tersebut. Coba ubah kata kunci atau atur ulang filter."
            action={
              <LinkButton href="/katalog" variant="secondary" size="sm">
                Atur ulang filter
              </LinkButton>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {books.items.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                category={categoryNameFor(book.categoryId)}
              />
            ))}
          </div>
        )}

        {books.total > 0 ? (
          <p
            className="text-center text-xs text-ink-soft"
            aria-live="polite"
          >
            Menampilkan {shownFrom} dari {books.total} koleksi.
          </p>
        ) : null}

        {hasPrev || hasNext ? (
          <div className="flex items-center justify-center gap-3">
            {hasPrev ? (
              <LinkButton
                href={buildPageHref(resolvedParams, books.page - 1)}
                variant="secondary"
                size="sm"
              >
                Koleksi sebelumnya
              </LinkButton>
            ) : null}
            {hasNext ? (
              <LinkButton
                href={buildPageHref(resolvedParams, books.page + 1)}
                size="sm"
              >
                Muat lebih banyak koleksi…
              </LinkButton>
            ) : null}
          </div>
        ) : null}

        <Card className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-soft">
            Ingin meminjam koleksi di atas? Peminjaman penuh tersedia untuk
            member terverifikasi.
          </p>
          <Link
            href="/login/daftar"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Daftar member baru
          </Link>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Katalog Koleksi Buku" />
        <ErrorState
          title="Katalog tidak dapat dimuat"
          description={
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat katalog buku."
          }
        />
      </div>
    );
  }
}
