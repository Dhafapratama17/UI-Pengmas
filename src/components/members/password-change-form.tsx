"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface Notice {
  tone: "success" | "error";
  message: string;
}

export function PasswordChangeForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [
    errors,
    setErrors,
  ] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    const nextErrors: typeof errors = {};
    if (!currentPassword)
      nextErrors.currentPassword = "Kata sandi saat ini wajib diisi.";
    if (newPassword.length < 8)
      nextErrors.newPassword = "Kata sandi baru minimal 8 karakter.";
    if (!confirmPassword)
      nextErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    else if (confirmPassword !== newPassword)
      nextErrors.confirmPassword = "Konfirmasi tidak sama dengan kata sandi baru.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const message = data.message ?? "Gagal memperbarui kata sandi. Coba lagi.";
        setNotice({ tone: "error", message });
        return;
      }
      setNotice({ tone: "success", message: "Kata sandi berhasil diperbarui." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("Kata sandi Anda telah diperbarui.", "success");
      router.refresh();
    } catch {
      setNotice({ tone: "error", message: "Tidak dapat menghubungi server. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        id="pw-sekarang"
        label="Kata Sandi Saat Ini"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        error={errors.currentPassword}
      />
      <Input
        id="pw-baru"
        label="Kata Sandi Baru"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={errors.newPassword}
        hint="Minimal 8 karakter."
      />
      <Input
        id="pw-konfirmasi"
        label="Konfirmasi Kata Sandi Baru"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
      />
      {notice ? (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-field border px-3 py-2.5 text-xs ${
            notice.tone === "success"
              ? "border-success/30 bg-green-50 text-success"
              : "border-danger/30 bg-red-50 text-danger"
          }`}
        >
          {notice.tone === "success" ? (
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          <span>{notice.message}</span>
        </div>
      ) : null}
      <Button type="submit" loading={submitting} disabled={submitting}>
        Perbarui Kata Sandi
      </Button>
    </form>
  );
}
