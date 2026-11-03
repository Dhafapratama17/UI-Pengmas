import { NextResponse } from "next/server";
import { createFinancialDonation } from "@/lib/services";
import { financialDonationSchema } from "@/lib/validation";
import type { PaymentMethod } from "@/types/db";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

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

  const raw = {
    fullName: String(form.get("fullName") ?? ""),
    email: String(form.get("email") ?? ""),
    phone: String(form.get("phone") ?? ""),
    notes: form.get("notes") ? String(form.get("notes")) : undefined,
  };
  const amountRaw = String(form.get("amount") ?? "");
  const methodRaw = String(form.get("method") ?? "");

  const amount = Number(amountRaw);
  const parsed = financialDonationSchema.safeParse({
    ...raw,
    amount,
    method: methodRaw,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Data donasi tidak valid." },
      { status: 400 }
    );
  }
  if (!["qris", "bank_transfer"].includes(methodRaw)) {
    return NextResponse.json(
      { ok: false, message: "Metode pembayaran tidak dikenal." },
      { status: 400 }
    );
  }

  const evidence = form.get("evidence");
  if (!(evidence instanceof File) || evidence.size === 0) {
    return NextResponse.json(
      { ok: false, message: "Bukti transfer wajib diunggah." },
      { status: 400 }
    );
  }
  if (evidence.size < 1024 || evidence.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Ukuran bukti harus antara 1 KB hingga 5 MB." },
      { status: 400 }
    );
  }
  if (!ALLOWED_TYPES.includes(evidence.type)) {
    return NextResponse.json(
      { ok: false, message: "Format bukti harus JPG atau PNG." },
      { status: 400 }
    );
  }

  try {
    const donation = await createFinancialDonation(
      {
        donorName: parsed.data.fullName,
        donorEmail: parsed.data.email,
        donorPhone: parsed.data.phone,
        amount: parsed.data.amount,
        notes: parsed.data.notes ?? null,
      },
      {
        method: methodRaw as PaymentMethod,
        evidenceFileName: evidence.name,
      }
    );
    return NextResponse.json({
      ok: true,
      reference: donation.reference,
      free: false,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Gagal menyimpan donasi." },
      { status: 400 }
    );
  }
}
