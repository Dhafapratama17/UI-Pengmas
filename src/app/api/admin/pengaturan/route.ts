import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { updateSiteSettings } from "@/lib/services/settings";
import { siteSettingsSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(
      { ok: false, message: "Akses admin diperlukan." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, message: "Kirim data sebagai JSON." },
      { status: 400 }
    );
  }

  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const settings = await updateSiteSettings(parsed.data);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan pengaturan website.",
      },
      { status: 400 }
    );
  }
}
