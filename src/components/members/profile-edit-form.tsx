"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export interface ProfileEditFormProps {
  fullName: string;
  phone: string;
  email: string;
}

interface Notice {
  tone: "success" | "error";
  message: string;
}

export function ProfileEditForm({
  fullName: initialName,
  phone: initialPhone,
  email,
}: ProfileEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    const nextErrors: { fullName?: string; phone?: string } = {};
    if (fullName.trim().length < 2)
      nextErrors.fullName = "Nama lengkap minimal 2 karakter.";
    if (phone.trim().length < 8)
      nextErrors.phone = "Nomor WhatsApp/HP minimal 8 digit.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/member/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const message = data.message ?? "Gagal memperbarui profil. Coba lagi.";
        setNotice({ tone: "error", message });
        return;
      }
      setNotice({ tone: "success", message: "Profil berhasil diperbarui." });
      toast("Profil Anda telah diperbarui.", "success");
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
        id="profil-email"
        label="Alamat Email (tidak dapat diubah)"
        type="email"
        value={email}
        disabled
        hint="Email adalah identitas akun; untuk perubahan email silakan hubungi pengelola."
      />
      <Input
        id="profil-nama"
        label="Nama Lengkap"
        autoComplete="name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />
      <Input
        id="profil-telepon"
        label="Nomor WhatsApp/HP"
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
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
        Simpan Perubahan Profil
      </Button>
    </form>
  );
}
