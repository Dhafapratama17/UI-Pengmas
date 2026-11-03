import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { broadcastNotifications } from "@/lib/services/notifications";
import { broadcastSchema } from "@/lib/validation";
import { RateLimiter, MemoryRateLimitStore, getClientIp } from "@/lib/rate-limit";

const broadcastRateLimiter = new RateLimiter(
  new MemoryRateLimitStore(),
  5,
  60 * 1000,
);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Akses admin diperlukan." },
      { status: 401 },
    );
  }
  const rateResult = broadcastRateLimiter.check(`broadcast:${session.userId}:${ip}`);
  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Terlalu banyak pengumuman. Coba lagi nanti.",
      },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const targets = await broadcastNotifications(
      parsed.data.target,
      {
        category: "pengumuman",
        title: parsed.data.title,
        body: parsed.data.body,
        href: null,
      },
      session.userId
    );
    return NextResponse.json({ ok: true, targets });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengirim pengumuman.",
      },
      { status: 400 }
    );
  }
}
