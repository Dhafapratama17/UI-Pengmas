import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import {
  createOrRefreshToken,
  setTokenActive,
} from "@/lib/services/qr";
import { qrTokenToggleSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ kegiatanId: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Akses admin diperlukan." },
      { status: 401 }
    );
  }
  const { kegiatanId } = await params;

  try {
    const token = await createOrRefreshToken(kegiatanId, session.userId);
    return NextResponse.json({ ok: true, token });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal membuat token QR absensi.",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Akses admin diperlukan." },
      { status: 401 }
    );
  }
  const { kegiatanId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = qrTokenToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Field 'active' wajib boolean." },
      { status: 400 }
    );
  }

  try {
    const token = await setTokenActive(
      kegiatanId,
      parsed.data.active,
      session.userId
    );
    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Belum ada token QR untuk kegiatan ini." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, token });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui status token QR.",
      },
      { status: 400 }
    );
  }
}
