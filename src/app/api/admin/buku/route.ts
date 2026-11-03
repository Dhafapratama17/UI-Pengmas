import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { createBook } from "@/lib/services/books";
import { bookWriteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(
      { ok: false, message: "Akses admin diperlukan." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = bookWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const book = await createBook({
      ...parsed.data,
      isbn: parsed.data.isbn || null,
      coverUrl: parsed.data.coverUrl || null,
    });
    return NextResponse.json({ ok: true, book });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Gagal menambahkan buku.",
      },
      { status: 400 }
    );
  }
}
