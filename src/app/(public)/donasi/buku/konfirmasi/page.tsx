import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Hourglass,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DonationStatusBadge } from "@/components/donations/donation-status-badge";
import {
  formatEventDateJakarta,
  formatTimeJakarta,
} from "@/lib/util/format";
import {
  getDonationByReference,
  getSiteSettings,
} from "@/lib/services";

export const metadata: Metadata = { title: "Status Donasi Buku Fisik" };

export default async function PhysicalDonationConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [resolved, settings] = await Promise.all([searchParams, getSiteSettings()]);
  const referenceRaw = Array.isArray(resolved.ref)
    ? resolved.ref[0]
    : resolved.ref;

  const donation = referenceRaw
    ? await getDonationByReference(referenceRaw)
    : null;

  if (!donation || donation.type !== "physical") {
    return (
      <div className="mx-auto w-full max-w-xl space-y-6">
        <h1 className="text-xl font-bold text-primary-deep">
          Status Donasi Buku Fisik
        </h1>
        <Card className="space-y-3">
          <div
            role="status"
            className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-sm text-danger"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Pengajuan dengan nomor referensi tersebut tidak ditemukan atau
              bukan donasi buku fisik. Periksa kembali nomor permohonan Anda.
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href="/donasi/buku"
              className="inline-flex items-center justify-center gap-2 rounded-field bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-deep"
            >
              Ajukan Donasi Lainnya
            </a>
            <a
              href="/donasi/status"
              className="inline-flex items-center justify-center gap-2 rounded-field border border-primary/40 bg-surface-blue/60 px-4 py-2.5 text-sm font-semibold text-primary-deep transition-colors hover:bg-surface-blue"
            >
              Cari Nomor Lain
            </a>
          </div>
        </Card>
      </div>
    );
  }

  const dropOff = donation.dropOffAt;

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <a
          href="/donasi"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke pilihan donasi
        </a>
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-card border border-success/30 bg-green-50 px-4 py-4 text-sm"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-bold text-success">
              Terima kasih! Pengajuan donasi buku berhasil dicatat.
            </p>
            <p className="text-xs text-ink-soft">
              Silakan membawa buku langsung ke lokasi ReteMali sesuai jadwal
              yang telah dipilih.
            </p>
          </div>
        </div>
      </div>

      <Card className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Nomor Permohonan:{" "}
          <span className="font-mono text-ink">{donation.reference}</span>
        </p>
        <h2 className="text-lg font-bold text-ink">
          Donasi Buku Fisik — {donation.bookCount} Eksemplar
        </h2>
        <dl className="space-y-1 text-sm text-ink-soft">
          <div>Buku &amp; kategori: {donation.bookTitles}</div>
          <div>Kondisi: {donation.bookCondition}</div>
          <div>
            Janji drop-off:{" "}
            <strong className="text-ink">
              {dropOff
                ? `${formatEventDateJakarta(dropOff)}, ${formatTimeJakarta(dropOff)} WIB`
                : "-"}
            </strong>
          </div>
          {donation.notes ? <div>Catatan: {donation.notes}</div> : null}
        </dl>
        <DonationStatusBadge kind="physical" donationStatus={donation.status} />
        <div
          role="note"
          className="flex items-start gap-2 rounded-field border border-surface-soft bg-surface-blue/50 px-3 py-2.5 text-xs text-primary-deep"
        >
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="space-y-1">
            <p>
              Lokasi &amp; prosedur: serahkan buku langsung ke meja petugas
              Taman Baca ReteMali.{" "}
              {settings.address ? `Alamat: ${settings.address}.` : "Alamat lengkap belum dipasang pada pengaturan situs — titik lokasi dikonfirmasi admin."}
            </p>
            {settings.phone || settings.email ? (
              <p>
                Koordinasi lebih lanjut:{" "}
                {settings.phone ? `WA ${settings.phone}` : settings.email ?? ""}
                {settings.phone && settings.email ? ` · Email ${settings.email}` : ""}
              </p>
            ) : (
              <p>
                Kontak pengelola belum tersedia pada pengaturan situs; koordinasi
                dilakukan saat pengajuan diproses admin.
              </p>
            )}
          </div>
        </div>
        <p className="flex items-start gap-1.5 text-xs text-ink-soft">
          <Hourglass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E9A23B]" aria-hidden />
          Pengajuan ini belum menjadi konfirmasi kehadiran resmi dari admin —
          angka sokongan akan diperbarui setelah petugas menerima bukumu.
        </p>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href="/donasi"
          className="inline-flex items-center justify-center gap-2 rounded-field bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-deep"
        >
          Kembali ke Beranda Utama
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
        <a
          href="/donasi/buku"
          className="inline-flex items-center justify-center gap-2 rounded-field border border-primary/40 bg-surface-blue/60 px-4 py-2.5 text-sm font-semibold text-primary-deep transition-colors hover:bg-surface-blue"
        >
          + Ajukan Donasi Lainnya
        </a>
      </div>
    </div>
  );
}
