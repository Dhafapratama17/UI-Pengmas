import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  Hourglass,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DonationStatusBadge } from "@/components/donations/donation-status-badge";
import {
  formatEventDateJakarta,
  formatRupiah,
  formatTimeJakarta,
} from "@/lib/util/format";
import {
  getDonationByReference,
  getDonationPayment,
} from "@/lib/services";

export const metadata: Metadata = { title: "Status Donasi Finansial" };

const METHOD_LABELS: Record<string, string> = {
  qris: "QRIS",
  bank_transfer: "Transfer Bank",
};

export default async function FinancialDonationConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const referenceRaw = Array.isArray(resolved.ref)
    ? resolved.ref[0]
    : resolved.ref;

  const donation = referenceRaw
    ? await getDonationByReference(referenceRaw)
    : null;

  if (!donation || donation.type !== "financial") {
    return (
      <div className="mx-auto w-full max-w-xl space-y-6">
        <h1 className="text-xl font-bold text-primary-deep">
          Status Donasi Finansial
        </h1>
        <Card className="space-y-3">
          <div
            role="status"
            className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-sm text-danger"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Donasi dengan nomor referensi tersebut tidak ditemukan atau bukan
              donasi finansial. Periksa kembali nomor referensi Anda.
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href="/donasi/uang"
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

  const payment = await getDonationPayment(donation.id);

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
          <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-bold text-success">
              Terima Kasih atas Dukungan Anda!
            </p>
            <p className="text-xs text-ink-soft">
              Setiap rupiah dan buku yang Anda donasikan menghidupkan ruang
              literasi anak-anak dan masyarakat di Taman Baca ReteMali.
            </p>
          </div>
        </div>
      </div>

      <Card className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Nomor Referensi:{" "}
          <span className="font-mono text-ink">{donation.reference}</span>
        </p>
        <h2 className="text-lg font-bold text-ink">
          Donasi Finansial — {formatRupiah(donation.amount ?? 0)}
        </h2>
        <dl className="space-y-1 text-sm text-ink-soft">
          <div>
            Metode: {METHOD_LABELS[donation.paymentMethod ?? ""] ?? donation.paymentMethod}
          </div>
          <div>
            Waktu: {formatEventDateJakarta(donation.createdAt)},{" "}
            {formatTimeJakarta(donation.createdAt)} WIB
          </div>
          <div>
            Donatur: {donation.donorName} ({donation.donorEmail})
          </div>
        </dl>
        <DonationStatusBadge kind="financial" paymentStatus={payment?.status ?? null} />
        <StatusFootnote
          paymentStatus={payment?.status ?? null}
          rejectionReason={payment?.rejectionReason ?? null}
        />
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
          href="/donasi/uang"
          className="inline-flex items-center justify-center gap-2 rounded-field border border-primary/40 bg-surface-blue/60 px-4 py-2.5 text-sm font-semibold text-primary-deep transition-colors hover:bg-surface-blue"
        >
          + Ajukan Donasi Lainnya
        </a>
      </div>
    </div>
  );
}

function StatusFootnote({
  paymentStatus,
  rejectionReason,
}: {
  paymentStatus: "pending" | "verified" | "rejected" | null;
  rejectionReason: string | null;
}) {
  if (paymentStatus === "rejected") {
    return (
      <p className="flex items-start gap-1.5 text-xs text-ink-soft">
        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" aria-hidden />
        Bukti tidak lolos verifikasi. Catatan admin:{" "}
        {rejectionReason ?? "tidak tersedia"} — ajukan kembali dengan bukti baru.
      </p>
    );
  }
  if (paymentStatus === "verified") {
    return (
      <p className="text-xs text-ink-soft">
        Donasi telah diverifikasi bendahara dan layak masuk kas ReteMali.
      </p>
    );
  }
  return (
    <p className="flex items-start gap-1.5 text-xs text-ink-soft">
      <Hourglass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E9A23B]" aria-hidden />
      Donasi kamu telah tercatat dan akan diverifikasi sesuai prosedur — belum
      dinyatakan diterima sampai admin memperiksa bukti.
    </p>
  );
}
