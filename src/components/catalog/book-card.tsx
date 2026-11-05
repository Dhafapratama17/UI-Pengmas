import Image from "next/image";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Book, BookCategory } from "@/types/db";

const categoryCoverClasses: Record<string, string> = {
  membaca: "bg-sky-100 text-sky-700",
  sains: "bg-emerald-100 text-emerald-700",
  novel: "bg-rose-100 text-rose-700",
  anak: "bg-amber-100 text-amber-700",
  dongeng: "bg-violet-100 text-violet-700",
};

export function BookCard({
  book,
  category,
}: {
  book: Book;
  category?: BookCategory;
}) {
  const coverClass =
    (category && categoryCoverClasses[category.slug]) ??
    "bg-surface-blue text-primary-deep";
  const available = book.availableCopies > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-surface-soft bg-white shadow-card transition-shadow hover:shadow-drawer">
      {book.coverUrl ? (
        <Image
          src={book.coverUrl}
          alt={`Sampul buku ${book.title}`}
          width={352}
          height={512}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-36 items-center justify-center ${coverClass}`}
          aria-hidden
        >
          <span className="truncate px-4 text-sm font-extrabold uppercase tracking-wide">
            {category?.name ?? "Koleksi"}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 font-bold leading-snug text-ink">
          {book.title}
        </h3>
        <p className="truncate text-sm text-ink-soft">{book.author}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge tone="info">{category?.name ?? book.categoryId}</Badge>
          {available ? (
            <Badge tone="success">
              {book.availableCopies === book.totalCopies
                ? `${book.totalCopies} Eksemplar Ada`
                : `Tersedia (${book.availableCopies})`}
            </Badge>
          ) : (
            <Badge tone="warning">Dipinjam semua</Badge>
          )}
        </div>
        <div className="mt-auto pt-3">
          <LinkButton
            href={`/katalog/${book.id}`}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Detail Buku
          </LinkButton>
        </div>
      </div>
    </article>
  );
}
