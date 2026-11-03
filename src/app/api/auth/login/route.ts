import { NextResponse } from "next/server";
import { encodeSessionCookie, SESSION_COOKIE } from "@/lib/auth/session-cookie";
import { authenticate } from "@/lib/services/auth";
import type { LoginAccessMode } from "@/types/auth";
import { RateLimiter, MemoryRateLimitStore, getClientIp } from "@/lib/rate-limit";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const accessModes: LoginAccessMode[] = ["member", "volunteer", "admin"];

const loginRateLimiter = new RateLimiter(
  new MemoryRateLimitStore(),
  5,
  60 * 1000,
);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateResult = loginRateLimiter.check(`login:${ip}`);
  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Terlalu banyak percobaan masuk. Coba lagi nanti.",
        rateLimit: {
          limit: rateResult.limit,
          remaining: rateResult.remaining,
          resetAt: rateResult.resetAt,
        },
      },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    mode?: string;
    email?: string;
    password?: string;
  } | null;

  if (
    !body ||
    !accessModes.includes(body.mode as LoginAccessMode) ||
    !body.email ||
    !body.password
  ) {
    return NextResponse.json(
      { ok: false, message: "Permintaan login tidak lengkap." },
      { status: 400 },
    );
  }

  const result = await authenticate(
    body.mode as LoginAccessMode,
    body.email,
    body.password,
  );

  if (!result.ok) {
    const status = result.code === "adapter_unavailable" ? 503 : 401;
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status },
    );
  }

  const response = NextResponse.json({ ok: true, session: result.session });
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV === "production";
  response.cookies.set(
    SESSION_COOKIE,
    await encodeSessionCookie(result.session),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      secure: isProduction,
    },
  );
  return response;
}
