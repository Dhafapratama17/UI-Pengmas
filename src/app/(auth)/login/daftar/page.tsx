"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert, CircleCheck, Eye, EyeOff, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreedTerms?: string;
}

function RegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [successMemberNo, setSuccessMemberNo] = useState<string | null>(null);

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
    if (password.length < 8)
      nextErrors.password = "Kata sandi minimal 8 karakter.";
    if (confirmPassword !== password)
      nextErrors.confirmPassword = "Konfirmasi kata sandi tidak sama.";
    if (!agreedTerms)
      nextErrors.agreedTerms = "Persetujuan ketentuan anggota wajib dicentang.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
          agreedTerms,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNotice(
          data.message ?? "Terjadi kesalahan saat mengirim pendaftaran. Coba lagi.",
        );
        return;
      }
      setSuccessMemberNo(data.memberNo as string);
    } catch {
      setNotice("Tidak dapat menghubungi server. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successMemberNo) {
    return (
      <div className="space-y-4">
        <div
          role="status"
          className="flex items-start gap-3 rounded-field border border-success/30 bg-green-50 p-4"
        >
          <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
          <div className="space-y-1 text-sm">
            <p className="font-bold text-success">
              Pendaftaran Berhasil Dikirim!
            </p>
            <p className="text-ink">
              Nomor anggota Anda:{" "}
              <span className="font-mono font-bold text-ink">
                {successMemberNo}
              </span>
            </p>
            <p className="text-ink-soft">
              Akun member masih menunggu verifikasi keanggotaan oleh admin —
              fitur peminjaman dan reservasi aktif setelah verifikasi. Anda
              dapat masuk kapan saja dengan email dan kata sandi yang
              didaftarkan.
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/login" className="inline-block">
            <Button variant="secondary" className="w-full">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Masuk di sini
            </Button>
          </Link>
          <Link href="/beranda" className="inline-block">
            <Button className="w-full">Jelajahi aplikasi publik</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {notice ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-xs text-danger"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{notice}</span>
        </div>
      ) : null}
      <Input
        id="daftar-nama"
        label="Nama Lengkap (Sesuai Identitas)"
        autoComplete="name"
        placeholder="Contoh: Siti Rahmawati"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />
      <Input
        id="daftar-email"
        label="Alamat Email Aktif"
        type="email"
        autoComplete="email"
        placeholder="siti.rahmawati@contoh-email.test"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        id="daftar-telepon"
        label="Nomor WhatsApp / HP"
        type="tel"
        autoComplete="tel"
        placeholder="0812-3456-7890"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
      />
      <Input
        id="daftar-sandi"
        label="Kata Sandi (Min. 8 Karakter)"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        trailingNode={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        }
      />
      <Input
        id="daftar-sandi-konfirmasi"
        label="Konfirmasi Kata Sandi"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
      />
      <div>
        <label
          htmlFor="daftar-persetujuan"
          className="flex items-start gap-2 text-sm text-ink"
        >
          <input
            id="daftar-persetujuan"
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#1B5EB8]"
          />
          <span>
            Saya menyetujui Ketentuan Anggota &amp; Kebijakan Privasi ReteMali
          </span>
        </label>
        {errors.agreedTerms ? (
          <p className="mt-1.5 text-xs font-medium text-danger">
            {errors.agreedTerms}
          </p>
        ) : null}
      </div>
      <Button type="submit" loading={submitting} disabled={submitting} className="w-full">
        <UserPlus className="h-4 w-4" aria-hidden />
        Daftar Sebagai Member ReteMali
      </Button>
      <p className="text-center text-sm text-ink-soft">
        Sudah memiliki akun terdaftar?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary-deep underline-offset-4 hover:underline"
        >
          Masuk di sini
        </Link>
      </p>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        Perlindungan Data Aman • Taman Baca ReteMali
      </p>
    </form>
  );
}

export default function MemberRegistrationPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/login"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-primary-deep">
          Registrasi Member Baru
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Daftar sekarang untuk meminjam buku, reservasi kegiatan komunitas,
          dan menikmati fasilitas digital ReteMali.
        </p>
      </div>

      <Card>
        <RegistrationForm />
      </Card>
    </div>
  );
}
