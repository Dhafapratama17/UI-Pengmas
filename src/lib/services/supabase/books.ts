import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/config";
import type { Book, BookQuery, Paged } from "@/types/db";

function db() {
  const { url, anonKey } = requireSupabaseEnv();
  return createClient(url, anonKey);
}

interface BookRow {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publication_year: number;
  isbn: string | null;
  category_id: string;
  synopsis: string;
  cover_url: string | null;
  total_copies: number;
  available_copies: number;
  status: string;
  popularity: number;
  created_at: string;
}

function mapBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    publisher: row.publisher,
    publicationYear: row.publication_year,
    isbn: row.isbn,
    categoryId: row.category_id,
    synopsis: row.synopsis,
    coverUrl: row.cover_url,
    totalCopies: row.total_copies,
    availableCopies: row.available_copies,
    status: row.status as Book["status"],
    popularity: row.popularity,
    createdAt: row.created_at,
  };
}

export async function listBooks(query: BookQuery = {}): Promise<Paged<Book>> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;

  let q = db()
    .from("books")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (query.search) {
    const term = `%${query.search}%`;
    q = q.or(`title.ilike.${term},author.ilike.${term}`);
  }
  if (query.categorySlug) {
    q = q.eq("book_categories.slug", query.categorySlug);
  }
  if (query.availableOnly) {
    q = q.gt("available_copies", 0);
  }
  if (query.sort === "title_asc") q = q.order("title", { ascending: true });
  else if (query.sort === "title_desc")
    q = q.order("title", { ascending: false });
  else if (query.sort === "popular") q = q.order("popularity");
  else q = q.order("created_at", { ascending: false });

  const { data, error, count } = await q.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );
  if (error) throw new Error(`Gagal memuat katalog buku: ${error.message}`);

  return {
    items: (data ?? []).map(mapBook),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getBook(id: string): Promise<Book | null> {
  const { data, error } = await db()
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat detail buku: ${error.message}`);
  return data ? mapBook(data) : null;
}
