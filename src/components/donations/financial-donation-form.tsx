"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CircleAlert, CircleCheck, FileUp, HeartHandshake, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatRupiah } from "@/lib/util/format";

interface PaymentInstructionsProps {
  qrisImageUrl: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  donationInstructions: string | null;
}

export interface FinancialDonationFormProps {
  payment: PaymentInstructionsProps;
  prefillName: string | null;
  prefillEmail: string | null;
}

const AMOUNT_PRESETS = [25000, 50000, 100000];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  amount?: string;
  method?: string;
  evidence?: string;
}

export function FinancialDonationForm({
  payment,
  prefillName,
  prefillEmail,
}: FinancialDonationFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(prefillName ?? "");
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [phone, setPhone] = useState("");
  const [presetAmount, setPresetAmount] = useState<number | null>(50000);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<"qris" | "bank_transfer">("qris");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resolvedAmount = customAmount.trim()
    ? Number(customAmount.replace(/[^\d]/g, ""))
    : presetAmount;

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
    if (chosen.size < 1024) {
      setFileError("Ukuran bukti harus antara 1 KB hingga 5 MB.");
      event.target.value = "";
      setFile(null);
      return;
    }
    if (chosen.size > MAX_FILE_BYTES) {
      setFileError("Ukuran bukti harus antara 1 KB hingga 5 MB.");
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
    if (!resolvedAmount || resolvedAmount <= 0 || !Number.isFinite(resolvedAmount))
      nextErrors.amount = "Masukkan nominal donasi terlebih dahulu.";
    if (!file) nextErrors.evidence = "Bukti transfer wajib diunggah.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.set("fullName", fullName.trim());
      payload.set("email", email.trim());
      payload.set("phone", phone.trim());
      payload.set("amount", String(resolvedAmount));
      payload.set("method", method);
      if (notes.trim()) payload.set("notes", notes.trim());
      payload.set("evidence", file!);
      const res = await fetch("/api/donasi/uang", { method: "POST", body: payload });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNotice(
          data.message ?? "Terjadi kesalahan saat mengirim donasi. Coba lagi."
        );
        return;
      }
      router.push(`/donasi/uang/konfirmasi?ref=${encodeURIComponent(data.reference)}`);
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
        className="flex items-start gap-2 rounded-field bg-surface-blue/60 px-4 py-3 text-sm text-primary-deep"
      >
        <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Donasi kamu mendukung pengadaan buku baru, biaya kegiatan literasi
          anak, dan operasional pojok baca ReteMali.
        </p>
      </div>

      <UserFields
        fullName={fullName}
        email={email}
        phone={phone}
        prefillName={prefillName}
        setFullName={setFullName}
        setEmail={setEmail}
        setPhone={setPhone}
        errors={errors}
      />

      <div className="space-y-3 rounded-card border border-surface-soft bg-white p-4">
        <h3 className="text-base font-bold text-primary-deep">
          Pilih Nominal Donasi
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {AMOUNT_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setPresetAmount(value);
                setCustomAmount("");
              }}
              aria-pressed={Boolean(
                (!customAmount.trim() && presetAmount === value)
              )}
              className={`rounded-field border px-3 py-2.5 text-sm font-bold transition-colors ${
                !customAmount.trim() && presetAmount === value
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-ink hover:border-primary/60"
              }`}
            >
              {formatRupiah(value)}
            </button>
          ))}
        </div>
        <Input
          id="don-nominal-custom"
          label="Nominal Kustom Lainnya"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Atau masukkan nominal kustom lainnya (Rp)…"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          error={errors.amount}
        />

        <h3 className="pt-1 text-base font-bold text-primary-deep">
          Metode Pembayaran
        </h3>
        <PaymentChannelPicker payment={payment} method={method} setMethod={setMethod} />

        <EvidenceUploader
          file={file}
          fileError={fileError}
          errors={errors}
          onFileChange={onFileChange}
        />

        <Textarea
          id="don-catatan"
          label="Catatan (opsional)"
          maxLength={500}
          placeholder="Doa/pesan untuk ReteMali, atau keterangan lain"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

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
        Lanjutkan Pembayaran Donasi
      </Button>
      <p className="text-center text-xs text-ink-soft">
        Setelah bukti diunggah, donasi berstatus{" "}
        <strong>menunggu verifikasi Admin</strong> — bukan otomatis berhasil.
      </p>
    </form>
  );
}

