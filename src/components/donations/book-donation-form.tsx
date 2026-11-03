"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  Info,
  MapPin,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";

export interface BookDonationFormProps {
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  dropOffHours: string | null;
  prefillName: string | null;
  prefillEmail: string | null;
}

const CATEGORY_OPTIONS = [
  { value: "Anak", label: "Buku Anak (dongeng, sains anak)" },
  { value: "Remaja/Pelajar", label: "Buku Remaja & Pelajar" },
  { value: "Dewasa", label: "Buku Dewasa (populer, novel)" },
  { value: "Pendidikan & Referensi", label: "Pendidikan & Referensi (ensiklopedia, kamus)" },
  { value: "Campuran", label: "Campuran / beberapa kategori" },
];

const CONDITION_OPTIONS = [
  { value: "Baru", label: "Baru (belum pernah dibaca)" },
  { value: "Baik", label: "Baik (layak dibaca, komplit)" },
  { value: "Layak pakai", label: "Layak pakai (ada bekas halaman/cover)" },
  { value: "Butuh perbaikan", label: "Butuh perbaikan ringan (penjilidan/laminasi)" },
];

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  bookCount?: string;
  bookTitles?: string;
  bookCategory?: string;
  dropOffAt?: string;
}

export function BookDonationForm({
  address,
  contactPhone,
  contactEmail,
  dropOffHours,
  prefillName,
  prefillEmail,
}: BookDonationFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(prefillName ?? "");
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [phoneValue, setPhoneValue] = useState("");
  const [bookCount, setBookCount] = useState("");
  const [bookTitles, setBookTitles] = useState("");
  const [bookCategory, setBookCategory] = useState("");
  const [bookCondition, setBookCondition] = useState("Baik");
  const [notes, setNotes] = useState("");
  const [dropOffAt, setDropOffAt] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    const nextErrors: FieldErrors = {};
    if (fullName.trim().length < 2)
      nextErrors.fullName = "Nama lengkap minimal 2 karakter.";
    if (!email.includes("@") || email.includes(" "))
      nextErrors.email = "Masukkan alamat email yang valid.";
    if (phoneValue.trim().length < 8)
      nextErrors.phone = "Nomor WhatsApp/HP minimal 8 digit.";
    const count = Number(bookCount);
    if (!Number.isInteger(count) || count <= 0)
      nextErrors.bookCount = "Jumlah buku harus angka lebih dari 0.";
    if (bookTitles.trim().length < 1)
      nextErrors.bookTitles = "Tulis minimal satu judul buku.";
    if (!bookCategory) nextErrors.bookCategory = "Pilih kategori buku.";
    if (!dropOffAt) nextErrors.dropOffAt = "Pilih tanggal & jam rencana drop-off.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.set("fullName", fullName.trim());
      payload.set("email", email.trim());
      payload.set("phone", phoneValue.trim());
      payload.set("bookCount", String(count));
      payload.set("bookTitles", bookTitles.trim());
      payload.set("bookCategory", bookCategory);
      payload.set("bookCondition", bookCondition);
      if (notes.trim()) payload.set("notes", notes.trim());
      payload.set("dropOffAt", dropOffAt);
      const res = await fetch("/api/donasi/buku", { method: "POST", body: payload });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNotice(
          data.message ?? "Terjadi kesalahan saat mengirim pengajuan. Coba lagi."
        );
        return;
      }
      router.push(`/donasi/buku/konfirmasi?ref=${encodeURIComponent(data.reference)}`);
    } catch {
      setNotice("Tidak dapat menghubungi server. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div
        role="note"
        className="flex items-start gap-2.5 rounded-field border border-primary/40 bg-surface-blue/60 px-3.5 py-3 text-sm font-semibold text-primary-deep"
      >
        <Truck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <span>
          Donasi buku fisik hanya dapat dilakukan melalui drop-off langsung di
          Taman Baca ReteMali. Pengiriman melalui kurir tidak tersedia.
        </span>
      </div>

      <Input
        id="book-nama"
        label="Nama Lengkap Donatur"
        autoComplete="name"
        placeholder="Nama donatur"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />
      <Input
        id="book-email"
        label="Alamat Email"
        type="email"
        autoComplete="email"
        placeholder="nama@contoh-email.test"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        id="book-telepon"
        label="Nomor WhatsApp Aktif"
        type="tel"
        autoComplete="tel"
        placeholder="0812-3456-7890"
        value={phoneValue}
        onChange={(e) => setPhoneValue(e.target.value)}
        error={errors.phone}
      />
      <Input
        id="book-jumlah"
        label="Jumlah Buku"
        type="number"
        inputMode="numeric"
        min={1}
        placeholder="Contoh: 12"
        value={bookCount}
        onChange={(e) => setBookCount(e.target.value)}
        error={errors.bookCount}
      />
      <Textarea
        id="book-daftar"
        label="Daftar Buku / Judul yang Didonasikan"
        placeholder="Judul buku, pisahkan dengan koma. Contoh: Ensiklopedia Sains untuk Anak, Gerbang Dunia Dongeng"
        value={bookTitles}
        onChange={(e) => setBookTitles(e.target.value)}
        error={errors.bookTitles}
      />
      <Select
        id="book-kategori"
        label="Kategori Buku"
        options={[{ value: "", label: "Pilih kategori…" }, ...CATEGORY_OPTIONS]}
        value={bookCategory}
        onChange={(e) => setBookCategory(e.target.value)}
      />
      {errors.bookCategory ? (
        <p className="-mt-3 text-xs font-medium text-danger">{errors.bookCategory}</p>
      ) : null}
      <Select
        id="book-kondisi"
        label="Kondisi Buku"
        options={CONDITION_OPTIONS}
        value={bookCondition}
        onChange={(e) => setBookCondition(e.target.value)}
      />
      <Input
        id="book-dropoff"
        label="Rencana Tanggal & Jam Drop-off"
        type="datetime-local"
        value={dropOffAt}
        onChange={(e) => setDropOffAt(e.target.value)}
        error={errors.dropOffAt}
      />
      <Textarea
        id="book-catatan"
        label="Catatan (opsional)"
        maxLength={500}
        placeholder="Info tambahan untuk petugas, mis. sebagian buku untuk anak SD"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div
        role="note"
        className="space-y-1.5 rounded-field border border-surface-soft bg-surface-blue/50 px-3.5 py-3 text-xs text-primary-deep"
      >
        <p className="flex items-center gap-1.5 font-bold">
          <MapPin className="h-4 w-4" aria-hidden />
          Lokasi &amp; Prosedur Penyerahan
        </p>
        {address ? (
          <p>Alamat: {address}</p>
        ) : (
          <p>
            Alamat lengkap belum dipasang pengelola pada pengaturan situs.
            Titik lokasi akan dikonfirmasi admin saat pengajuanmu diproses —
            jangan berasumsi memakai alamat lain.
          </p>
        )}
        <p>
          Jam layanan: {dropOffHours ?? "akan dikonfirmasi admin (belum diatur pada situs)"}
        </p>
        <p>
          Serahkan buku langsung ke meja petugas/pengelola, lalu petugas
          mencatat penerimaan. Email: {contactEmail ?? "belum tersedia"} · WA:{" "}
          {contactPhone ?? "belum tersedia"}
        </p>
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
        Isi Janji Drop-Off Buku
      </Button>
      <p className="flex items-start gap-1.5 text-xs text-ink-soft">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Pengajuan ini tercatat dengan nomor permohonan; penyerahan tetap
        diverifikasi petugas saat buku datang.
      </p>
    </form>
  );
}
