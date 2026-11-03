import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { changeAccountPassword } from "@/lib/services";
import { passwordChangeSchema } from "@/lib/validation";
import {
  decodeSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await decodeSessionCookie(
    cookieStore.get(SESSION_COOKIE)?.value,
  );
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sesi tidak ditemukan. Masuk kembali." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Kirim data sebagai JSON." },
      { status: 400 }
    );
  }

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: String(body.currentPassword ?? ""),
    newPassword: String(body.newPassword ?? ""),
    confirmPassword: String(body.confirmPassword ?? ""),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Data kata sandi tidak valid." },
      { status: 400 }
    );
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json(
      { ok: false, message: "Kata sandi baru harus berbeda dari kata sandi saat ini." },
      { status: 400 }
    );
  }

  const result = await changeAccountPassword(
    session.userId,
    session.email,
    parsed.data.currentPassword,
    parsed.data.newPassword
  );
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, message: result.message });
}
