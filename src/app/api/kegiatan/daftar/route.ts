import { NextResponse } from "next/server";
import {
  createPaidRegistration,
  createRegistration,
} from "@/lib/services";
import { guestParticipantSchema } from "@/lib/validation";
import {
  decodeSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";
import type { PaymentMethod } from "@/types/db";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Permintaan pendaftaran tidak dapat dibaca." },
      { status: 400 }
    );
  }

  const activityId = String(form.get("activityId") ?? "").trim();
  const parsed = guestParticipantSchema.safeParse({
    fullName: form.get("fullName"),
    email: form.get("email"),
    phone: form.get("phone"),
  });
  if (!activityId || !parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message:
          parsed.error?.issues[0]?.message ??
          "Data pendaftaran tidak lengkap atau tidak valid.",
      },
      { status: 400 }
    );
  }

  const session = await decodeSessionCookie(
    request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1)
  );
  const participant = {
    memberId: session ? session.userId : null,
    guestName: parsed.data.fullName,
    guestEmail: parsed.data.email,
    guestPhone: parsed.data.phone,
  };
  const methodValue = String(form.get("method") ?? "");
  const isPaid = methodValue === "qris" || methodValue === "bank_transfer";

  if (!isPaid) {
    try {
      const registration = await createRegistration(activityId, participant);
      return NextResponse.json({
        ok: true,
        reference: registration.reference,
        free: true,
      });
    } catch (error) {
      return respondRegistrationError(error);
    }
  }

  const evidence = form.get("evidence");
  if (!(evidence instanceof File)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Bukti pembayaran wajib diunggah untuk kegiatan berbayar.",
      },
      { status: 400 }
    );
  }
  if (evidence.size === 0 || evidence.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Ukuran bukti harus antara 1 KB hingga 5 MB." },
      { status: 400 }
    );
  }
  const lowered = evidence.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((extension) => lowered.endsWith(extension))) {
    return NextResponse.json(
      { ok: false, message: "Format bukti harus JPG atau PNG." },
      { status: 400 }
    );
  }

  try {
    const { registration } = await createPaidRegistration(
      activityId,
      participant,
      { method: methodValue as PaymentMethod, evidenceFileName: evidence.name }
    );
    return NextResponse.json({
      ok: true,
      reference: registration.reference,
      free: false,
    });
  } catch (error) {
    return respondRegistrationError(error);
  }
}

function respondRegistrationError(error: unknown) {
  return NextResponse.json(
    {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan pendaftaran.",
    },
    { status: 400 }
  );
}
