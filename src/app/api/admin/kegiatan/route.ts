import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { createActivity } from "@/lib/services/activities";
import { activityWriteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(
      { ok: false, message: "Akses admin diperlukan." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = activityWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const activity = await createActivity({
      ...parsed.data,
      posterUrl: parsed.data.posterUrl || null,
    });
    return NextResponse.json({ ok: true, activity });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Gagal menyimpan kegiatan.",
      },
      { status: 400 }
    );
  }
}
