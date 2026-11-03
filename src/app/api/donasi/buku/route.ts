import { NextResponse } from "next/server";
import { createPhysicalDonation } from "@/lib/services";
import { physicalBookDonationSchema } from "@/lib/validation";
import type { Donation } from "@/types/db";

const CONDITION_OPTIONS = ["Baru", "Baik", "Layak pakai", "Butuh perbaikan"];

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Kirim data sebagai form-data." },
      { status: 400 }
    );
  }

  const bookConditionRaw = String(form.get("bookCondition") ?? "Baik");
  if (!CONDITION_OPTIONS.includes(bookConditionRaw)) {
    return NextResponse.json(
      { ok: false, message: "Kondisi buku tidak dikenal." },
      { status: 400 }
    );
  }

  const parsed = physicalBookDonationSchema.safeParse({
    fullName: String(form.get("fullName") ?? ""),
    email: String(form.get("email") ?? ""),
    phone: String(form.get("phone") ?? ""),
    bookCount: Number(String(form.get("bookCount") ?? "")),
    bookTitles: String(form.get("bookTitles") ?? "").slice(0, 500),
    bookCategory: String(form.get("bookCategory") ?? ""),
    bookCondition: bookConditionRaw,
    notes: form.get("notes") ? String(form.get("notes")) : undefined,
    dropOffAt: String(form.get("dropOffAt") ?? ""),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Data donasi buku tidak valid." },
      { status: 400 }
    );
  }

  const dropOffAtRaw = String(form.get("dropOffAt") ?? "");
  const padded = dropOffAtRaw.length === 16 ? `${dropOffAtRaw}:00` : dropOffAtRaw;
  const dropOffAtIso = `${padded}+07:00`;
  const dropOffDate = new Date(dropOffAtIso);
  if (Number.isNaN(dropOffDate.getTime()) || dropOffDate.getTime() <= Date.now()) {
    return NextResponse.json(
      { ok: false, message: "Jadwal drop-off harus di masa mendatang." },
      { status: 400 }
    );
  }

  try {
    const donation = await createPhysicalDonation({
      donorName: parsed.data.fullName,
      donorEmail: parsed.data.email,
      donorPhone: parsed.data.phone,
      bookCount: parsed.data.bookCount,
      bookTitles: `${parsed.data.bookCategory} — ${parsed.data.bookTitles}`,
      bookCondition: parsed.data.bookCondition,
      notes: parsed.data.notes ?? null,
      dropOffAt: dropOffAtIso,
    });
    return NextResponse.json(informationResponse(donation));
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Gagal menyimpan donasi." },
      { status: 400 }
    );
  }
}

function informationResponse(donation: Donation) {
  return { ok: true, reference: donation.reference, type: donation.type };
}
