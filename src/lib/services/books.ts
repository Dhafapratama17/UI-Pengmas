import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import { listBooks as supabaseListBooks, getBook as supabaseGetBook } from "@/lib/services/supabase/books";
import type { Book, BookQuery, BookSort, BookStatus, Paged } from "@/types/db";

function mockListBooks(query: BookQuery): Paged<Book> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;

  let items = store.books.filter((b) => b.status === "published");

  if (query.categorySlug) {
    const category = store.categories.find(
      (c) => c.slug === query.categorySlug
    );
    items = category
      ? items.filter((b) => b.categoryId === category.id)
      : [];
  }
  if (query.search) {
    const term = query.search.toLowerCase();
    const matchingCategoryIds = store.categories
      .filter((c) => c.name.toLowerCase().includes(term))
      .map((c) => c.id);
    items = items.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        matchingCategoryIds.includes(b.categoryId)
    );
  }
  if (query.availableOnly) {
    items = items.filter((b) => b.availableCopies > 0);
  }

  const sort: BookSort = query.sort ?? "title_asc";
  items = [...items].sort((a, b) => {
    switch (sort) {
      case "title_desc":
        return b.title.localeCompare(a.title, "id");
      case "newest":
        return a.createdAt.localeCompare(b.createdAt) * -1;
      case "popular":
        return b.popularity - a.popularity;
      default:
        return a.title.localeCompare(b.title, "id");
    }
  });

  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}

export async function listBooks(query: BookQuery = {}): Promise<Paged<Book>> {
  if (dataMode === "supabase") return supabaseListBooks(query);
  return mockListBooks(query);
}

export async function getBook(id: string): Promise<Book | null> {
  if (dataMode === "supabase") return supabaseGetBook(id);
  return store.books.find((b) => b.id === id) ?? null;
}

export async function listBooksForAdmin(
  options: { search?: string } = {}
): Promise<Book[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk buku belum tersedia di Fase 1");
  }
  let items = store.books.slice();
  if (options.search) {
    const term = options.search.toLowerCase();
    items = items.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term)
    );
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listCategories() {
  return store.categories.map((c) => ({ ...c }));
}

export interface BookWriteInput {
  title: string;
  author: string;
  publisher: string;
  publicationYear: number;
  isbn?: string | null;
  categoryId: string;
  synopsis: string;
  coverUrl?: string | null;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
}

function nextBookId(): string {  const numbers = store.books.flatMap((b) => {
    const match = /^buk-(\d+)$/.exec(b.id);
    return match ? [Number(match[1])] : [];
  });
  const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
  return `buk-${String(next).padStart(3, "0")}`;
}

function validateCategory(categoryId: string) {
  if (!store.categories.some((c) => c.id === categoryId)) {
    throw new Error("Kategori buku tidak dikenal.");
  }
}

async function finishWrite(id: string) {
  return (await getBook(id))!;
}

export async function createBook(input: BookWriteInput): Promise<Book> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk buku belum tersedia di Fase 1");
  }
  validateCategory(input.categoryId);
  if (input.availableCopies > input.totalCopies) {
    throw new Error("Salinan tersedia tidak boleh melebihi total salinan.");
  }
  if (input.isbn) {
    const duplicate = store.books.some(
      (b) => b.isbn && b.isbn.toLowerCase() === input.isbn!.toLowerCase()
    );
    if (duplicate) throw new Error("ISBN sudah terdaftar pada buku lain.");
  }
  const book: Book = {
    id: nextBookId(),
    title: input.title,
    author: input.author,
    publisher: input.publisher,
    publicationYear: input.publicationYear,
    isbn: input.isbn || null,
    categoryId: input.categoryId,
    synopsis: input.synopsis,
    coverUrl: input.coverUrl || null,
    totalCopies: input.totalCopies,
    availableCopies: input.availableCopies,
    status: input.status,
    popularity: 0,
    createdAt: new Date().toISOString(),
  };
  store.books.push(book);
  return finishWrite(book.id);
}

export async function updateBook(
  id: string,
  patch: Partial<BookWriteInput>
): Promise<Book> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk buku belum tersedia di Fase 1");
  }
  const book = store.books.find((b) => b.id === id);
  if (!book) throw new Error("Buku tidak ditemukan.");
  const next: BookWriteInput = {
    title: patch.title ?? book.title,
    author: patch.author ?? book.author,
    publisher: patch.publisher ?? book.publisher,
    publicationYear: patch.publicationYear ?? book.publicationYear,
    isbn: patch.isbn !== undefined ? patch.isbn : book.isbn,
    categoryId: patch.categoryId ?? book.categoryId,
    synopsis: patch.synopsis ?? book.synopsis,
    coverUrl: patch.coverUrl !== undefined ? patch.coverUrl : book.coverUrl,
    totalCopies: patch.totalCopies ?? book.totalCopies,
    availableCopies: patch.availableCopies ?? book.availableCopies,
    status: patch.status ?? book.status,
  };
  validateCategory(next.categoryId);
  if (next.availableCopies > next.totalCopies) {
    throw new Error("Salinan tersedia tidak boleh melebihi total salinan.");
  }
  if (next.isbn) {
    const duplicate = store.books.some(
      (b) => b.id !== id && b.isbn && b.isbn.toLowerCase() === next.isbn!.toLowerCase()
    );
    if (duplicate) throw new Error("ISBN sudah terdaftar pada buku lain.");
  }
  if (next.availableCopies < 0) {
    throw new Error("Salinan tersedia tidak boleh negatif.");
  }
  book.title = next.title;
  book.author = next.author;
  book.publisher = next.publisher;
  book.publicationYear = next.publicationYear;
  book.isbn = next.isbn || null;
  book.categoryId = next.categoryId;
  book.synopsis = next.synopsis;
  book.coverUrl = next.coverUrl || null;
  book.totalCopies = next.totalCopies;
  book.availableCopies = next.availableCopies;
  book.status = next.status;
  return finishWrite(id);
}

export async function deleteBook(id: string): Promise<boolean> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk buku belum tersedia di Fase 1");
  }
  const index = store.books.findIndex((b) => b.id === id);
  if (index === -1) throw new Error("Buku tidak ditemukan.");
  const borrowed = store.borrowings.some((loan) => loan.bookId === id);
  if (borrowed) {
    throw new Error(
      "Buku masih terikat riwayat peminjaman. Ubah status menjadi diarsipkan."
    );
  }
  store.books.splice(index, 1);
  return true;
}
