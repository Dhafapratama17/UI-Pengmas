"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { SiteSettings } from "@/types/db";

interface Notice {
  tone: "success" | "error";
  message: string;
}

type FormState = Record<keyof SiteSettings, string>;

function emptyForm(): FormState {
  return {
    address: "",
    mapsUrl: "",
    instagramUrl: "",
    phone: "",
    email: "",
    qrisImageUrl: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
    donationInstructions: "",
  };
}

function formFromSettings(settings: SiteSettings): FormState {
  const form = emptyForm();
  for (const key of Object.keys(form) as (keyof SiteSettings)[]) {
    form[key] = settings[key] ?? "";
  }
  return form;
}

const fieldMeta: {
  key: keyof SiteSettings;
  label: string;
  hint?: string;
}[] = [
  { key: "address", label: "Alamat Perpustakaan" },
  {
    key: "mapsUrl",
    label: "URL Google Maps",
    hint: "Tautan lokasi di peta, mis. https://maps.google.com/…",
  },
  {
    key: "instagramUrl",
    label: "URL Instagram Resmi",
    hint: "Tautan akun resmi, mis. https://www.instagram.com/…",
  },
  { key: "phone", label: "Nomor Telepon/WhatsApp", hint: "Kosongkan bila belum tersedia." },
  { key: "email", label: "Email Kontak", hint: "Gunakan email resmi organisasi." },
  {
    key: "qrisImageUrl",
    label: "URL Gambar QRIS",
    hint: "Kosongkan bila QRIS resmi belum disediakan — jangan diisi data fiktif.",
  },
  { key: "bankName", label: "Nama Bank Rekening Resmi" },
  { key: "bankAccountNumber", label: "Nomor Rekening Resmi" },
  { key: "bankAccountHolder", label: "Nama Pemilik Rekening" },
  {
    key: "donationInstructions",
    label: "Instruksi Donasi",
    hint: "Petunjuk alur donasi uang/buku yang ditampilkan publik.",
  },
];

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(formFromSettings(settings));
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const send = async () => {
    setNotice(null);
    setSubmitting(true);
    const payload: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(form)) {
      payload[key] = value.trim() === "" ? null : value.trim();
    }
    const res = await fetch("/api/admin/pengaturan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setNotice({
        tone: "error",
        message: data.message ?? "Tidak dapat menghubungi server. Coba lagi.",
      });
      setSubmitting(false);
      return;
    }
    toast("Pengaturan website berhasil disimpan.", "success");
    setSubmitting(false);
    router.refresh();
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      {fieldMeta.map((field) =>
        field.key === "donationInstructions" ? (
          <Textarea
            key={field.key}
            id={`pengaturan-${field.key}`}
            label={field.label}
            hint={field.hint}
            value={form[field.key]}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
            }
          />
        ) : (
          <Input
            key={field.key}
            id={`pengaturan-${field.key}`}
            label={field.label}
            hint={field.hint}
            value={form[field.key]}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
            }
          />
        )
      )}

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
        Simpan Pengaturan
      </Button>
    </form>
  );
}
