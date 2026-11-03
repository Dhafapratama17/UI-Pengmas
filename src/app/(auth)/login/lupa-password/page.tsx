"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function RecoveryForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [mockSimulation, setMockSimulation] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    if (!email.includes("@") || email.includes(" ")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/lupa-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNotice(
          data.message ?? "Terjadi kesalahan saat mengirim tautan pemulihan. Coba lagi.",
        );
        return;
      }
      setMockSimulation(data.delivered === "mock_simulation");
      setSent(true);
    } catch {
      setNotice("Tidak dapat menghubungi server. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <div
          role="status"
          className="flex items-start gap-3 rounded-field border border-success/30 bg-green-50 p-4"
        >
          <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
          <div className="space-y-1 text-sm">
            <p className="font-bold text-success">
              Email Pemulihan Berhasil Dikirim!
            </p>
            <p className="text-ink-soft">
              Silakan periksa kotak masuk atau folder spam email Anda. Klik
              tautan pemulihan yang kami kirimkan dalam waktu 30 menit.
            </p>
            {mockSimulation ? (
              <p className="text-xs text-ink-soft">
                Mode demo (mock): tidak ada email sungguhan yang dikirim —
                status terkirim di atas adalah simulasi. Pemulihan via
                Supabase Auth aktif pada mode supabase.
              </p>
            ) : null}
          </div>
        </div>
        <Link href="/login" className="block">
          <Button variant="secondary" className="w-full">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke Halaman Masuk
          </Button>
        </Link>
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
        id="lupa-password-email"
        label="Alamat Email Akun Anda"
        type="email"
        autoComplete="email"
        placeholder="nama.pengguna@contoh-email.test"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
      />
      <Button type="submit" loading={submitting} disabled={submitting} className="w-full">
        Kirim Tautan Pemulihan
      </Button>
    </form>
  );
}

export default function ForgotPasswordPage() {
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
          Atur Ulang Kata Sandi
        </h1>
      </div>

      <div className="space-y-4">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-blue"
          aria-hidden
        >
          <Lock className="h-6 w-6 text-primary-deep" />
        </div>
        <p className="rounded-field bg-surface-blue/60 px-4 py-3 text-sm text-ink">
          Masukkan alamat email yang terdaftar. Kami akan mengirimkan
          instruksi dan tautan verifikasi aman untuk memperbarui kata sandi
          Anda.
        </p>
        <Card>
          <RecoveryForm />
        </Card>
        <Link href="/login" className="block">
          <Button variant="secondary" className="w-full">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke Halaman Masuk
          </Button>
        </Link>
      </div>
    </div>
  );
}
