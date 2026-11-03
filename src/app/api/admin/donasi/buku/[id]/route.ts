import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { updatePhysicalDonationStatus } from "@/lib/services/donations";
import { physicalDonationStatusSchema } from "@/lib/validation";

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
  const parsed = physicalDonationStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const donation = await updatePhysicalDonationStatus(
      id,
      parsed.data.status
    );
    return NextResponse.json({ ok: true, donation });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengubah status donasi buku.",
      },
      { status: 400 }
    );
  }
}
