import { NextResponse } from "next/server";
import { requestPasswordRecovery } from "@/lib/services/auth";
import { passwordRecoverySchema } from "@/lib/validation";
import { RateLimiter, MemoryRateLimitStore, getClientIp } from "@/lib/rate-limit";

const recoveryRateLimiter = new RateLimiter(
  new MemoryRateLimitStore(),
  3,
  60 * 1000,
);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateResult = recoveryRateLimiter.check(`recovery:${ip}`);
  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Terlalu banyak permintaan pemulihan kata sandi. Coba lagi nanti.",
      },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as unknown;

  const parsed = passwordRecoverySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Alamat email tidak valid.",
      },
      { status: 400 },
    );
  }

  const result = await requestPasswordRecovery(parsed.data.email);
  if (!result.ok) {
    const status: Record<string, number> = {
      adapter_unavailable: 503,
      email_not_registered: 404,
    };
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status: status[result.code] ?? 400 },
    );
  }

  return NextResponse.json({ ok: true, delivered: result.delivered });
}
