import type { Metadata } from "next";
import { ArrowLeft, BookUp2, CalendarClock } from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { BookDonationForm } from "@/components/donations/book-donation-form";
import { getSiteSettings } from "@/lib/services";

export const metadata: Metadata = { title: "Donasi Buku Fisik" };

export default async function DonasiBukuPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <Link
        href="/donasi"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke pilihan donasi
      </Link>
      <SectionTitle
        title="Donasi Buku Fisik"
        description="Program penerimaan buku untuk koleksi pojok baca — penyerahan hanya melalui drop-off langsung."
      />

      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-primary-deep">
          <BookUp2 className="h-5 w-5" aria-hidden />
          Buku yang Diterima
        </h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-ink-soft">
          <li>Ensiklopedia &amp; referensi anak</li>
          <li>Fiksi remaja &amp; dongeng anak</li>
          <li>Sains populer</li>
        </ul>
        <p className="text-xs text-ink-soft">
          Kondisi minimal 60% masih baik — bukan halaman lepas/rusak total.
          Petugas berhak menolak buku di luar ketentuan saat serah terima.
        </p>
        <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-deep">
          <CalendarClock className="h-4 w-4" aria-hidden />
          Waktu drop-off mengikuti jam layanan taman baca; pilih slot di
          formulir di bawah, lalu datang sesuai jadwal yang dipilih.
        </p>
      </Card>

      <Card className="p-0">
        <div className="p-6">
          <BookDonationForm
            address={settings.address}
            contactPhone={settings.phone}
            contactEmail={settings.email}
            dropOffHours={settings.donationInstructions}
            prefillName={null}
            prefillEmail={null}
          />
        </div>
      </Card>
    </div>
  );
}
