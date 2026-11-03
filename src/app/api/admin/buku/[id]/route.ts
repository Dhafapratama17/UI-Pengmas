import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { deleteBook, updateBook } from "@/lib/services/books";
import { bookUpdateSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(
      { ok: false, message: "Akses admin diperlukan." },
      { status: 401 }
    );
  }
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = bookUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const patch = { ...parsed.data } as Record<string, unknown>;
    if ("isbn" in patch) patch.isbn = (patch.isbn as string) || null;
    if ("coverUrl" in patch) {
      patch.coverUrl = (patch.coverUrl as string) || null;
    }
    const book = await updateBook(id, patch as Parameters<typeof updateBook>[1]);
    return NextResponse.json({ ok: true, book });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Gagal memperbarui buku.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(
      { ok: false, message: "Akses admin diperlukan." },
      { status: 401 }
    );
  }
  const { id } = await params;
  try {
    await deleteBook(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Gagal menghapus buku.",
      },
      { status: 400 }
    );
  }
}
