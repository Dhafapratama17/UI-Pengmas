import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { markBorrowingReturned } from "@/lib/services/loans";
import { loanReturnSchema } from "@/lib/validation";

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
  const parsed = loanReturnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const borrowing = await markBorrowingReturned(id);
    return NextResponse.json({ ok: true, borrowing });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui data peminjaman.",
      },
      { status: 400 }
    );
  }
}
