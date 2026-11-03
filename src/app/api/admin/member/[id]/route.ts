import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { setMembershipStatus } from "@/lib/services/members";
import { membershipStatusSchema } from "@/lib/validation";

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
  const parsed = membershipStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const profile = await setMembershipStatus(id, parsed.data.membershipStatus);
    return NextResponse.json({ ok: true, profile });
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