function PaymentChannelPicker({
  payment,
  method,
  setMethod,
}: {
  payment: PaymentInstructionsProps;
  method: "qris" | "bank_transfer";
  setMethod: (value: "qris" | "bank_transfer") => void;
}) {
  const hasQris = Boolean(payment.qrisImageUrl);
  const hasBank = Boolean(payment.bankName && payment.bankAccountNumber);

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="sr-only">Metode pembayaran</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              { value: "qris", label: "QRIS", disabledNote: hasQris ? null : "belum aktif" },
              {
                value: "bank_transfer",
                label: "Transfer Bank",
                disabledNote: hasBank ? null : "belum aktif",
              },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-field border px-3 py-2.5 text-sm transition-colors ${
                method === option.value
                  ? "border-primary bg-surface-blue/60 font-semibold text-primary-deep"
                  : "border-surface-soft bg-white text-ink-soft"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="don-method"
                  value={option.value}
                  checked={method === option.value}
                  onChange={() => setMethod(option.value)}
                  className="h-4 w-4 accent-[#1B5EB8]"
                />
                {option.label}
              </span>
              {option.disabledNote ? (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#8a5807]">
                  {option.disabledNote}
                </span>
              ) : null}
            </label>
          ))}
        </div>
      </fieldset>

      {hasQris && method === "qris" ? (
        <div
          role="note"
          className="flex flex-wrap items-start gap-3 rounded-field border border-primary/30 bg-surface-blue/60 px-3 py-2.5 text-xs text-primary-deep"
        >
          <Image
            src={payment.qrisImageUrl as string}
            alt="Kode QRIS donasi resmi Taman Baca ReteMali"
            width={160}
            height={160}
            className="h-36 w-36 rounded-field border border-surface-soft bg-white object-contain"
          />
          <p className="max-w-60">
            Pindai dengan aplikasi pembayaran yang mendukung QRIS, lalu unggah
            bukti pembayaranmu di bawah.
          </p>
        </div>
      ) : null}

      {hasBank && method === "bank_transfer" ? (
        <div
          role="note"
          className="rounded-field border border-primary/30 bg-surface-blue/60 px-3 py-2.5 text-xs text-primary-deep"
        >
          <p className="font-semibold">Rekening Resmi Yayasan</p>
          <p className="mt-1">
            {payment.bankName} ·{" "}
            <span className="font-mono font-bold">
              {payment.bankAccountNumber}
            </span>{" "}
            a.n. {payment.bankAccountHolder}
          </p>
          <p className="mt-1">
            Transfer sesuai nominal, lalu unggah bukti transfer di bawah.
          </p>
        </div>
      ) : null}

      {(hasQris && method === "qris") || (hasBank && method === "bank_transfer") ? null : (
        <div
          role="note"
          className="flex items-start gap-2 rounded-field border border-primary/30 bg-surface-blue/60 px-3 py-2.5 text-xs text-primary-deep"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            Instruksi pembayaran resmi ({method === "qris" ? "QRIS" : "rekening bank"})
            belum dipasang pengelola pada pengaturan situs. Untuk saat ini
            lakukan pembayaran sesuai arahan bendahara ReteMali, lalu unggah
            buktinya di sini — donasi tetap tercatat dan diverifikasi dari
            bukti tersebut.
          </p>
        </div>
      )}

      {payment.donationInstructions ? (
        <p className="rounded-field bg-surface-soft/60 px-3 py-2 text-xs text-ink-soft">
          {payment.donationInstructions}
        </p>
      ) : null}
    </div>
  );
}

function EvidenceUploader({
  file,
  fileError,
  errors,
  onFileChange,
}: {
  file: File | null;
  fileError: string | null;
  errors: FieldErrors;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label
        htmlFor="don-evidence"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-field border-2 border-dashed border-primary/40 bg-surface-blue/40 px-4 py-6 text-center transition-colors hover:bg-surface-blue/70"
      >
        <FileUp className="h-6 w-6 text-primary-deep" aria-hidden />
        <span className="text-sm font-semibold text-primary-deep">
          Ketuk untuk memilih foto bukti transfer/QRIS
        </span>
        <span className="text-xs text-ink-soft">Format: JPG, PNG • Ukuran: 1 KB – 5MB</span>
        <input
          id="don-evidence"
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
            {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB) terlampir
          </span>
        </p>
      ) : null}
      {fileError ? (
        <p className="mt-2 text-xs font-medium text-danger">{fileError}</p>
      ) : null}
      {errors.evidence ? (
        <p className="mt-2 text-xs font-medium text-danger">{errors.evidence}</p>
      ) : null}
      <p className="mt-2 text-xs text-ink-soft">
        Bukti diperiksa admin dalam 1×24 jam kerja. Selama belum diverifikasi,
        status donasi tetap menunggu — tidak ada tampilan &quot;berhasil&quot; otomatis.
      </p>
    </div>
  );
}

function UserFields({
  fullName,
  email,
  phone,
  prefillName,
  setFullName,
  setEmail,
  setPhone,
  errors,
}: {
  fullName: string;
  email: string;
  phone: string;
  prefillName: string | null;
  setFullName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  errors: FieldErrors;
}) {
  return (
    <div className="space-y-4">
      {!prefillName ? (
        <p className="text-xs text-ink-soft">
          Data donatur dibutuhkan untuk surat konfirmasi &amp; pengesahan
          status donasi. Tidak perlu membuat akun.
        </p>
      ) : null}
      <Input
        id="don-nama"
        label="Nama Lengkap Donatur"
        autoComplete="name"
        placeholder="Nama donatur (boleh inisial jika ingin anonim)"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />
      <Input
        id="don-email"
        label="Alamat Email"
        type="email"
        autoComplete="email"
        placeholder="nama@contoh-email.test"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        id="don-telepon"
        label="Nomor WhatsApp Aktif"
        type="tel"
        autoComplete="tel"
        placeholder="0812-3456-7890"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
      />
    </div>
  );
}
