import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { updateMemberProfile } from "@/lib/services";
import { profileUpdateSchema } from "@/lib/validation";
import {
  decodeSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";

export async function PATCH(request: Request) {
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

  const parsed = profileUpdateSchema.safeParse({
    fullName: String(body.fullName ?? ""),
    phone: String(body.phone ?? ""),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Data profil tidak valid." },
      { status: 400 }
    );
  }

  try {
    const updated = await updateMemberProfile(session.userId, {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
    });
    if (!updated) {
      return NextResponse.json(
        { ok: false, message: "Profil tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ok: true,
      fullName: updated.fullName,
      phone: updated.phone,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Gagal memperbarui profil." },
      { status: 400 }
    );
  }
}
