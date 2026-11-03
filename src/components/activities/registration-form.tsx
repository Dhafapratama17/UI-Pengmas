"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CircleAlert, CircleCheck, FileUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/util/format";

interface RegistrationFormProps {
  activityId: string;
  activityTitle: string;
  activitySchedule: string;
  activityLocation: string;
  feeAmount: number;
  prefillName: string | null;
  prefillEmail: string | null;
  memberMode: boolean;
  memberNumber: string | null;
  paymentInstructions: {
    qrisImageUrl: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountHolder: string | null;
  };
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  paymentMethod?: string;
  evidence?: string;
}

export function RegistrationForm({
  activityId,
  activityTitle,
  activitySchedule,
  activityLocation,
  feeAmount,
  prefillName,
  prefillEmail,
  memberMode,
  memberNumber,
  paymentInstructions,
}: RegistrationFormProps) {
  const router = useRouter();
  const isFree = feeAmount <= 0;

  const [fullName, setFullName] = useState(prefillName ?? "");
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "bank_transfer">("qris");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const chosen = event.target.files?.[0] ?? null;
    if (!chosen) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(chosen.type)) {
      setFileError("Format bukti harus JPG atau PNG.");
      event.target.value = "";
      setFile(null);
      return;
    }
    if (chosen.size > MAX_FILE_BYTES) {
      setFileError("Ukuran bukti maksimal 5 MB.");
      event.target.value = "";
      setFile(null);
      return;
    }
    setFile(chosen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    const nextErrors: FieldErrors = {};
    if (fullName.trim().length < 2)
      nextErrors.fullName = "Nama lengkap minimal 2 karakter.";
    if (!email.includes("@") || email.includes(" "))
      nextErrors.email = "Masukkan alamat email yang valid.";
    if (phone.trim().length < 8)
      nextErrors.phone = "Nomor WhatsApp/HP minimal 8 digit.";
    if (!isFree && !paymentMethod)
      nextErrors.paymentMethod = "Pilih metode pembayaran.";
    if (!isFree && !file)
      nextErrors.evidence = "Unggah bukti pembayaran terlebih dahulu.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.set("activityId", activityId);
      payload.set("fullName", fullName.trim());
      payload.set("email", email.trim());
      payload.set("phone", phone.trim());
      if (!isFree) {
        payload.set("method", paymentMethod);
        payload.set("evidence", file!);
      }
      const res = await fetch("/api/kegiatan/daftar", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNotice(
          data.message ??
            "Terjadi kesalahan saat mengirim pendaftaran. Coba lagi."
        );
        return;
      }
      router.push(
        `/kegiatan/${activityId}/konfirmasi?ref=${encodeURIComponent(data.reference)}`
      );
    } catch {
      setNotice("Tidak dapat menghubungi server. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div
        role="status"
        className="rounded-field bg-surface-blue/60 px-4 py-3 text-sm text-primary-deep"
      >
        <p className="font-bold">{activityTitle}</p>
        <p className="mt-0.5 text-xs">
          {activitySchedule} • {activityLocation}
        </p>
        <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold">
          <Wallet className="h-3.5 w-3.5" aria-hidden />
          {isFree ? "Gratis" : `Biaya: ${formatRupiah(feeAmount)} / peserta`}
        </p>
      </div>

      {memberMode ? (
        <p className="flex items-center gap-2 rounded-field border border-success/30 bg-green-50 px-3 py-2 text-xs font-semibold text-success">
          <CircleCheck className="h-4 w-4" aria-hidden />
          Data diisi otomatis dari profil Member terdaftar{memberNumber ? ` — Nomor ${memberNumber}` : ""}.
        </p>
      ) : null}

      <Input
        id="reg-nama"
        label="Nama Lengkap Peserta"
        autoComplete="name"
        placeholder="Nama peserta sesuai identitas"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />
      <Input
        id="reg-email"
        label="Alamat Email (identitas pendaftaran)"
        type="email"
        autoComplete="email"
        placeholder="nama@contoh-email.test"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        id="reg-telepon"
        label="Nomor WhatsApp Aktif"
        type="tel"
        autoComplete="tel"
        placeholder="0812-3456-7890"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
      />

      {!isFree ? (
        <div className="space-y-3 rounded-card border border-surface-soft bg-white p-4">
          <h3 className="text-base font-bold text-primary-deep">
            Instruksi Pembayaran &amp; Unggah Bukti
          </h3>
          <PaymentInstructions instructions={paymentInstructions} />
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink">
              Metode Pembayaran
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { value: "qris", label: "QRIS" },
                  { value: "bank_transfer", label: "Transfer Bank" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-field border px-3 py-2 text-sm transition-colors ${
                    paymentMethod === option.value
                      ? "border-primary bg-surface-blue/60 font-semibold text-primary-deep"
                      : "border-surface-soft bg-white text-ink-soft"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                    className="h-4 w-4 accent-[#1B5EB8]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.paymentMethod ? (
              <p className="mt-1.5 text-xs font-medium text-danger">
                {errors.paymentMethod}
              </p>
            ) : null}
          </fieldset>
          <div>
            <label
              htmlFor="reg-evidence"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-field border-2 border-dashed border-primary/40 bg-surface-blue/40 px-4 py-6 text-center transition-colors hover:bg-surface-blue/70"
            >
              <FileUp className="h-6 w-6 text-primary-deep" aria-hidden />
              <span className="text-sm font-semibold text-primary-deep">
                Ketuk untuk memilih foto bukti transfer
              </span>
              <span className="text-xs text-ink-soft">
                Format: JPG, PNG • Ukuran maks: 5MB
              </span>
              <input
                id="reg-evidence"
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                onChange={onFileChange}
              />
            </label>
            {file ? (
              <p className="mt-2 flex items-center gap-1.5 rounded-field border border-success/30 bg-green-50 px-3 py-2 text-xs font-semibold text-success">
                <CircleCheck className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                  terlampir
                </span>
              </p>
            ) : null}
            {fileError ? (
              <p className="mt-2 text-xs font-medium text-danger">{fileError}</p>
            ) : null}
            {errors.evidence ? (
              <p className="mt-2 text-xs font-medium text-danger">
                {errors.evidence}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-ink-soft">
              Admin akan memverifikasi bukti dalam waktu 1×24 jam kerja. Status
              pendaftaran tetap menunggu verifikasi sampai admin memeriksa —
              unggahan bukti belum menjadi bukti lunas.
            </p>
          </div>
        </div>
      ) : null}

      {notice ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-xs text-danger"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{notice}</span>
        </div>
      ) : null}

      <Button type="submit" loading={submitting} disabled={submitting} className="w-full">
        {isFree ? "Kirim Pendaftaran" : "Kirim Pendaftaran & Bukti Bayar"}
      </Button>
    </form>
  );
}

function PaymentInstructions({
  instructions,
}: {
  instructions: {
    qrisImageUrl: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountHolder: string | null;
  };
}) {
  const hasBank =
    instructions.bankName && instructions.bankAccountNumber ? true : false;
  if (instructions.qrisImageUrl || hasBank) {
    return (
      <div
        role="note"
        className="space-y-2 rounded-field border border-primary/30 bg-surface-blue/60 px-3 py-2.5 text-xs text-primary-deep"
      >
        <p className="font-semibold">Instruksi Pembayaran Resmi</p>
        {instructions.qrisImageUrl ? (
          <Image
            src={instructions.qrisImageUrl}
            alt="Kode QRIS pembayaran resmi"
            width={160}
            height={160}
            className="h-40 w-40 rounded-field border border-surface-soft bg-white object-contain"
          />
        ) : null}
        {hasBank ? (
          <p>
            Transfer ke {instructions.bankName} a/n{" "}
            {instructions.bankAccountHolder}{" "}
            <span className="font-mono font-bold">
              {instructions.bankAccountNumber}
            </span>
          </p>
        ) : null}
        <p>Lakukan pembayaran sesuai instruksi di atas, lalu unggah bukti transfernya.</p>
      </div>
    );
  }
  return (
    <div
      role="note"
      className="rounded-field border border-primary/30 bg-surface-blue/60 px-3 py-2.5 text-xs text-primary-deep"
    >
      <p className="font-semibold">Instruksi Pembayaran Resmi</p>
      <p className="mt-1 leading-relaxed">
        Instruksi pembayaran resmi (QRIS / nomor rekening) belum dipasang
        pengelola pada pengaturan situs. Lakukan pembayaran sesuai arahan
        pengelola kegiatan, lalu unggah bukti transfer di sini — pembayaran
        Anda akan diverifikasi admin dari bukti tersebut.
      </p>
    </div>
  );
}
