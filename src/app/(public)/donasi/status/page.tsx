import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, Search } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import {
  getDonationByReference,
} from "@/lib/services";

export const metadata: Metadata = { title: "Status & Riwayat Donasi" };

export default async function DonationStatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const referenceRaw = Array.isArray(resolved.ref)
    ? resolved.ref[0]
    : resolved.ref;
  const reference = referenceRaw?.trim() ?? "";

  if (reference) {
    const donation = await getDonationByReference(reference);
    if (!donation) {
      return <StatusNotFound />;
    }
    redirect(
      donation.type === "financial"
        ? `/donasi/uang/konfirmasi?ref=${encodeURIComponent(donation.reference)}`
        : `/donasi/buku/konfirmasi?ref=${encodeURIComponent(donation.reference)}`
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <SectionTitle
        title="Status &amp; Riwayat Donasi"
        description="Masukkan nomor referensi donasi Anda (DON-… untuk finansial, DONB-… untuk buku fisik)."
      />
      <Card>
        <form action="/donasi/status" method="get" className="space-y-3">
          <label
            htmlFor="donasi-ref"
            className="block text-sm font-semibold text-ink"
          >
            Nomor Referensi Donasi
          </label>
          <input
            id="donasi-ref"
            name="ref"
            type="text"
            required
            placeholder="DON-2026-0001"
            className="w-full rounded-field border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-field bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-deep"
          >
            <Search className="h-4 w-4" aria-hidden />
            Periksa Status Donasi
          </button>
        </form>
      </Card>
    </div>
  );
}

function StatusNotFound() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <h1 className="text-xl font-bold text-primary-deep">
        Status &amp; Riwayat Donasi
      </h1>
      <Card className="space-y-3">
        <div
          role="status"
          className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-sm text-danger"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Nomor referensi tidak ditemukan. Pastikan formatnya seperti
            DON-2026-0001 atau DONB-2026-0002 — nomor muncul setelah pengajuan
            donasi berhasil dikirim.
          </span>
        </div>
        <form action="/donasi/status" method="get" className="space-y-3">
          <input
            id="donasi-ref-2"
            name="ref"
            type="text"
            required
            placeholder="DON-2026-0001"
            className="w-full rounded-field border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-field bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-deep"
          >
            Coba Nomor Lain
          </button>
        </form>
      </Card>
    </div>
  );
}
