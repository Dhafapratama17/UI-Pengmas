import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import {
  deleteActivity,
  setActivityStatus,
  updateActivity,
} from "@/lib/services/activities";
import { activityUpdateSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(
      { ok: false, message: "Akses admin diperlukan." },
      { status: 401 }
    );
  }
  const { id } = await params;

  const body = (await request.json().catch(() => null)) as
    | (Record<string, unknown> & { statusOnly?: boolean })
    | null;

  if (body && body.statusOnly === true) {
    const status = body.status;
    if (status !== "draft" && status !== "published" && status !== "closed" && status !== "archived") {
      return NextResponse.json(
        { ok: false, message: "Status kegiatan tidak dikenal." },
        { status: 400 }
      );
    }
    try {
      const activity = await setActivityStatus(id, status);
      return NextResponse.json({ ok: true, activity });
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          message:
            error instanceof Error ? error.message : "Gagal mengubah status.",
        },
        { status: 400 }
      );
    }
  }

  const parsed = activityUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const patch = { ...parsed.data } as Record<string, unknown>;
    if ("posterUrl" in patch) {
      patch.posterUrl = (patch.posterUrl as string) || null;
    }
    const activity = await updateActivity(
      id,
      patch as Parameters<typeof updateActivity>[1]
    );
    return NextResponse.json({ ok: true, activity });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Gagal memperbarui kegiatan.",
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
    await deleteActivity(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghapus kegiatan.",
      },
      { status: 400 }
    );
  }
}
