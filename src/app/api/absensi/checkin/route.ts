import { NextResponse } from "next/server";
import { getSessionFromServer } from "@/lib/auth/server-session";
import { checkInByToken } from "@/lib/services/qr";
import { attendanceCheckinSchema } from "@/lib/validation";
import { RateLimiter, MemoryRateLimitStore, getClientIp } from "@/lib/rate-limit";

const STATUS_CODES: Record<string, number> = {
  success: 200,
  already_checked_in: 409,
  not_registered: 403,
  invalid_token: 400,
  activity_unavailable: 404,
  window_closed: 409,
};

const checkinRateLimiter = new RateLimiter(
  new MemoryRateLimitStore(),
  10,
  60 * 1000,
);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const session = await getSessionFromServer();
  const userKey = session ? `${session.role}:${session.userId}` : ip;
  const rateResult = checkinRateLimiter.check(`checkin:${userKey}`);
  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        status: "rate_limited",
        message: "Terlalu banyak percobaan check-in. Coba lagi nanti.",
      },
      { status: 429 },
    );
  }
  if (!session || (session.role !== "member" && session.role !== "volunteer")) {
    return NextResponse.json(
      {
        ok: false,
        status: "invalid_token",
        message: "Masuk sebagai member atau relawan untuk melakukan check-in.",
      },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = attendanceCheckinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        status: "invalid_token",
        message: parsed.error.issues[0].message,
      },
      { status: 400 }
    );
  }

  try {
    const outcome = await checkInByToken(parsed.data.token, {
      id: session.userId,
      role: session.role === "member" ? "member" : "volunteer",
    });
    switch (outcome.status) {
      case "success":
        return NextResponse.json({
          ok: true,
          status: "success",
          message: "Check-in berhasil. Kehadiran Anda tercatat.",
          activity: outcome.activity.title,
          scannedAt: outcome.record.scannedAt,
        });
      case "already_checked_in":
        return NextResponse.json(
          { ok: false, status: "already_checked_in", message: "Anda sudah check-in. Kehadiran tidak dapat direkam berulang." },
          { status: STATUS_CODES.already_checked_in }
        );
      case "not_registered":
        return NextResponse.json(
          { ok: false, status: "not_registered", message: "Anda tidak terdaftar pada kegiatan ini (member harus terdaftar, relawan harus bertugas)." },
          { status: STATUS_CODES.not_registered }
        );
      case "invalid_token":
        return NextResponse.json(
          { ok: false, status: "invalid_token", message: "Token QR tidak valid atau sudah dibuat ulang." },
          { status: STATUS_CODES.invalid_token }
        );
      case "activity_unavailable":
        return NextResponse.json(
          { ok: false, status: "activity_unavailable", message: "Kegiatan tidak tersedia untuk absensi." },
          { status: STATUS_CODES.activity_unavailable }
        );
      case "window_closed":
        return NextResponse.json(
          { ok: false, status: "window_closed", message: "Luar jendela waktu kegiatan. Absensi hanya terbuka sekitar kegiatan." },
          { status: STATUS_CODES.window_closed }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "activity_unavailable",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memproses check-in. Coba lagi.",
      },
      { status: 500 }
    );
  }
}
