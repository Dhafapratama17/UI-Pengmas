import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { verifyPayment } from "@/lib/services/payments";
import { paymentDecisionSchema } from "@/lib/validation";

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
  const parsed = paymentDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const payment = await verifyPayment(id, parsed.data.decision, {
      rejectionReason: parsed.data.rejectionReason ?? null,
    });
    return NextResponse.json({ ok: true, payment });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memverifikasi pembayaran.",
      },
      { status: 400 }
    );
  }
}
