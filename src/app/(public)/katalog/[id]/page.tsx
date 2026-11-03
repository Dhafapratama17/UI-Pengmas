import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, Building2, CalendarDays, Hash } from "lucide-react";
import { notFound } from "next/navigation";
import { BorrowCta } from "@/components/catalog/borrow-cta";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getBook, listCategories } from "@/lib/services";

const categoryCoverClasses: Record<string, string> = {
  membaca: "bg-sky-100 text-sky-700",
  sains: "bg-emerald-100 text-emerald-700",
  novel: "bg-rose-100 text-rose-700",
  anak: "bg-amber-100 text-amber-700",
  dongeng: "bg-violet-100 text-violet-700",
};

function SpecRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm text-ink-soft">
        <span className="text-primary-deep" aria-hidden>
          {icon}
        </span>
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();
  return { title: book.title };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book || book.status !== "published") notFound();

  const categories = await listCategories();
  const category = categories.find((item) => item.id === book.categoryId);
  const coverClass =
    (category && categoryCoverClasses[category.slug]) ??
    "bg-surface-blue text-primary-deep";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          href="/katalog"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke Katalog
        </Link>
        <h1 className="sr-only">Detail Buku</h1>
      </div>

      <div className="flex justify-center">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Sampul buku ${book.title}`}
            width={352}
            height={512}
            className="h-64 w-44 rounded-card border border-surface-soft object-cover shadow-card"
          />
        ) : (
          <div
            className={`flex h-64 w-44 items-center justify-center rounded-card border border-surface-soft p-6 text-center shadow-card ${coverClass}`}
            aria-hidden
          >
            <span className="text-lg font-extrabold uppercase tracking-wide">
              {category?.name ?? "Koleksi"}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-extrabold text-primary-deep">
          {book.title}
        </h2>
        <p className="text-sm text-ink-soft">
          Oleh {book.author} • Kategori: {category?.name ?? "-"}
        </p>
        <div className="mt-2 flex justify-center">
          {book.availableCopies > 0 ? (
            <Badge tone="success">
              Tersedia {book.availableCopies} dari {book.totalCopies} eksemplar
            </Badge>
          ) : (
            <Badge tone="warning">
              Semua {book.totalCopies} eksemplar sedang dipinjam
            </Badge>
          )}
        </div>
      </div>

      <Card className="divide-y divide-surface-soft">
        <SpecRow
          icon={<Building2 className="h-4 w-4" aria-hidden />}
          label="Penerbit"
          value={book.publisher}
        />
        <SpecRow
          icon={<CalendarDays className="h-4 w-4" aria-hidden />}
          label="Tahun Terbit"
          value={String(book.publicationYear)}
        />
        <SpecRow
          icon={<Hash className="h-4 w-4" aria-hidden />}
          label="ISBN"
          value={book.isbn ?? "Tidak tersedia"}
        />
      </Card>

      <Card className="space-y-2">
        <h3 className="text-base font-bold text-primary-deep">
          Sinopsis Buku
        </h3>
        <p className="text-sm leading-relaxed text-ink">{book.synopsis}</p>
      </Card>

      <Card className="space-y-2">
        <h3 className="text-base font-bold text-primary-deep">
          Ketentuan Peminjaman Anggota
        </h3>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>Durasi peminjaman maksimal 14 hari kalender.</li>
          <li>
            Pengambilan dan pengembalian dilakukan langsung di meja
            sirkulasi ReteMali.
          </li>
          <li>
            Memerlukan status member terverifikasi oleh pengelola saat
            peminjaman direkam.
          </li>
        </ul>
      </Card>

      <BorrowCta bookTitle={book.title} availableCopies={book.availableCopies} />
    </div>
  );
}
