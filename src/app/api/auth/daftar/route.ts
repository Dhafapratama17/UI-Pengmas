import { NextResponse } from "next/server";
import { registerMember } from "@/lib/services/auth";
import { memberRegistrationSchema } from "@/lib/validation";
import { RateLimiter, MemoryRateLimitStore, getClientIp } from "@/lib/rate-limit";

const daftarRateLimiter = new RateLimiter(
  new MemoryRateLimitStore(),
  3,
  60 * 1000,
);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateResult = daftarRateLimiter.check(`daftar:${ip}`);
  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Terlalu banyak pendaftaran. Coba lagi nanti.",
      },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as unknown;

  const parsed = memberRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid.",
      },
      { status: 400 },
    );
  }

  const result = await registerMember(parsed.data);
  if (!result.ok) {
    const status = result.code === "adapter_unavailable" ? 503 : 409;
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status },
    );
  }

  return NextResponse.json({ ok: true, memberNo: result.memberNo });
}
